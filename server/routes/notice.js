const express = require("express");
const router = express.Router();
const db = require("../db/database");

// 공지사항 전체 조회
router.get("/", (req, res) => {
  const notices = db.prepare("SELECT * FROM notices ORDER BY created_at DESC").all();
  res.json({ success: true, data: notices });
});

// 공지사항 작성 (관리자)
router.post("/", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: "제목과 내용을 입력해주세요." });
  const result = db.prepare("INSERT INTO notices (title, content) VALUES (?, ?)").run(title, content);
  res.json({ success: true, id: result.lastInsertRowid });
});

// 공지사항 삭제 (관리자)
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM notices WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;