import { useState, useEffect } from "react";

const API_BASE = "https://onestop1-production.up.railway.app/api";

const typeLabel = (type) => {
  if (type === "studyroom") return "스터디룸";
  if (type === "classroom") return "강의실";
  if (type === "facility") return "행사시설";
  return type;
};

// 로컬스토리지로 대여불가 강의실 관리
function getBlockedRooms() {
  try { return JSON.parse(localStorage.getItem("blockedRooms") || "[]"); } catch { return []; }
}
function saveBlockedRooms(list) {
  localStorage.setItem("blockedRooms", JSON.stringify(list));
}

const ALL_CLASSROOMS = [
  { building: "백년관", room: "101호" },
  { building: "백년관", room: "102호" },
  { building: "백년관", room: "201호" },
  { building: "어문관", room: "101호" },
  { building: "어문관", room: "201호" },
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
    await fetch(`${API_BASE}/reservations/${id}/approve`, { method: "PATCH" });
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

  const activeReservations = reservations.filter(r => r.status !== "취소됨");
  const cancelledReservations = reservations.filter(r => r.status === "취소됨");
  const pendingReservations = reservations.filter(r => r.status === "심사중");

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#002d6e", margin: 0 }}>🛡️ 관리자 페이지</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>전체 예약 내역을 관리합니다.</p>
        </div>
        <button style={{ background: "#f0f0f0", border: "1px solid #ccc", borderRadius: 4, padding: "8px 16px", fontSize: 13, cursor: "pointer" }} onClick={onBack}>← 메인으로</button>
      </div>

      {/* 탭 */}
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
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["all", "전체"], ["studyroom", "스터디룸"], ["classroom", "강의실"], ["facility", "행사시설"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilterType(val)} style={{
                padding: "6px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: filterType === val ? "#002d6e" : "#fff",
                color: filterType === val