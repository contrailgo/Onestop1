import { useState, useEffect } from "react";

const API_BASE = "https://onestop1-production.up.railway.app/api";

const typeLabel = (type) => {
  if (type === "studyroom") return "스터디룸";
  if (type === "classroom") return "강의실";
  if (type === "facility") return "행사시설";
  return type;
};

const typeBadgeStyle = (type) => {
  if (type === "studyroom") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (type === "classroom") return "bg-blue-50 text-blue-700 border-blue-200";
  if (type === "facility") return "bg-purple-50 text-purple-700 border-purple-200";
  return "";
};

export default function AdminPage({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchReservations = () => {
    setLoading(true);
    const url = filterType === "all"
      ? `${API_BASE}/reservations/all`
      : `${API_BASE}/reservations/all?type=${filterType}`;
    fetch(url)
      .then(r => r.json())
      .then(data => { if (data.success) setReservations(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, [filterType]);

  const handleDelete = async (id) => {
    if (!window.confirm("이 예약을 완전히 삭제하시겠습니까?")) return;
    await fetch(`${API_BASE}/reservations/${id}`, { method: "DELETE" });
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const handleCancel = async (id) => {
    if (!window.confirm("이 예약을 취소하시겠습니까?")) return;
    await fetch(`${API_BASE}/reservations/${id}/cancel`, { method: "PATCH" });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "취소됨" } : r));
  };

  const activeReservations = reservations.filter(r => r.status !== "취소됨");
  const cancelledReservations = reservations.filter(r => r.status === "취소됨");

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#002d6e", margin: 0 }}>🛡️ 관리자 페이지</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>전체 예약 내역을 관리합니다.</p>
        </div>
        <button
          style={{ background: "#f0f0f0", border: "1px solid #ccc", borderRadius: 4, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
          onClick={onBack}
        >← 메인으로</button>
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "전체"], ["studyroom", "스터디룸"], ["classroom", "강의실"], ["facility", "행사시설"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterType(val)}
            style={{
              padding: "6px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: filterType === val ? "#002d6e" : "#fff",
              color: filterType === val ? "#fff" : "#555",
              border: filterType === val ? "1px solid #002d6e" : "1px solid #ccc",
            }}
          >{label}</button>
        ))}
        <button
          onClick={fetchReservations}
          style={{ padding: "6px 14px", borderRadius: 4, fontSize: 13, cursor: "pointer", background: "#fff", border: "1px solid #ccc", color: "#555", marginLeft: "auto" }}
        >🔄 새로고침</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>불러오는 중...</div>
      ) : (
        <>
          {/* 활성 예약 */}
          <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ background: "#002d6e", color: "#fff", padding: "10px 16px", fontWeight: 700, fontSize: 14 }}>
              활성 예약 ({activeReservations.length}건)
            </div>
            {activeReservations.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 14 }}>활성 예약이 없습니다.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #eee" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>유형</th>
                    <th style={thStyle}>예약자</th>
                    <th style={thStyle}>날짜</th>
                    <th style={thStyle}>건물/시설</th>
                    <th style={thStyle}>호실</th>
                    <th style={thStyle}>시간</th>
                    <th style={thStyle}>상태</th>
                    <th style={thStyle}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReservations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={tdStyle}>{r.id}</td>
                      <td style={tdStyle}>
                        <span style={{ ...badgeStyle, ...getBadgeColor(r.type) }}>{typeLabel(r.type)}</span>
                      </td>
                      <td style={tdStyle}><strong>{r.user_name}</strong><br /><span style={{ color: "#888", fontSize: 11 }}>{r.username}</span></td>
                      <td style={tdStyle}>{r.date}</td>
                      <td style={tdStyle}>{r.building}</td>
                      <td style={tdStyle}>{r.room}</td>
                      <td style={tdStyle}>{r.start_time} ~ {r.end_time}</td>
                      <td style={tdStyle}><span style={{ ...badgeStyle, background: "#e6f7ee", color: "#00824a" }}>{r.status}</span></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleCancel(r.id)} style={{ ...btnStyle, background: "#fff3cd", color: "#9a6700", border: "1px solid #ffc107" }}>취소</button>
                          <button onClick={() => handleDelete(r.id)} style={{ ...btnStyle, background: "#ffe8e8", color: "#bf2d2d", border: "1px solid #f5c6c6" }}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 취소된 예약 */}
          {cancelledReservations.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ background: "#888", color: "#fff", padding: "10px 16px", fontWeight: 700, fontSize: 14 }}>
                취소된 예약 ({cancelledReservations.length}건)
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #eee" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>유형</th>
                    <th style={thStyle}>예약자</th>
                    <th style={thStyle}>날짜</th>
                    <th style={thStyle}>건물/시설</th>
                    <th style={thStyle}>호실</th>
                    <th style={thStyle}>시간</th>
                    <th style={thStyle}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {cancelledReservations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0", opacity: 0.6 }}>
                      <td style={tdStyle}>{r.id}</td>
                      <td style={tdStyle}><span style={{ ...badgeStyle, ...getBadgeColor(r.type) }}>{typeLabel(r.type)}</span></td>
                      <td style={tdStyle}><strong>{r.user_name}</strong><br /><span style={{ color: "#888", fontSize: 11 }}>{r.username}</span></td>
                      <td style={tdStyle}>{r.date}</td>
                      <td style={tdStyle}>{r.building}</td>
                      <td style={tdStyle}>{r.room}</td>
                      <td style={tdStyle}>{r.start_time} ~ {r.end_time}</td>
                      <td style={tdStyle}>
                        <button onClick={() => handleDelete(r.id)} style={{ ...btnStyle, background: "#ffe8e8", color: "#bf2d2d", border: "1px solid #f5c6c6" }}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const thStyle = { padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: 12 };
const tdStyle = { padding: "10px 12px", color: "#333", verticalAlign: "middle" };
const badgeStyle = { display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 };
const btnStyle = { padding: "4px 10px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600 };

function getBadgeColor(type) {
  if (type === "studyroom") return { background: "#e6f7ee", color: "#00824a" };
  if (type === "classroom") return { background: "#e6eef8", color: "#002d6e" };
  if (type === "facility") return { background: "#f3e6f7", color: "#7b2d9a" };
  return {};
}
