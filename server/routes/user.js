const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/login", (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ success: false, message: "아이디와 비밀번호를 입력해주세요." });
  }

  const user = db.prepare("SELECT * FROM users WHERE student_id = ?").get(student_id);

  if (!user) {
    return res.status(401).json({ success: false, message: "등록되지 않은 아이디입니다." });
  }

  res.json({
    success: true,
    user: {
      student_id: user.student_id,
      name: user.name,
      department: user.department,
      campus: user.campus,
      is_admin: user.is_admin,
    },
  });
});

module.exports = router;