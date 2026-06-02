const express = require("express");
const router = express.Router();
const db = require("../db/database");

// 전체 예약 조회
router.get("/", (req, res) => {
  const { username, type } = req.query;
  let query = "SELECT * FROM reservations WHERE 1=1";
  const params = [];
  if (username) { query += " AND username = ?"; params.push(username); }
  if (type) { query += " AND type = ?"; params.push(type); }
  query += " ORDER BY created_at DESC";
  const reservations = db.prepare(query).all(...params);
  res.json({ success: true, data: reservations });
});

// 전체 예약 조회 (관리자용)
router.get("/all", (req, res) => {
  const { type } = req.query;
  let query = "SELECT r.*, u.name as user_name FROM reservations r LEFT JOIN users u ON r.username = u.student_id WHERE 1=1";
  const params = [];
  if (type) { query += " AND r.type = ?"; params.push(type); }
  query += " ORDER BY r.created_at DESC";
  const reservations = db.prepare(query).all(...params);
  res.json({ success: true, data: reservations });
});

// 예약 생성
router.post("/", (req, res) => {
  const { type, date, building, room, start_time, end_time, username, purpose, group_type, contact, host_group, leader_name, leader_contact, status } = req.body;
  if (!type || !date || !start_time || !end_time || !username) {
    return res.status(400).json({ success: false, message: "필수 항목이 누락됐습니다." });
  }
  const conflict = db.prepare(`
    SELECT id FROM reservations
    WHERE type = ? AND date = ? AND building = ? AND room = ?
    AND status != '취소됨'
    AND NOT (end_time <= ? OR start_time >= ?)
  `).get(type, date, building, room, start_time, end_time);
  if (conflict) {
    return res.status(409).json({ success: false, message: "이미 예약된 시간입니다." });
  }
  const finalStatus = status || "예약완료";
  const result = db.prepare(`
    INSERT INTO reservations (type, date, building, room, start_time, end_time, username, purpose, group_type, contact, host_group, leader_name, leader_contact, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(type, date, building, room, start_time, end_time, username, purpose, group_type, contact, host_group, leader_name, leader_contact, finalStatus);
  res.json({ success: true, id: result.lastInsertRowid });
});

// 예약 취소
router.patch("/:id/cancel", (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE reservations SET status = '취소됨' WHERE id = ?").run(id);
  res.json({ success: true });
});

// 예약 승인 (관리자 전용)
router.patch("/:id/approve", (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE reservations SET status = '승인됨' WHERE id = ?").run(id);
  res.json({ success: true });
});

// 예약 삭제 (관리자 전용)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM reservations WHERE id = ?").run(id);
  res.json({ success: true });
});

// 슬롯 조회
router.get("/slots", (req, res) => {
  const { date, building, room, type } = req.query;
  const slots = db.prepare(`
    SELECT start_time, end_time FROM reservations
    WHERE date = ? AND building = ? AND room = ? AND type = ? AND status != '취소됨'
  `).all(date, building, room, type);
  res.json({ success: true, data: slots });
});

module.exports = router;