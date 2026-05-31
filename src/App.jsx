import { useState } from "react";
import Login from "./components/Login";
import MainDashboard from "./components/MainDashboard";
import DatePicker from "./components/studyroom/DatePicker";
import BuildingPicker from "./components/studyroom/BuildingPicker";
import RoomPicker from "./components/studyroom/RoomPicker";
import ClassroomApp from "./components/classroom/ClassroomApp";
import FacilityApp from "./components/facility/FacilityApp";
import AdminPage from "./components/AdminPage";

// 새로고침해도 로그인 유지: sessionStorage에서 유저 복원
const savedUser = (() => {
  try {
    const data = sessionStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch { return null; }
})();

export default function App() {
  const [page, setPage] = useState(savedUser ? "main" : "login");
  const [user, setUser] = useState(savedUser);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const resetStudyroom = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedBuilding(null);
  };

  const handleLogin = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("main");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setPage("login");
    resetStudyroom();
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    return `${dateObj.year}-${String(dateObj.month + 1).padStart(2, "0")}-${String(dateObj.day).padStart(2, "0")}`;
  };

  if (page === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (page === "main") {
    return (
      <MainDashboard
        user={user}
        onStudyRoom={() => { resetStudyroom(); setPage("studyroom"); }}
        onClassroom={() => setPage("classroom")}
        onFacility={() => setPage("facility")}
        onAdmin={() => setPage("admin")}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "classroom") return <ClassroomApp user={user} onBack={() => setPage("main")} />;
  if (page === "facility") return <FacilityApp user={user} onBack={() => setPage("main")} />;
  if (page === "admin") return <AdminPage onBack={() => setPage("main")} />;

  return (
    <>
      {step === 1 && (
        <DatePicker
          onNext={(date) => { setSelectedDate(date); setStep(2); }}
          onBack={() => setPage("main")}
        />
      )}
      {step === 2 && (
        <BuildingPicker
          onPrev={() => setStep(1)}
          onNext={(building) => { setSelectedBuilding(building); setStep(3); }}
          onBack={() => setPage("main")}
        />
      )}
      {step === 3 && (
        <RoomPicker
          building={selectedBuilding}
          user={user}
          selectedDate={formatDate(selectedDate)}
          onPrev={() => setStep(2)}
          onNext={() => { setPage("main"); resetStudyroom(); }}
          onBack={() => setPage("main")}
        />
      )}
    </>
  );
}