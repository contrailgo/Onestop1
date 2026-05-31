import { useState } from "react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const steps = [
  { id: 1, label: "날짜 선택" },
  { id: 2, label: "건물 선택" },
  { id: 3, label: "호실 선택" },
];

export default function DatePicker({ onNext, onBack }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getAvailableDays = () => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const day = date.getDay();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (date >= todayMidnight && day !== 0 && day !== 6) count++;
    }
    return count;
  };

  const isPast = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayMidnight;
  };

  const isSelected = (day) =>
    selectedDate &&
    selectedDate.day === day &&
    selectedDate.month === currentMonth &&
    selectedDate.year === currentYear;

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  const handleDayClick = (day) => {
    if (isPast(day)) return;
    setSelectedDate({ year: currentYear, month: currentMonth, day });
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const monthLabel = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  return (
    <div className="page">
      <div style={{ marginBottom: 12 }}>
        <button className="gray-btn" onClick={onBack}>← 메인으로</button>
      </div>

      <div className="step-box">
        <div className="steps">
          {steps.map((step) => (
            <div key={step.id} className={`step ${step.id === 1 ? "active" : ""}`}>
              <span className="step-number">{step.id}</span>
              {step.label}
            </div>
          ))}
        </div>

        <div className="section">
          <div className="section-header">
            <div>
              <h2>1. 날짜 선택</h2>
              <p>대실할 날짜를 선택합니다.</p>
            </div>
          </div>

          <div className="calendar-top">
            <button className="small-btn" onClick={handlePrevMonth}>← 이전달</button>
            <div className="calendar-title">
              <h3>{monthLabel}</h3>
              <span>{currentYear}년 {String(currentMonth + 1).padStart(2, "0")}월 대실 가능일 : {getAvailableDays()}</span>
            </div>
            <button className="small-btn" onClick={handleNextMonth}>다음달 →</button>
          </div>

          <table className="calendar">
            <thead>
              <tr>
                {DAYS.map((d, i) => (
                  <th key={d} className={i === 0 ? "sunday" : i === 6 ? "saturday" : ""}>
                    {d}요일
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((day, ci) => {
                    if (!day) return <td key={ci} className="disabled"></td>;
                    const past = isPast(day);
                    const sel = isSelected(day);
                    let cls = past ? "disabled" : "available";
                    if (sel) cls = "selected";
                    return (
                      <td
                        key={ci}
                        className={cls}
                        onClick={() => !past && handleDayClick(day)}
                        onDoubleClick={() => {
                          if (!past) {
                            const date = { year: currentYear, month: currentMonth, day };
                            setSelectedDate(date);
                            onNext && onNext(date);
                          }
                        }}
                      >
                        {day}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="button-area">
            <button className="gray-btn" disabled>← 이전 단계</button>
            <button
              className="primary-btn"
              disabled={!selectedDate}
              onClick={() => selectedDate && onNext && onNext(selectedDate)}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      </div>
      <div className="footer">정보처 정보시스템팀</div>
    </div>
  );
}
