import { useState } from "react";

const steps = [
  { id: 1, label: "날짜 선택" },
  { id: 2, label: "건물 선택" },
  { id: 3, label: "호실 선택" },
];

const BUILDINGS = [
  { campus: "글로벌", name: "어문학관-1" },
  { campus: "글로벌", name: "어문학관-2" },
  { campus: "글로벌", name: "자연과학관-1" },
  { campus: "글로벌", name: "인문경상관-1" },
  { campus: "글로벌", name: "백년관-1" },
  { campus: "글로벌", name: "백년관-2" },
  { campus: "서울", name: "교수학습개발원-1" },
  { campus: "서울", name: "교수학습개발원-2" },
  { campus: "서울", name: "교수학습개발원-3" },
  { campus: "서울", name: "교수학습개발원-4" },
];

export default function BuildingPicker({ onPrev, onNext }) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  return (
    <div className="page">
      <div className="step-box">
        <div className="steps">
          {steps.map((step) => (
            <div key={step.id} className={`step ${step.id === 2 ? "active" : step.id < 2 ? "done" : ""}`}>
              <span className="step-number">{step.id}</span>
              {step.label}
            </div>
          ))}
        </div>

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
              {BUILDINGS.map((b) => (
                <tr
                  key={b.name}
                  className={selectedBuilding?.name === b.name ? "selected-row" : ""}
                  onClick={() => setSelectedBuilding(b)}
                  onDoubleClick={() => { setSelectedBuilding(b); onNext && onNext(b); }}
                >
                  <td>{b.campus}</td>
                  <td>{b.name}</td>
                  <td className="right">
                    <button
                      type="button"
                      className="select-action-btn"
                      onClick={(e) => { e.stopPropagation(); onNext && onNext(b); }}
                    >
                      <span className="arrow-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="button-area">
            <button className="gray-btn" onClick={onPrev}>← 이전 단계</button>
            <button
              className="primary-btn"
              disabled={!selectedBuilding}
              onClick={() => selectedBuilding && onNext && onNext(selectedBuilding)}
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