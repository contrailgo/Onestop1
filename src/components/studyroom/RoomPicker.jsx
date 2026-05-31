import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3001/api";

const steps = [
  { id: 1, label: "날짜 선택" },
  { id: 2, label: "건물 선택" },
  { id: 3, label: "호실 선택" },
];

const ROOM_DATA = {
  "어문학관-1": ["1호실", "2호실", "3호실", "4호실"],
  "어문학관-2": ["5호실", "6호실", "7호실"],
  "자연과학관-1": ["1호실", "2호실"],
  "인문경상관-1": ["101호", "102호", "103호"],
  "백년관-1": ["5호실", "6호실", "7호실", "8호실"],
  "백년관-2": ["9호실"],
  "교수학습개발원-1": ["스터디 1", "스터디 2", "스터디 3", "스터디 4"],
  "교수학습개발원-2": ["말하기 1 (2인용)", "말하기 2 (2인용)", "말하기 3 (2인용)", "말하기 4 (2인용)"],
  "교수학습개발원-3": ["말하기 5 (2인용) 장애인우선배정", "말하기 6 (2인용)", "말하기 7 (2인용)", "말하기 8 (2인용)"],
  "교수학습개발원-4": ["말하기 9 (2인용)", "말하기 10 (2인용)"],
};

const generateSlots = () => {
  const slots = [];
  for (let h = 9; h <= 21; h++) {
    const endH30 = h === 21 ? 22 : h + 1;
    slots.push({ id: `${h}:00`, hour: h, minute: 0, label: `${String(h).padStart(2, "0")}:00 ~ ${String(h).padStart(2, "0")}:30` });
    slots.push({ id: `${h}:30`, hour: h, minute: 30, label: `${String(h).padStart(2, "0")}:30 ~ ${String(endH30).padStart(2, "0")}:00` });
  }
  return slots;
};

const SLOTS = generateSlots();

const groupByHour = () => {
  const groups = {};
  SLOTS.forEach((slot, idx) => {
    if (!groups[slot.hour]) groups[slot.hour] = [];
    groups[slot.hour].push({ ...slot, idx });
  });
  return groups;
};

const HOUR_GROUPS = groupByHour();

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function RoomPicker({ building, user, selectedDate, onPrev, onNext, onBack }) {
  const rooms = ROOM_DATA[building?.name] || [];
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startIdx, setStartIdx] = useState(null);
  const [endIdx, setEndIdx] = useState(null);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 선택한 호실+날짜의 예약된 슬롯 불러오기
  useEffect(() => {
    if (!selectedRoom || !selectedDate || !building) return;
    fetch(`${API_BASE}/reservations/slots?date=${selectedDate}&building=${encodeURIComponent(building.name)}&room=${encodeURIComponent(selectedRoom)}&type=studyroom`)
      .then(r => r.json())
      .then(data => { if (data.success) setReservedSlots(data.data); })
      .catch(() => {});
  }, [selectedRoom, selectedDate, building]);

  const isReserved = (slot) => {
    const slotStart = timeToMinutes(`${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`);
    const slotEnd = slotStart + 30;
    return reservedSlots.some(r => {
      const rStart = timeToMinutes(r.start_time);
      const rEnd = timeToMinutes(r.end_time);
      return slotStart < rEnd && rStart < slotEnd;
    });
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setStartIdx(null);
    setEndIdx(null);
    setReservedSlots([]);
  };

  const handleSlotClick = (idx) => {
    if (isReserved(SLOTS[idx])) return;
    if (startIdx !== null && endIdx !== null) { setStartIdx(null); setEndIdx(null); return; }
    if (startIdx === null) { setStartIdx(idx); return; }
    if (idx === startIdx) { setStartIdx(null); return; }
    setStartIdx(Math.min(startIdx, idx));
    setEndIdx(Math.max(startIdx, idx));
  };

  const isInRange = (idx) => {
    if (startIdx === null) return false;
    if (endIdx === null) return idx === startIdx;
    return idx >= startIdx && idx <= endIdx;
  };

  const getStartTime = () => {
    if (startIdx === null) return null;
    const s = SLOTS[startIdx];
    return `${String(s.hour).padStart(2, "0")}:${String(s.minute).padStart(2, "0")}`;
  };

  const getEndTime = () => {
    const e = SLOTS[endIdx ?? startIdx];
    const endMin = (e.hour * 60 + e.minute) + 30;
    return `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
  };

  const getTimeLabel = () => {
    if (startIdx === null) return null;
    return `${getStartTime()} ~ ${getEndTime()}`;
  };

  const canConfirm = selectedRoom && startIdx !== null && endIdx !== null;

  const handleSubmit = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "studyroom",
          date: selectedDate,
          building: building.name,
          room: selectedRoom,
          start_time: getStartTime(),
          end_time: getEndTime(),
          username: user?.student_id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`예약 완료!\n호실: ${selectedRoom}\n시간: ${getTimeLabel()}`);
        onNext && onNext({ room: selectedRoom, time: getTimeLabel() });
      } else {
        alert(data.message || "예약에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 12 }}>
        <button className="gray-btn" onClick={onBack}>← 메인으로</button>
      </div>
      <div className="step-box">
        <div className="steps">
          {steps.map((step) => (
            <div key={step.id} className={`step ${step.id === 3 ? "active" : step.id < 3 ? "done" : ""}`}>
              <span className="step-number">{step.id}</span>
              {step.label}
            </div>
          ))}
        </div>
        <div className="section">
          <div className="section-header">
            <div>
              <h2>3. 호실 선택</h2>
              <p>{building?.name}의 호실과 시간을 선택합니다. (날짜: {selectedDate})</p>
            </div>
          </div>

          <table className="select-table" style={{ marginBottom: 24 }}>
            <thead>
              <tr>
                <th>호실</th>
                <th className="right">선택</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room} className={selectedRoom === room ? "selected-row" : ""} onClick={() => handleRoomClick(room)}>
                  <td>{room}</td>
                  <td className="right">
                    <button type="button" className="select-action-btn" onClick={(e) => { e.stopPropagation(); handleRoomClick(room); }}>
                      <span className="arrow-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedRoom && (
            <div className="time-card" style={{ maxHeight: 420, overflowY: "auto" }}>
              <div className="time-title">{selectedRoom}</div>
              {Object.entries(HOUR_GROUPS).map(([hour, slots]) => (
                <div className="time-row" key={hour}>
                  <div className="hour">{hour}시</div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    {slots.map((slot) => {
                      const reserved = isReserved(slot);
                      const inRange = isInRange(slot.idx);
                      const cls = ["slot", reserved ? "reserved" : "", inRange ? "selected" : ""].join(" ").trim();
                      return (
                        <button key={slot.idx} type="button" className={cls} disabled={reserved} onClick={() => handleSlotClick(slot.idx)}>
                          {slot.label}{reserved ? " (예약됨)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="button-area">
            <button className="gray-btn" onClick={onPrev}>← 이전 단계</button>
            <button className="primary-btn" disabled={!canConfirm || submitting} onClick={handleSubmit}>
              {submitting ? "예약 중..." : "대실 예약 →"}
            </button>
          </div>
        </div>
      </div>
      <div className="footer">정보처 정보시스템팀</div>
    </div>
  );
}