import { useState, useMemo, useEffect } from "react";
import { classroomData, buildings as defaultBuildings, fixedReservedSlots } from "./classroomData.js";
import { formatRoomLabel, getStatusClass, getStatusText, isTimeOverlap, makeDateKey, makeTimeSlots, pad2 } from "./reservationUtils.js";

const API_BASE = "https://onestop1-production.up.railway.app/api";
const stepNames = ["날짜 선택", "건물 선택", "강의실 선택", "기타 정보 및 시간 선택"];
const today = new Date();



export default function ClassroomApp({ user, onBack }) {
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
  const [blockedRooms, setBlockedRooms] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [blockedNotice, setBlockedNotice] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/reservations/blocked-rooms`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setBlockedRooms(data.data.map(r => `${r.building}_${r.room}`));
      }).catch(() => {});
  }, []);

  const rooms = classroomData;
  const selectedRoom = useMemo(() => rooms.find((r) => r.id === selectedRoomId) || null, [rooms, selectedRoomId]);
  const isSelectedRoomBlocked = selectedRoom ? blockedRooms.includes(`${selectedRoom.building}_${selectedRoom.roomNumber}`) : false;

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/reservations?username=${user.student_id}&type=classroom`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setReservations(data.data.map(r => ({
            ...r,
            times: [{ id: r.start_time, startTime: r.start_time, endTime: r.end_time, label: `${r.start_time} ~ ${r.end_time}` }],
            roomNumber: r.room,
          })));
        }
      }).catch(() => {});
  }, [user]);

  const isBlockedRoom = (building, roomNumber) => blockedRooms.includes(`${building}_${roomNumber}`);

  function isFixedSlotReserved(roomId, slot) {
    return fixedReservedSlots.some((r) => r.roomId === roomId && isTimeOverlap(slot.startTime, slot.endTime, r.startTime, r.endTime));
  }

  function isUserSlotReserved(roomId, date, slot) {
    return reservations.some((r) => {
      if (r.room !== (rooms.find(x => x.id === roomId)?.roomNumber) || r.date !== date || r.status === "취소됨") return false;
      return r.times?.some((t) => isTimeOverlap(slot.startTime, slot.endTime, t.startTime, t.endTime));
    });
  }

  function isSlotReserved(roomId, date, slot) {
    return isFixedSlotReserved(roomId, slot) || isUserSlotReserved(roomId, date, slot);
  }

  function getRoomStatus(room) {
    if (room.status === "viewOnly") return "viewOnly";
    if (isBlockedRoom(room.building, room.roomNumber)) return "blocked";
    if (!selectedDate) return "available";
    const slots = makeTimeSlots(room);
    const reservedCount = slots.filter((s) => isSlotReserved(room.id, selectedDate, s)).length;
    if (reservedCount === 0) return "available";
    if (reservedCount === slots.length) return "closed";
    return "partial";
  }

  function handleSelectDate(date) { setSelectedDate(date); setSelectedBuilding(""); setSelectedRoomId(null); setSelectedTimes([]); }
  function handleSelectBuilding(building) { setSelectedBuilding(building); setSelectedRoomId(null); setSelectedTimes([]); }
  function handleSelectRoom(id, status, direct) {
    const canSelect = status === "available" || status === "partial" || status === "blocked";
    if (!canSelect) return;
    setSelectedRoomId(id);
    setSelectedTimes([]);
    setUploadedFile(null);
    if (status === "blocked") setBlockedNotice(true);
    else setBlockedNotice(false);
    if (direct) setCurrentStep(4);
  }
  function handleToggleTime(slot) {
    setSelectedTimes((prev) => {
      const exists = prev.some((t) => t.id === slot.id);
      return exists ? prev.filter((t) => t.id !== slot.id) : [...prev, slot];
    });
  }

  async function handleSubmit() {
    if (!contact) { alert("연락처를 입력해주세요."); return; }
    if (!groupType) { alert("단체 유형을 선택해주세요."); return; }
    if (!purpose) { alert("대실 사유를 입력해주세요."); return; }
    if (selectedTimes.length === 0) { alert("시간을 선택해주세요."); return; }
    if (isSelectedRoomBlocked && !uploadedFile) { alert("대여불가 강의실은 행사허가원 파일을 첨부해주세요."); return; }

    const sortedTimes = [...selectedTimes].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const startTime = sortedTimes[0].startTime;
    const endTime = sortedTimes[sortedTimes.length - 1].endTime;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "classroom",
          date: selectedDate,
          building: selectedBuilding,
          room: selectedRoom.roomNumber,
          start_time: startTime,
          end_time: endTime,
          username: user?.student_id,
          contact,
          group_type: groupType,
          purpose,
          status: isSelectedRoomBlocked ? "심사중" : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(isSelectedRoomBlocked ? "신청이 완료되었습니다! 관리자 검토 후 승인됩니다. (심사중)" : "예약이 완료되었습니다!");
        const refreshed = await fetch(`${API_BASE}/reservations?username=${user.student_id}&type=classroom`).then(r => r.json());
        if (refreshed.success) {
          setReservations(refreshed.data.map(r => ({
            ...r,
            times: [{ id: r.start_time, startTime: r.start_time, endTime: r.end_time, label: `${r.start_time} ~ ${r.end_time}` }],
            roomNumber: r.room,
          })));
        }
        setCurrentStep(1); setSelectedDate(""); setSelectedBuilding(""); setSelectedRoomId(null);
        setSelectedTimes([]); setContact(""); setPurpose(""); setGroupType(""); setUploadedFile(null); setBlockedNotice(false);
      } else {
        alert(data.message || "예약에 실패했습니다.");
      }
    } catch { alert("서버에 연결할 수 없습니다."); }
    finally { setSubmitting(false); }
  }

  async function handleCancel(id) {
    await fetch(`${API_BASE}/reservations/${id}/cancel`, { method: "PATCH" });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "취소됨" } : r));
  }

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
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (date >= todayMidnight && date.getDay() !== 0 && date.getDay() !== 6) count++;
    }
    return count;
  })();

  const filteredRooms = rooms.filter((r) => r.building === selectedBuilding);
  const slots = selectedRoom ? makeTimeSlots(selectedRoom) : [];
  const selectedTimeText = selectedTimes.length > 0 ? selectedTimes.map((t) => t.label).join(", ") : "미선택";
  const activeReservations = reservations.filter(r => r.status !== "취소됨");

  return (
    <div className="page">
      <div style={{ marginBottom: 12 }}>
        <button className="gray-btn" onClick={onBack}>← 메인으로</button>
      </div>

      {activeReservations.length > 0 && (
        <div className="panel">
          <div className="panel-title">나의 예약 내역</div>
          <div className="history-list">
            {activeReservations.map((r) => (
              <div className="history-item" key={r.id}>
                <div>
                  <strong>{r.building} {formatRoomLabel(r.roomNumber)}</strong>
                  <p>{r.date} / {r.times.map((t) => t.label).join(", ")}</p>
                  <p>단체: {r.group_type} / 사유: {r.purpose}</p>
                </div>
                <div>
                  <span className={`status ${r.status === "심사중" ? "pending" : "available"}`}>{r.status}</span>
                  <button className="gray-btn" onClick={() => handleCancel(r.id)}>취소</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-box">
        <div className="steps">
          {stepNames.map((name, i) => {
            const stepId = i + 1;
            let cls = "step";
            if (stepId === currentStep) cls += " active";
            else if (stepId < currentStep) cls += " done";
            return (
              <div key={stepId} className={cls} onClick={() => setCurrentStep(stepId)}>
                <span className="step-number">{stepId}</span>{name}
              </div>
            );
          })}
        </div>

        {currentStep === 1 && (
          <div className="section">
            <div className="section-header"><div><h2>1. 날짜 선택</h2><p>대실할 날짜를 선택합니다.</p></div></div>
            <div className="calendar-top">
              <button className="small-btn" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}>← 이전달</button>
              <div className="calendar-title">
                <h3>{viewYear}-{pad2(viewMonth + 1)}</h3>
                <span>{viewYear}년 {pad2(viewMonth + 1)}월 대실 가능일 : {availableCount}</span>
              </div>
              <button className="small-btn" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}>다음달 →</button>
            </div>
            <table className="calendar">
              <thead><tr>{["일","월","화","수","목","금","토"].map((d, i) => <th key={d} className={i===0?"sunday":i===6?"saturday":""}>{d}요일</th>)}</tr></thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>{row.map((day, ci) => {
                    if (!day) return <td key={ci} className="disabled"></td>;
                    const dateKey = makeDateKey(viewYear, viewMonth, day);
                    const isPast = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    let cls = isPast ? "disabled" : "available";
                    if (selectedDate === dateKey) cls = "selected";
                    return <td key={ci} className={cls} onClick={() => { if (!isPast) handleSelectDate(dateKey); }} onDoubleClick={() => { if (!isPast) { handleSelectDate(dateKey); setCurrentStep(2); } }}>{day}</td>;
                  })}</tr>
                ))}
              </tbody>
            </table>
            <div className="button-area">
              <button className="gray-btn" disabled>← 이전 단계</button>
              <button className="primary-btn" disabled={!selectedDate} onClick={() => selectedDate && setCurrentStep(2)}>다음 단계 →</button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="section">
            <div className="section-header"><div><h2>2. 건물 선택</h2><p>선택한 날짜에 예약할 건물을 선택합니다.</p></div></div>
            <table className="select-table">
              <thead><tr><th>캠퍼스</th><th>건물명</th><th className="right">이동</th></tr></thead>
              <tbody>
                {defaultBuildings.map((b) => (
                  <tr key={b} className={selectedBuilding === b ? "selected-row" : ""} onClick={() => handleSelectBuilding(b)} onDoubleClick={() => { handleSelectBuilding(b); setCurrentStep(3); }}>
                    <td>글로벌캠퍼스</td><td>{b}</td>
                    <td className="right"><button type="button" className="select-action-btn" onClick={(e) => { e.stopPropagation(); handleSelectBuilding(b); setCurrentStep(3); }}><span className="arrow-icon" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-area">
              <button className="gray-btn" onClick={() => setCurrentStep(1)}>← 이전 단계</button>
              <button className="primary-btn" disabled={!selectedBuilding} onClick={() => selectedBuilding && setCurrentStep(3)}>다음 단계 →</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="section">
            <div className="section-header"><div><h2>3. 강의실 선택</h2><p>{selectedBuilding}의 강의실 목록입니다.</p></div></div>
            <table className="select-table">
              <thead><tr><th>호실</th><th>개방시간</th><th className="right">수용인원</th><th className="right">상태</th><th className="right">이동</th></tr></thead>
              <tbody>
                {filteredRooms.length === 0 ? <tr><td colSpan="5">등록된 강의실이 없습니다.</td></tr>
                : filteredRooms.map((room) => {
                  const status = getRoomStatus(room);
                  const isBlocked = status === "blocked";
                  const canSelect = status === "available" || status === "partial" || isBlocked;
                  const rowClass = [selectedRoomId === room.id ? "selected-row" : "", !canSelect ? "disabled-room" : ""].join(" ").trim();
                  return (
                    <tr key={room.id} className={rowClass} onClick={() => handleSelectRoom(room.id, status, false)}>
                      <td>{room.roomNumber}</td>
                      <td>{room.openTime} ~ {room.closeTime}</td>
                      <td className="right">{room.capacity}명</td>
                      <td className="right">
                        <span className={`status ${isBlocked ? "blocked" : getStatusClass(status)}`}>
                          {isBlocked ? "🚫 대여불가" : getStatusText(status)}
                        </span>
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
              <button className="primary-btn" disabled={!selectedRoomId} onClick={() => selectedRoomId && setCurrentStep(4)}>다음 단계 →</button>
            </div>
          </div>
        )}

        {currentStep === 4 && selectedRoom && (
          <div className="section">
            <div className="section-header"><div><h2>4. 기타 정보 및 시간 선택</h2><p>사용 시간과 대실 정보를 입력합니다.</p></div></div>

            {isSelectedRoomBlocked && (
              <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#9a6700", lineHeight: 1.7 }}>
                🚫 <strong>대여불가 강의실</strong>입니다. 특별한 사유가 없으면 대여가 불가능하며, 이용을 원하시면 행사허가원을 작성하여 첨부해 주세요.<br />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <a href="/강의실_이용_신청서.hwp" download style={{ padding: "6px 12px", background: "#002d6e", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>📄 강의실 신청서</a>
                  <a href="/행사허가원.hwp" download style={{ padding: "6px 12px", background: "#6a0dad", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>📄 행사허가원</a>
                </div>
              </div>
            )}

            <div className="selected-summary">
              <div className="summary-title">선택 정보</div>
              <div className="summary-content">
                <div className="summary-item"><span>선택일</span>{selectedDate}</div>
                <div className="summary-item"><span>건물</span>{selectedBuilding}</div>
                <div className="summary-item"><span>강의실</span>{formatRoomLabel(selectedRoom.roomNumber)}</div>
                <div className="summary-item"><span>수용인원</span>{selectedRoom.capacity}명</div>
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
                      <button type="button" className={cls} disabled={reserved} onClick={() => handleToggleTime(slot)}>
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
                    <div className="form-group"><label htmlFor="contact">연락처</label><input id="contact" type="text" placeholder="010-0000-0000" value={contact} maxLength={20} onChange={(e) => setContact(e.target.value)} /></div>
                    <div className="form-group">
                      <span className="form-label">대실 단체 유형</span>
                      <div className="radio-group">
                        {["동아리","학회","스터디","기타"].map((v) => (
                          <label key={v} className={`radio-card ${groupType === v ? "checked" : ""}`}>
                            <input type="radio" name="group" value={v} checked={groupType === v} onChange={(e) => setGroupType(e.target.value)} />{v}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group full"><label htmlFor="purpose">대실 사유</label><textarea id="purpose" placeholder="예: 오픈소스SW 팀 프로젝트 회의" maxLength={200} value={purpose} onChange={(e) => setPurpose(e.target.value)} /></div>
                    {isSelectedRoomBlocked && (
                      <div className="form-group full">
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#bf2d2d" }}>행사허가원 파일 첨부 (필수)</label>
                        <input type="file" accept=".hwp,.pdf,.doc,.docx" onChange={(e) => setUploadedFile(e.target.files[0])} style={{ fontSize: 13, marginTop: 6 }} />
                        {uploadedFile && <p style={{ fontSize: 12, color: "#00824a", marginTop: 4 }}>✅ {uploadedFile.name}</p>}
                      </div>
                    )}
                  </div>
                  <div className="button-area">
                    <button type="button" className="gray-btn" onClick={() => setCurrentStep(3)} disabled={submitting}>이전 단계</button>
                    <button type="button" className="primary-btn" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "신청 중..." : isSelectedRoomBlocked ? "심사 신청" : "대실 예약"}
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