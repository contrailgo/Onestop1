import { useState, useMemo } from "react";
import { classroomData, buildings as defaultBuildings, fixedReservedSlots } from "./classroomData.js";
import {
  formatRoomLabel,
  getStatusClass,
  getStatusText,
  isTimeOverlap,
  makeDateKey,
  makeTimeSlots,
  pad2,
} from "./reservationUtils.js";

const stepNames = ["날짜 선택", "건물 선택", "강의실 선택", "기타 정보 및 시간 선택"];
const today = new Date();

export default function ClassroomApp({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [contact, setContact] = useState("");
  const [purpose, setPurpose] = useState("");
  const [groupType, setGroupType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rooms = classroomData;

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  function isFixedSlotReserved(roomId, slot) {
    return fixedReservedSlots.some((r) =>
      r.roomId === roomId && isTimeOverlap(slot.startTime, slot.endTime, r.startTime, r.endTime)
    );
  }

  function isUserSlotReserved(roomId, date, slot) {
    return reservations.some((r) => {
      if (r.roomId !== roomId || r.date !== date || r.status === "취소됨") return false;
      return r.times?.some((t) => isTimeOverlap(slot.startTime, slot.endTime, t.startTime, t.endTime));
    });
  }

  function isSlotReserved(roomId, date, slot) {
    return isFixedSlotReserved(roomId, slot) || isUserSlotReserved(roomId, date, slot);
  }

  function getRoomStatus(room) {
    if (room.status === "viewOnly") return "viewOnly";
    if (!selectedDate) return "available";
    const slots = makeTimeSlots(room);
    const reservedCount = slots.filter((s) => isSlotReserved(room.id, selectedDate, s)).length;
    if (reservedCount === 0) return "available";
    if (reservedCount === slots.length) return "closed";
    return "partial";
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setSelectedBuilding("");
    setSelectedRoomId(null);
    setSelectedTimes([]);
  }

  function handleSelectBuilding(building) {
    setSelectedBuilding(building);
    setSelectedRoomId(null);
    setSelectedTimes([]);
  }

  function handleSelectRoom(id, status, direct) {
    const canSelect = status === "available" || status === "partial";
    if (!canSelect) return;
    setSelectedRoomId(id);
    setSelectedTimes([]);
    if (direct) setCurrentStep(4);
  }

  function handleToggleTime(slot) {
    setSelectedTimes((prev) => {
      const exists = prev.some((t) => t.id === slot.id);
      return exists ? prev.filter((t) => t.id !== slot.id) : [...prev, slot];
    });
  }

  function handleSubmit() {
    if (!contact) { alert("연락처를 입력해주세요."); return; }
    if (!groupType) { alert("단체 유형을 선택해주세요."); return; }
    if (!purpose) { alert("대실 사유를 입력해주세요."); return; }
    if (selectedTimes.length === 0) { alert("시간을 선택해주세요."); return; }

    setSubmitting(true);
    setTimeout(() => {
      const newReservation = {
        id: Date.now(),
        userId: "test-user",
        date: selectedDate,
        building: selectedBuilding,
        roomId: selectedRoomId,
        roomNumber: selectedRoom.roomNumber,
        times: selectedTimes,
        contact,
        groupType,
        purpose,
        status: "승인 대기",
        createdAt: new Date().toISOString(),
      };
      setReservations((prev) => [...prev, newReservation]);
      alert("예약이 완료되었습니다!");
      setCurrentStep(1);
      setSelectedDate("");
      setSelectedBuilding("");
      setSelectedRoomId(null);
      setSelectedTimes([]);
      setContact("");
      setPurpose("");
      setGroupType("");
      setSubmitting(false);
    }, 800);
  }

  // 달력 데이터
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const availableCount = (() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const day = date.getDay();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (date >= todayMidnight && day !== 0 && day !== 6) count++;
    }
    return count;
  })();

  const monthLabel = `${viewYear}-${pad2(viewMonth + 1)}`;

  const filteredRooms = rooms.filter((r) => r.building === selectedBuilding);

  const slots = selectedRoom ? makeTimeSlots(selectedRoom) : [];
  const selectedTimeText = selectedTimes.length > 0
    ? selectedTimes.map((t) => t.label).join(", ")
    : "미선택";

  return (
    <div className="page">
      {/* 뒤로가기 */}
      <div style={{ marginBottom: 12 }}>
        <button className="gray-btn" onClick={onBack}>← 메인으로</button>
      </div>

      {/* 예약 내역 */}
      {reservations.length > 0 && (
        <div className="panel">
          <div className="panel-title">나의 예약 내역</div>
          <div className="history-list">
            {reservations.map((r) => (
              <div className="history-item" key={r.id}>
                <div>
                  <strong>{r.building} {formatRoomLabel(r.roomNumber)}</strong>
                  <p>{r.date} / {r.times.map((t) => t.label).join(", ")}</p>
                  <p>단체: {r.groupType} / 사유: {r.purpose}</p>
                </div>
                <div>
                  <span className="status available">{r.status}</span>
                  <button
                    className="gray-btn"
                    onClick={() => setReservations((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "취소됨" } : x))}
                  >
                    취소
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-box">
        {/* 단계 표시 */}
        <div className="steps">
          {stepNames.map((name, i) => {
            const stepId = i + 1;
            let cls = "step";
            if (stepId === currentStep) cls += " active";
            else if (stepId < currentStep) cls += " done";
            return (
              <div key={stepId} className={cls} onClick={() => setCurrentStep(stepId)}>
                <span className="step-number">{stepId}</span>
                {name}
              </div>
            );
          })}
        </div>

        {/* 1단계: 날짜 */}
        {currentStep === 1 && (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>1. 날짜 선택</h2>
                <p>대실할 날짜를 선택합니다.</p>
              </div>
            </div>
            <div className="calendar-top">
              <button className="small-btn" onClick={() => {
                if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
                else setViewMonth(m => m - 1);
              }}>← 이전달</button>
              <div className="calendar-title">
                <h3>{monthLabel}</h3>
                <span>{viewYear}년 {pad2(viewMonth + 1)}월 대실 가능일 : {availableCount}</span>
              </div>
              <button className="small-btn" onClick={() => {
                if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
                else setViewMonth(m => m + 1);
              }}>다음달 →</button>
            </div>
            <table className="calendar">
              <thead>
                <tr>
                  {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <th key={d} className={i === 0 ? "sunday" : i === 6 ? "saturday" : ""}>{d}요일</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((day, ci) => {
                      if (!day) return <td key={ci} className="disabled"></td>;
                      const dateKey = makeDateKey(viewYear, viewMonth, day);
                      const isPast = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const isSel = selectedDate === dateKey;
                      let cls = isPast ? "disabled" : "available";
                      if (isSel) cls = "selected";
                      return (
                        <td key={ci} className={cls}
                          onClick={() => { if (!isPast) { handleSelectDate(dateKey); } }}
                          onDoubleClick={() => { if (!isPast) { handleSelectDate(dateKey); setCurrentStep(2); } }}
                        >{day}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-area">
              <button className="gray-btn" disabled>← 이전 단계</button>
              <button className="primary-btn" disabled={!selectedDate}
                onClick={() => { if (selectedDate) setCurrentStep(2); }}>다음 단계 →</button>
            </div>
          </div>
        )}

        {/* 2단계: 건물 */}
        {currentStep === 2 && (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>2. 건물 선택</h2>
                <p>선택한 날짜에 예약할 건물을 선택합니다.</p>
              </div>
            </div>
            <table className="select-table">
              <thead>
                <tr>
                  <th>캠퍼스</th>
                  <th>건물명</th>
                  <th className="right">이동</th>
                </tr>
              </thead>
              <tbody>
                {defaultBuildings.map((b) => (
                  <tr key={b} className={selectedBuilding === b ? "selected-row" : ""}
                    onClick={() => handleSelectBuilding(b)}
                    onDoubleClick={() => { handleSelectBuilding(b); setCurrentStep(3); }}>
                    <td>글로벌캠퍼스</td>
                    <td>{b}</td>
                    <td className="right">
                      <button type="button" className="select-action-btn"
                        onClick={(e) => { e.stopPropagation(); handleSelectBuilding(b); setCurrentStep(3); }}>
                        <span className="arrow-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-area">
              <button className="gray-btn" onClick={() => setCurrentStep(1)}>← 이전 단계</button>
              <button className="primary-btn" disabled={!selectedBuilding}
                onClick={() => { if (selectedBuilding) setCurrentStep(3); }}>다음 단계 →</button>
            </div>
          </div>
        )}

        {/* 3단계: 강의실 */}
        {currentStep === 3 && (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>3. 강의실 선택</h2>
                <p>{selectedBuilding}의 강의실 목록입니다.</p>
              </div>
            </div>
            <table className="select-table">
              <thead>
                <tr>
                  <th>호실</th>
                  <th>개방시간</th>
                  <th className="right">수용인원</th>
                  <th className="right">상태</th>
                  <th className="right">이동</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr><td colSpan="5">등록된 강의실이 없습니다.</td></tr>
                ) : filteredRooms.map((room) => {
                  const status = getRoomStatus(room);
                  const canSelect = status === "available" || status === "partial";
                  const rowClass = [
                    selectedRoomId === room.id ? "selected-row" : "",
                    canSelect ? "" : "disabled-room",
                  ].join(" ").trim();
                  return (
                    <tr key={room.id} className={rowClass}
                      onClick={() => handleSelectRoom(room.id, status, false)}>
                      <td>{room.roomNumber}</td>
                      <td>{room.openTime} ~ {room.closeTime}</td>
                      <td className="right">{room.capacity}명</td>
                      <td className="right">
                        <span className={`status ${getStatusClass(status)}`}>{getStatusText(status)}</span>
                      </td>
                      <td className="right">
                        <button type="button" className="select-action-btn" disabled={!canSelect}
                          onClick={(e) => { e.stopPropagation(); handleSelectRoom(room.id, status, true); }}>
                          <span className="arrow-icon" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="button-area">
              <button className="gray-btn" onClick={() => setCurrentStep(2)}>← 이전 단계</button>
              <button className="primary-btn" disabled={!selectedRoomId}
                onClick={() => { if (selectedRoomId) setCurrentStep(4); }}>다음 단계 →</button>
            </div>
          </div>
        )}

        {/* 4단계: 시간 + 정보 입력 */}
        {currentStep === 4 && selectedRoom && (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>4. 기타 정보 및 시간 선택</h2>
                <p>사용 시간과 대실 정보를 입력합니다.</p>
              </div>
            </div>

            <div className="selected-summary">
              <div className="summary-title">선택 정보</div>
              <div className="summary-content">
                <div className="summary-item"><span>선택일</span>{selectedDate}</div>
                <div className="summary-item"><span>건물</span>{selectedBuilding}</div>
                <div className="summary-item"><span>강의실</span>{formatRoomLabel(selectedRoom.roomNumber)}</div>
                <div className="summary-item"><span>수용인원</span>{selectedRoom.capacity}명</div>
                <div className="summary-item"><span>시간 단위</span>{selectedRoom.slotUnitHours}시간</div>
                <div className="summary-item"><span>선택 시간</span>{selectedTimeText}</div>
              </div>
            </div>

            <div className="reservation-layout">
              <div className="time-card">
                <div className="time-title">{selectedRoom.building} {selectedRoom.roomNumber}</div>
                {slots.map((slot) => {
                  const reserved = isSlotReserved(selectedRoom.id, selectedDate, slot);
                  const selected = selectedTimes.some((t) => t.id === slot.id);
                  const cls = ["slot", reserved ? "reserved" : "", selected ? "selected" : ""].join(" ").trim();
                  return (
                    <div className="time-row" key={slot.id}>
                      <div className="hour">{slot.startTime.slice(0, 2)}시</div>
                      <button type="button" className={cls} disabled={reserved}
                        onClick={() => handleToggleTime(slot)}>
                        {slot.label}{reserved ? " 예약됨" : ""}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="form-box">
                <div className="form-title">기타 정보</div>
                <div className="form-content">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="contact">연락처</label>
                      <input id="contact" type="text" placeholder="010-0000-0000"
                        value={contact} maxLength={20}
                        onChange={(e) => setContact(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <span className="form-label">대실 단체 유형</span>
                      <div className="radio-group">
                        {["동아리", "학회", "스터디", "기타"].map((v) => (
                          <label key={v} className={`radio-card ${groupType === v ? "checked" : ""}`}>
                            <input type="radio" name="group" value={v}
                              checked={groupType === v}
                              onChange={(e) => setGroupType(e.target.value)} />
                            {v}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group full">
                      <label htmlFor="purpose">대실 사유</label>
                      <textarea id="purpose" placeholder="예: 오픈소스SW 팀 프로젝트 회의"
                        maxLength={200} value={purpose}
                        onChange={(e) => setPurpose(e.target.value)} />
                    </div>
                  </div>
                  <div className="button-area">
                    <button type="button" className="gray-btn"
                      onClick={() => setCurrentStep(3)} disabled={submitting}>이전 단계</button>
                    <button type="button" className="primary-btn"
                      onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "예약 신청 중..." : "대실 예약"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="footer">정보처 정보시스템팀</div>
    </div>
  );
}
