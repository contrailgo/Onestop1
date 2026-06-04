const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "onestop.db"));

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    campus TEXT DEFAULT '글로벌',
    is_admin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    building TEXT,
    room TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    username TEXT NOT NULL,
    purpose TEXT,
    group_type TEXT,
    contact TEXT,
    host_group TEXT,
    leader_name TEXT,
    leader_contact TEXT,
    status TEXT DEFAULT '승인 대기',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// 마이그레이션: 기존 DB에 is_admin 컬럼 없으면 자동 추가
const columns = db.prepare("PRAGMA table_info(users)").all();
const hasIsAdmin = columns.some(c => c.name === "is_admin");
if (!hasIsAdmin) {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
  console.log("is_admin 컬럼 추가됨");
}

// 유저 데이터 삽입
db.prepare(`INSERT OR IGNORE INTO users (student_id, name, department, campus, is_admin) VALUES (?, ?, ?, ?, ?)`).run('202501337', '이민석', '컴퓨터공학전공', '글로벌', 1);
db.prepare(`INSERT OR IGNORE INTO users (student_id, name, department, campus, is_admin) VALUES (?, ?, ?, ?, ?)`).run('202402188', '이종빈', '컴퓨터공학전공', '글로벌', 0);
db.prepare(`INSERT OR IGNORE INTO users (student_id, name, department, campus, is_admin) VALUES (?, ?, ?, ?, ?)`).run('202501707', '고은세', '컴퓨터공학전공', '글로벌', 0);
db.prepare(`INSERT OR IGNORE INTO users (student_id, name, department, campus, is_admin) VALUES (?, ?, ?, ?, ?)`).run('202300643', '김동민', '컴퓨터공학전공', '글로벌', 0);

// 기존 관리자 계정 is_admin 업데이트 보장
db.prepare("UPDATE users SET is_admin = 1 WHERE student_id = '202501337'").run();
// 마이그레이션: file_url 컬럼 없으면 추가
const reservationColumns = db.prepare("PRAGMA table_info(reservations)").all();
const hasFileUrl = reservationColumns.some(c => c.name === "file_url");
if (!hasFileUrl) {
  db.exec("ALTER TABLE reservations ADD COLUMN file_url TEXT");
  console.log("file_url 컬럼 추가됨");
}
// blocked_rooms 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS blocked_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building TEXT NOT NULL,
    room TEXT NOT NULL,
    UNIQUE(building, room)
  );
`);
module.exports = db;