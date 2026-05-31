import { useMemo, useState, useEffect } from "react";
import { facilities } from "./facilityData.js";
import { formatCapacity, getStatusClass, getStatusText, isTimeOverlap, makeDateKey, makeTimeSlots, pad2 } from "./reservationUtils.js";

const API_BASE = "http://localhost:3001/api";
const stepNames = ["날짜 선택", "시설 선택", "기타 정보 입력"];
const today = new Date();

export default function FacilityApp({ user, onBack }) {
  const [reservations, setReservations] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [applicantContact, setApplicantContact] = useState("");
  const [purpose, setPurpose] = useState("");
  const [hostGroup, setHostGroup] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderContact, setLeaderContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedFacility = useMemo(() => facilities.find((f) => f.id === selectedFacilityId) || null, [selectedFacilityId]);

  // 예약 내역 불러오기
  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/reservations?username=${user.student_id}&type=facility`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setReservations(data.data.map(r => ({
            ...r,
            times: [{ id: r.start_time, startTime: r.start_time, endTime: r.end_time, label: `${r.start_time} ~ ${r.end_time}` }],
          })));
        }
      }).catch(() => {});
  }, [user]);

  function isSlotReserved(facilityId, date, slot) {
    return reservations.some((r) => {
      const fac = facilities.find(f => f.id === facilityId);
      if (!fac || r.room !== fac.facilityName || r.date !== date || r.status === "취소됨") return false;
      return r.times.some((t) => isTimeOverlap(slot.startTime, slot.endTime, t.startTime, t.endTime));
    });
  }

  function getFacilityStatus(facility) {
    if (facility.status === "viewOnly") return "viewOnly";
    if (!selectedDate) return "available";
    const slots = makeTimeSlots(facility);
    const reservedCount = slots.filter((s) => isSlotReserved(facility.id, selectedDate, s)).length;
    if (reservedCount === 0) return "available";
    if (reservedCount === slots.length) return "closed";
    return "partial";
  }

  function handleSelectDate(dateKey) { setSelectedDate(dateKey); setSelectedFacilityId(null); setSelectedTimes([]); }
  function handleSelectFacility(id, direct) { setSelectedFacilityId(id); setSelectedTimes([]); if (direct) setCurrentStep(3); }
  function handleToggleTime(slot) {
    if (!selectedFacility || isSlotReserved(selectedFacility.id, selectedDate, slot)) { alert("이미 예약된 시간입니다."); return; }
    setSelectedTimes((prev) => {
      const exists = prev.some((t) => t.id === slot.id);
      return exists ? prev.filter((t) => t.id !== slot.id) : [...prev, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  }

  async function handleSubmit() {
    if (!applicantContact) { alert("신청자 연락처를 입력해주세요."); return; }
    if (!purpose) { alert("대실 사유를 입력해주세요."); return; }
    if (!hostGroup) { alert("주관 단체를 입력해주세요."); return; }
    if (!leaderName) { alert("단체장 성명을 입력해주세요."); return; }
    if (!leaderContact) { alert("단체장 연락처를 입력해주세요."); return; }
    if (selectedTimes.length === 0) { alert("시간을 선택해주세요."); return; }

    const sortedTimes = [...selectedTimes].sort((a, b) => a.startTime.localeCompare(b.startTime));
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "facility",
          date: selectedDate,
          building: selectedFacility.building,
          room: selectedFacility.facilityName,
          start_time: sortedTimes[0].startTime,
          end_time: sortedTimes[sortedTimes.length - 1].endTime,
          username: user?.student_id,
          contact: applicantContact,
          purpose,
          host_group: hostGroup,
          leader_name: leaderName,
          leader_contact: leaderContact,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("예약이 완료되었습니다!");
        const refreshed = await fetch(`${API_BASE}/reservations?username=${user.student_id}&type=facility`).then(r => r.json());
        if (refreshed.success) {
          setReservations(refreshed.data.map(r => ({
            ...r,
            times: [{ id: r.start_time, startTime: r.start_time, endTime: r.end_time, label: `${r.start_time} ~ ${r.end_time}` }],
          })));
        }
        setCurrentStep(1); setSelectedDate(""); setSelectedFacilityId(null); setSelectedTimes([]);
        setApplicantContact(""); setPurpose(""); setHostGroup(""); setLeaderName(""); setLeaderContact("");
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

  const slots = selectedFacility ? makeTimeSlots(selectedFacility) : [];
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
                  <strong>{r.building} {r.room}</strong>
                  <p>{r.date} / {r.times.map((t) => t.label).join(", ")}</p>
                  <p>주관단체: {r.host_group} / 단체장: {r.leader_name}</p>
                  <p>사유: {r.purpose}</p>
                </div>
                <div>
                  <span className="status available">{r.status}</span>
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
            return <div key={stepId} className={cls} onClick={() => setCurrentStep(stepId)}><span className="step-number">{stepId}</span>{name}</div>;
          })}
        </div>

        {currentStep === 1 && (
          <div className="section">
            <div className="section-header"><div><h2>1. 날짜 선택</h2><p>대실할 날짜를 선택합니다.</p></div></div>
            <div className="calendar-top">
              <button className="small-btn" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}>← 이전달</button>
              <div className="calendar-title"><h3>{viewYear}-{pad2(viewMonth + 1)}</h3><span>{viewYear}년 {pad2(viewMonth + 1)}월 대실 가능일 : {availableCount}</span></div>
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
            <div className="section-header"><div><h2>2. 시설 선택</h2><p>선택한 날짜에 예약할 시설을 선택합니다.</p></div></div>
            <table className="select-table">
              <thead><tr><th>캠퍼스</th><th>건물명</th><th>시설명</th><th className="right">수용정보</th><th className="right">상태</th><th className="right">이동</th></tr></thead>
              <tbody>
                {facilities.map((facility) => {
                  const status = getFacilityStatus(facility);
                  const canSelect = status === "available" || status === "partial";
                  const rowClass = [selectedFacilityId === facility.id ? "selected-row" : "", canSelect ? "" : "disabled-room"].join(" ").trim();
                  return (
                    <tr key={facility.id} className={rowClass} onClick={() => { if (canSelect) handleSelectFacility(facility.id, false); }}>
                      <td>{facility.campus}</td><td>{facility.building}</td><td>{facility.facilityName}</td>
                      <td className="right">{formatCapacity(facility.capacity, facility.facilityName)}</td>
                      <td className="right"><span className={`status ${getStatusClass(status)}`}>{getStatusText(status)}</span></td>
                      <td className="right"><button type="button" className="select-action-btn" disabled={!canSelect} onClick={(e) => { e.stopPropagation(); handleSelectFacility(facility.id, true); }}><span className="arrow-icon" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="button-area">
              <button className="gray-btn" onClick={() => setCurrentStep(1)}>← 이전 단계</button>
              <button className="primary-btn" disabled={!selectedFacilityId} onClick={() => selectedFacilityId && setCurrentStep(3)}>다음 단계 →</button>
            </div>
          </div>
        )}

        {currentStep === 3 && selectedFacility && (
          <div className="section">
            <div className="section-header"><div><h2>3. 기타 정보 입력</h2><p>사용 시간과 대실 정보를 입력합니다.</p></div></div>
            <div className="selected-summary">
              <div className="summary-title">선택 정보</div>
              <div className="summary-content">
                <div className="summary-item"><span>선택일</span>{selectedDate}</div>
                <div className="summary-item"><span>시설명</span>{selectedFacility.building} {selectedFacility.facilityName}</div>
                <div className="summary-item"><span>수용정보</span>{formatCapacity(selectedFacility.capacity, selectedFacility.facilityName)}</div>
                <div className="summary-item"><span>선택 시간</span>{selectedTimeText}</div>
              </div>
            </div>
            <div className="reservation-layout">
              <div className="time-card">
                <div className="time-title">사용 시간 선택</div>
                {slots.map((slot) => {
                  const reserved = isSlotReserved(selectedFacility.id, selectedDate, slot);
                  const selected = selectedTimes.some((t) => t.id === slot.id);
                  const cls = ["slot", reserved ? "reserved" : "", selected ? "selected" : ""].join(" ").trim();
                  return (
                    <div className="time-row" key={slot.id}>
                      <div className="hour">{slot.startTime.slice(0, 2)}시</div>
                      <button type="button" className={cls} disabled={reserved} onClick={() => handleToggleTime(slot)}>{slot.label}{reserved ? " 예약됨" : ""}</button>
                    </div>
                  );
                })}
              </div>
              <div className="form-box">
                <div className="form-title">기타 정보</div>
                <div className="form-content">
                  <div className="form-grid">
                    <div className="form-group"><label htmlFor="applicantContact">신청자 연락처</label><input id="applicantContact" type="text" placeholder="신청자 연락처(지역번호 포함)" value={applicantContact} maxLength={20} onChange={(e) => setApplicantContact(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="purpose">대실 사유</label><input id="purpose" type="text" placeholder="대실 사유" value={purpose} maxLength={100} onChange={(e) => setPurpose(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="hostGroup">주관 단체</label><input id="hostGroup" type="text" placeholder="주관 단체" value={hostGroup} maxLength={50} onChange={(e) => setHostGroup(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="leaderName">단체장 성명</label><input id="leaderName" type="text" placeholder="단체장 성명" value={leaderName} maxLength={30} onChange={(e) => setLeaderName(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="leaderContact">단체장 연락처</label><input id="leaderContact" type="text" placeholder="단체장 연락처(지역번호 포함)" value={leaderContact} maxLength={20} onChange={(e) => setLeaderContact(e.target.value)} /></div>
                  </div>
                  <div className="button-area">
                    <button type="button" className="gray-btn" onClick={() => setCurrentStep(2)} disabled={submitting}>이전 단계</button>
                    <button type="button" className="primary-btn" onClick={handleSubmit} disabled={submitting}>{submitting ? "예약 신청 중..." : "대실 예약"}</button>
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