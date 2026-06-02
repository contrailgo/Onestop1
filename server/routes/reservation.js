const express = require("express");
const router = express.Router();
const db = require("../db/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 업로드 폴더 생성
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

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
  const finalStatus = status || "승인 대기";
  const result = db.prepare(`
    INSERT INTO reservations (type, date, building, room, start_time, end_time, username, purpose, group_type, contact, host_group, leader_name, leader_contact, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(type, date, building, room, start_time, end_time, username, purpose, group_type, contact, host_group, leader_name, leader_contact, finalStatus);
  res.json({ success: true, id: result.lastInsertRowid });
});

// 파일 업로드 + 예약 생성
router.post("/upload", upload.single("file"), (req, res) => {
  const { type, date, building, room, start_time, end_time, username, purpose, group_type, contact } = req.body;
  if (!type || !date || !start_time || !end_time || !username) {
    return res.status(400).json({ success: false, message: "필수 항목이 누락됐습니다." });
  }
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(`
    INSERT INTO reservations (type, date, building, room, start_time, end_time, username, purpose, group_type, contact, status, file_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '심사중', ?)
  `).run(type, date, building, room, start_time, end_time, username, purpose, group_type, contact, fileUrl);
  res.json({ success: true, id: result.lastInsertRowid });
});

// 파일 다운로드
router.get("/file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "파일 없음" });
  res.download(filePath);
});

// 예약 취소
router.patch("/:id/cancel", (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE reservations SET status = '취소됨' WHERE id = ?").run(id);
  res.json({ success: true });
});

// 예약 승인
router.patch("/:id/approve", (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE reservations SET status = '승인됨' WHERE id = ?").run(id);
  res.json({ success: true });
});

// 예약 삭제
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