import { useState } from "react";

const API_BASE = "http://localhost:3001/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    if (!agreed) {
      setError("개인정보 수집에 동의해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "로그인에 실패했습니다.");
        return;
      }

      setSuccess(`${data.user.name}님, 환영합니다!`);
      setTimeout(() => {
        onLogin && onLogin(data.user);
      }, 1000);

    } catch (err) {
      setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.page}>
        {/* 왼쪽 패널 */}
        <div style={styles.leftPanel}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>
              <i className="ti ti-building-community" style={{ fontSize: 32, color: "#fff" }}></i>
            </div>
            <div style={styles.logoTitle}>One Stop Rental System</div>
            <div style={styles.logoSub}>한국외국어대학교</div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.infoSection}>
            <div style={styles.infoTitle}>전화 문의</div>
            <a style={styles.contactItem} href="tel:02-2173-2134">
              <i className="ti ti-door" style={styles.contactIcon}></i>
              <span style={styles.contactLabel}>강의실 대관</span>
              <span style={styles.contactNumber}>02-2173-2134</span>
            </a>
            <a style={styles.contactItem} href="tel:02-2173-2944">
              <i className="ti ti-alert-circle" style={styles.contactIcon}></i>
              <span style={styles.contactLabel}>시스템 오류</span>
              <span style={styles.contactNumber}>02-2173-2944</span>
            </a>
            <a style={styles.contactItem} href="tel:02-2173-2152">
              <i className="ti ti-key" style={styles.contactIcon}></i>
              <span style={styles.contactLabel}>ID / 비밀번호</span>
              <span style={styles.contactNumber}>02-2173-2152</span>
            </a>
          </div>

          <div style={styles.providerTag}>정보지원처 정보통신팀</div>
        </div>

        {/* 오른쪽 패널 */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrap}>
            <div style={styles.formHeading}>로그인</div>
            <div style={styles.formSub}>학번 또는 사번으로 로그인하세요</div>

            {error && (
              <div style={styles.errorMsg}>
                <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }}></i>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={styles.successMsg}>
                <i className="ti ti-circle-check" style={{ fontSize: 15, flexShrink: 0 }}></i>
                <span>{success}</span>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>아이디 (학번/사번)</label>
              <input
                style={styles.input}
                type="text"
                placeholder="학번 또는 사번"
                value={username}
                disabled={loading}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>비밀번호</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div style={styles.privacyBox}>
              <p style={{ marginBottom: 4 }}>1. 로그인을 통한 개인정보(학과, 학번/사번, 이름, 전화번호)는 시설 예약 확인을 위해 사용됩니다.</p>
              <p style={{ marginBottom: 4 }}>2. 위의 개인정보는 시스템 유지를 위해 운용기간 동안 유지됩니다.</p>
              <p>3. 개인정보 활용을 거부할 경우 시스템을 사용하실 수 없습니다.</p>
            </div>

            <div style={styles.agreeRow}>
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#002d6e", cursor: "pointer" }}
              />
              <label htmlFor="agree" style={{ fontSize: 13, color: "#333", cursor: "pointer", fontWeight: 500 }}>
                개인정보 수집에 동의합니다.
              </label>
            </div>

            <button
              style={{
                ...styles.btnLogin,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
              onClick={handleLogin}
            >
              <span>{loading ? "로그인 중..." : "Sign in!"}</span>
            </button>

            <div style={styles.findLinks}>
              <a href="#" style={styles.findLink}>비밀번호 찾기</a>
              <div style={styles.findSep}></div>
              <a href="#" style={styles.findLink}>졸업생 ID 찾기</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Noto Sans KR', sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f9",
  },
  page: {
    width: 900,
    minHeight: 580,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
  },
  leftPanel: {
    background: "#002d6e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    gap: 28,
  },
  logoArea: { textAlign: "center" },
  logoIcon: {
    width: 64, height: 64,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  logoTitle: { fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: -0.3 },
  logoSub: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, letterSpacing: 0.5 },
  divider: { width: 40, height: 1, background: "rgba(255,255,255,0.2)" },
  infoSection: { width: "100%" },
  infoTitle: {
    fontSize: 11, fontWeight: 600,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  contactItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px",
    background: "rgba(255,255,255,0.07)",
    borderRadius: 8, marginBottom: 6,
    textDecoration: "none",
  },
  contactIcon: { fontSize: 15, color: "rgba(255,255,255,0.55)", flexShrink: 0 },
  contactLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", flex: 1 },
  contactNumber: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" },
  providerTag: { fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.3 },
  rightPanel: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 40px", background: "#fff",
  },
  formWrap: { width: "100%", maxWidth: 320 },
  formHeading: { fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 4 },
  formSub: { fontSize: 13, color: "#888", marginBottom: 24 },
  errorMsg: {
    display: "flex",
    background: "#fff0f0",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12.5,
    color: "#b91c1c",
    marginBottom: 14,
    alignItems: "center",
    gap: 8,
  },
  successMsg: {
    display: "flex",
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12.5,
    color: "#166534",
    marginBottom: 14,
    alignItems: "center",
    gap: 8,
  },
  inputGroup: { marginBottom: 14 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 },
  input: {
    width: "100%", height: 42,
    border: "1px solid #dde1e8",
    borderRadius: 8,
    padding: "0 14px",
    fontSize: 14, color: "#111",
    background: "#f9fafb",
    outline: "none",
  },
  privacyBox: {
    background: "#f4f6f9",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 14,
    fontSize: 11.5,
    color: "#666",
    lineHeight: 1.7,
  },
  agreeRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 18 },
  btnLogin: {
    width: "100%", height: 44,
    background: "#002d6e", color: "#fff",
    fontSize: 14, fontWeight: 700,
    border: "none", borderRadius: 8,
    letterSpacing: 0.3,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  findLinks: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16 },
  findLink: { fontSize: 12, color: "#888", textDecoration: "none" },
  findSep: { width: 1, height: 12, background: "#ddd" },
};