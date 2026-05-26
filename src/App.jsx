import { useState } from "react";
import MainDashboard from "./components/MainDashboard";
import DatePicker from "./components/studyroom/DatePicker";
import BuildingPicker from "./components/studyroom/BuildingPicker";
import RoomPicker from "./components/studyroom/RoomPicker";
import ClassroomApp from "./components/classroom/ClassroomApp";

export default function App() {
  const [page, setPage] = useState("main"); // main | studyroom | classroom
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const resetStudyroom = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedBuilding(null);
  };

  // 메인
  if (page === "main") {
    return (
      <MainDashboard
        onStudyRoom={() => { resetStudyroom(); setPage("studyroom"); }}
        onClassroom={() => setPage("classroom")}
      />
    );
  }

  // 강의실
  if (page === "classroom") {
    return <ClassroomApp onBack={() => setPage("main")} />;
  }

  // 스터디룸 3단계
  return (
    <>
      {step === 1 && (
        <DatePicker onNext={(date) => { setSelectedDate(date); setStep(2); }} />
      )}
      {step === 2 && (
        <BuildingPicker
          onPrev={() => setStep(1)}
          onNext={(building) => { setSelectedBuilding(building); setStep(3); }}
        />
      )}
      {step === 3 && (
        <RoomPicker
          building={selectedBuilding}
          onPrev={() => setStep(2)}
          onNext={(result) => {
            alert(`예약 완료!\n호실: ${result.room}\n시간: ${result.time}`);
            setPage("main");
            resetStudyroom();
          }}
        />
      )}
    </>
  );
}