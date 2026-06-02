import { useState, useEffect } from "react";

const API_BASE = "https://onestop1-production.up.railway.app/api";

const typeLabel = (type) => {
  if (type === "studyroom") return "스터디룸";
  if (type === "classroom") return "강의실";
  if (type === "facility") return "행사시설";
  return type;
};

function getBlockedRooms() {
  try { return JSON.parse(localStorage.getItem("blockedRooms") || "[]"); } catch { return []; }
}
function saveBlockedRooms(list) {
  localStorage.setItem("blockedRooms", JSON.stringify(list));
}

const ALL_CLASSROOMS = [
  { building: "교양관", room: "2201" },
  { building: "교양관", room: "2213" },
  { building: "교양관", room: "2214" },
  { building: "교양관", room: "2214-1" },
  { building: "교양관", room: "2301" },
  { building: "교양관", room: "2303" },
  { building: "교양관", room: "2303-2" },
  { building: "교양관", room: "2303-3" },
  { building: "교양관", room: "2305" },
  { building: "교양관", room: "2306" },
  { building: "교양관", room: "2307" },
  { building: "교양관", room: "2308" },
  { building: "교양관", room: "2309" },
  { building: "교양관", room: "2310" },
  { building: "교양관", room: "2311-1" },
  { building: "교양관", room: "2312" },
  { building: "교양관", room: "2312-1" },
  { building: "교양관", room: "2313" },
  { building: "교양관", room: "2314" },
  { building: "교양관", room: "2315" },
  { building: "교양관", room: "2315-1" },
  { building: "교양관", room: "2401" },
  { building: "교양관", room: "2402" },
  { building: "교양관", room: "2402-1" },
  { building: "교양관", room: "2403" },
  { building: "교양관", room: "2403-1" },
  { building: "교양관", room: "2404" },
  { building: "교양관", room: "2404-1" },
  { building: "교양관", room: "2406" },
  { building: "교양관", room: "2407" },
  { building: "교양관", room: "2407-1" },
  { building: "교양관", room: "2408" },
  { building: "교양관", room: "2409" },
  { building: "교양관", room: "2410" },
  { building: "교양관", room: "2411" },
  { building: "교양관", room: "2412" },
  { building: "교양관", room: "2413" },
  { building: "교양관", room: "2414" },
  { building: "교양관", room: "2415" },
  { building: "교양관", room: "2416" },
  { building: "교양관", room: "2417" },
  { building: "교양관", room: "2501" },
  { building: "교양관", room: "2502" },
  { building: "교양관", room: "2503" },
  { building: "교양관", room: "2504" },
  { building: "교양관", room: "2506" },
  { building: "교양관", room: "2507" },
  { building: "교양관", room: "2507-1" },
  { building: "교양관", room: "2508" },
  { building: "교양관", room: "2508-1" },
  { building: "교양관", room: "2509" },
  { building: "교양관", room: "2509-1" },
  { building: "교양관", room: "2510" },
  { building: "교양관", room: "2511" },
  { building: "교양관", room: "2512" },
  { building: "교양관", room: "2513" },
  { building: "교양관", room: "2517" },
  { building: "백년관", room: "0214" },
  { building: "백년관", room: "0301" },
  { building: "백년관", room: "0302" },
  { building: "백년관", room: "0303" },
  { building: "백년관", room: "0304" },
  { building: "백년관", room: "0305" },
  { building: "백년관", room: "0306" },
  { building: "백년관", room: "0309" },
  { building: "백년관", room: "0310" },
  { building: "백년관", room: "0311" },
  { building: "백년관", room: "0401" },
  { building: "백년관", room: "0402" },
  { building: "백년관", room: "0403" },
  { building: "백년관", room: "0404" },
  { building: "백년관", room: "0405" },
  { building: "백년관", room: "0413" },
  { building: "백년관", room: "0415" },
  { building: "백년관", room: "0416" },
  { building: "백년관", room: "0501" },
  { building: "백년관", room: "0502" },
  { building: "백년관", room: "0503" },
  { building: "백년관", room: "0506" },
  { building: "백년관", room: "0508" },
  { building: "백년관", room: "0509" },
  { building: "백년관", room: "0511" },
  { building: "백년관", room: "0514" },
  { building: "백년관", room: "0515" },
  { building: "백년관", room: "0516" },
  { building: "백년관", room: "0517" },
  { building: "어문학관", room: "1206" },
  { building: "어문학관", room: "1302" },
  { building: "어문학관", room: "1303" },
  { building: "어문학관", room: "1306" },
  { building: "어문학관", room: "1307" },
  { building: "어문학관", room: "1308" },
  { building: "어문학관", room: "1309" },
  { building: "어문학관", room: "1310" },
  { building: "어문학관", room: "1311" },
  { building: "어문학관", room: "1312" },
  { building: "어문학관", room: "1313" },
  { building: "어문학관", room: "1314" },
  { building: "어문학관", room: "1402" },
  { building: "어문학관", room: "1403" },
  { building: "어문학관", room: "1409-2" },
  { building: "어문학관", room: "1410" },
  { building: "어문학관", room: "1411" },
  { building: "어문학관", room: "1501" },
  { building: "어문학관", room: "1502" },
  { building: "어문학관", room: "1512" },
  { building: "어문학관", room: "1513" },
  { building: "어문학관", room: "1514" },
  { building: "왕산문화예술관", room: "101" },
  { building: "인문경상관", room: "4212" },
  { building: "인문경상관", room: "4214" },
  { building: "인문경상관", room: "4215" },
  { building: "인문경상관", room: "4216" },
  { building: "인문경상관", room: "4402" },
  { building: "인문경상관", room: "4404-1" },
  { building: "인문경상관", room: "4411" },
  { building: "인문경상관", room: "4415" },
  { building: "인문경상관", room: "4417" },
  { building: "인문경상관", room: "4418" },
  { building: "인문경상관", room: "4419" },
  { building: "자연과학관", room: "3114" },
  { building: "자연과학관", room: "3311" },
  { building: "자연과학관", room: "3411" },
  { building: "학생회관", room: "1무용실" },
  { building: "공학관", room: "5201" },
  { building: "공학관", room: "5206" },
  { building: "공학관", room: "5207" },
  { building: "공학관", room: "5208" },
  { building: "공학관", room: "5213" },
];

export default function AdminPage({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [blockedRooms, setBlockedRooms] = useState(getBlockedRooms());
  const [tab, setTab] = useState("reservations");

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

  const handleApprove = async (id) => {
    if (!window.confirm("이 예약을 승인하시겠습니까?")) return;
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "승인됨" } : r));
  };

  const toggleBlockRoom = (building, room) => {
    const key = `${building}_${room}`;
    const current = getBlockedRooms();
    const exists = current.includes(key);
    const updated = exists ? current.filter(k => k !== key) : [...current, key];
    saveBlockedRooms(updated);
    setBlockedRooms(updated);
  };

  const isBlocked = (building, room) => blockedRooms.includes(`${building}_${room}`);

  const activeReservations = reservations.filter(r => r.status !== "취소됨" && r.status !== "심사중" && r.status !== "승인 대기");
  const cancelledReservations = reservations.filter(r => r.status === "취소됨");
  const pendingReservations = reservations.filter(r => r.status === "심사중" || r.status === "승인 대기");

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#002d6e", margin: 0 }}>🛡️ 관리자 페이지</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>전체 예약 내역을 관리합니다.</p>
        </div>
        <button style={{ background: "#f0f0f0", border: "1px solid #ccc", borderRadius: 4, padding: "8px 16px", fontSize: 13, cursor: "pointer" }} onClick={onBack}>← 메인으로</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["reservations", "📋 예약 관리"], ["blocked", "🚫 대여불가 강의실 설정"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: tab === val ? "#002d6e" : "#fff",
            color: tab === val ? "#fff" : "#555",
            border: tab === val ? "1px solid #002d6e" : "1px solid #ccc",
          }}>{label}</button>
        ))}
      </div>

      {tab === "blocked" && (
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#002d6e", marginBottom: 4 }}>🚫 대여불가 강의실 설정</h2>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>설정된 강의실은 특별 사유 없이 대여 불가이며, 행사허가원 제출 시 신청 가능합니다.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #eee" }}>
                <th style={thStyle}>건물</th>
                <th style={thStyle}>호실</th>
                <th style={thStyle}>상태</th>
                <th style={thStyle}>설정</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CLASSROOMS.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={tdStyle}>{c.building}</td>
                  <td style={tdStyle}>{c.room}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: isBlocked(c.building, c.room) ? "#ffe8e8" : "#e6f7ee", color: isBlocked(c.building, c.room) ? "#bf2d2d" : "#00824a" }}>
                      {isBlocked(c.building, c.room) ? "대여불가" : "대여가능"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleBlockRoom(c.building, c.room)} style={{ ...btnStyle, background: isBlocked(c.building, c.room) ? "#e6f7ee" : "#ffe8e8", color: isBlocked(c.building, c.room) ? "#00824a" : "#bf2d2d", border: isBlocked(c.building, c.room) ? "1px solid #b7ebd0" : "1px solid #f5c6c6" }}>
                      {isBlocked(c.building, c.room) ? "대여가능으로 변경" : "대여불가로 설정"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reservations" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["all", "전체"], ["studyroom", "스터디룸"], ["classroom", "강의실"], ["facility", "행사시설"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilterType(val)} style={{
                padding: "6px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: filterType === val ? "#002d6e" : "#fff",
                color: filterType === val ? "#fff" : "#555",
                border: filterType === val ? "1px solid #002d6e" : "1px solid #ccc",
              }}>{label}</button>
            ))}
            <button onClick={fetchReservations} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 13, cursor: "pointer", background: "#fff", border: "1px solid #ccc", color: "#555", marginLeft: "auto" }}>🔄 새로고침</button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>불러오는 중...</div>
          ) : (
            <div>
              {pendingReservations.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #ffc107", borderRadius: 6, marginBottom: 20, overflow: "hidden" }}>
                  <div style={{ background: "#ffc107", color: "#333", padding: "10px 16px", fontWeight: 700, fontSize: 14 }}>
                    ⏳ 심사중 예약 ({pendingReservations.length}건)
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #eee" }}>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>유형</th>
                        <th style={thStyle}>예약자</th>
                        <th style={thStyle}>날짜</th>
                        <th style={thStyle}>건물</th>
                        <th style={thStyle}>호실</th>
                        <th style={thStyle}>시간</th>
                        <th style={thStyle}>제출파일</th>
                        <th style={thStyle}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingReservations.map((r) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={tdStyle}>{r.id}</td>
                          <td style={tdStyle}><span style={{ ...badgeStyle, ...getBadgeColor(r.type) }}>{typeLabel(r.type)}</span></td>
                          <td style={tdStyle}><strong>{r.user_name}</strong><br /><span style={{ color: "#888", fontSize: 11 }}>{r.username}</span></td>
                          <td style={tdStyle}>{r.date}</td>
                          <td style={tdStyle}>{r.building}</td>
                          <td style={tdStyle}>{r.room}</td>
                          <td style={tdStyle}>{r.start_time} ~ {r.end_time}</td>
                          <td style={tdStyle}>
                            {r.file_url
                              ? <a href={r.file_url} download style={{ color: "#002d6e", fontSize: 12, fontWeight: 600 }}>📥 다운로드</a>
                              : <span style={{ color: "#aaa", fontSize: 12 }}>없음</span>
                            }
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleApprove(r.id)} style={{ ...btnStyle, background: "#e6f7ee", color: "#00824a", border: "1px solid #b7ebd0" }}>승인</button>
                              <button onClick={() => handleCancel(r.id)} style={{ ...btnStyle, background: "#fff3cd", color: "#9a6700", border: "1px solid #ffc107" }}>거절</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
                        <th style={thStyle}>건물</th>
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
                          <td style={tdStyle}><span style={{ ...badgeStyle, ...getBadgeColor(r.type) }}>{typeLabel(r.type)}</span></td>
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
                        <th style={thStyle}>건물</th>
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
            </div>
          )}
        </div>
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