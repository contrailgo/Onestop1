import { useState, useEffect } from "react";

export default function MainDashboard({ onStudyRoom, onClassroom }) {
  const [clock, setClock] = useState("");
  const [updateStandard, setUpdateStandard] = useState("");
  const [myStudyTime, setMyStudyTime] = useState("");
  const [myEventTime, setMyEventTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const dayList = ["일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = dayList[now.getDay()];

      setClock(`${year}년 ${month}월 ${date}일 (${dayOfWeek}) ${hours}:${minutes}:${seconds}`);
      setUpdateStandard(`${year}-${month}-${date} ${hours}:${minutes} 기준`);

      const future = new Date();
      future.setDate(now.getDate() + 5);
      const fY = future.getFullYear();
      const fM = String(future.getMonth() + 1).padStart(2, "0");
      const fD = String(future.getDate()).padStart(2, "0");

      setMyStudyTime(`오늘 (${month}/${date}) 17:00 ~ 19:00 (2시간)`);
      setMyEventTime(`${fY}-${fM}-${fD} 13:00 ~ 17:00`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col">

      {/* 상단 헤더 */}
      <header className="bg-[#002c5f] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-700 p-2 rounded-lg text-white">
              <i className="fa-solid fa-tree-city text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider leading-none">
                HUFS <span className="text-[#3498db]">SpaceRoom</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1">
                Global Campus
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-800/40 px-4 py-1.5 rounded-full border border-slate-700/50 text-xs">
            <i className="fa-regular fa-clock text-emerald-400 animate-pulse"></i>
            <span className="font-mono text-slate-300">{clock}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">학부생</p>
              <p className="text-sm font-semibold text-slate-200">이모현 (20265678)</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
              모
            </div>
            <button
              className="text-sm font-medium text-slate-300 hover:text-white border border-slate-600 px-3 py-1.5 rounded-lg transition"
              onClick={() => alert("시연용 메인 페이지로, 로그아웃 기능이 제한됩니다.")}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row flex-grow px-6 py-8 gap-8">

        {/* 사이드바 */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-700 to-[#002c5f]"></div>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500 border border-slate-200">
              <i className="fa-solid fa-compass text-2xl text-emerald-700"></i>
            </div>
            <h3 className="font-bold text-slate-800">이모현 학우님</h3>
            <p className="text-xs text-slate-400 mt-1">글로벌캠퍼스 컴퓨터공학전공</p>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 text-center text-xs">
              <div>
                <p className="text-slate-400">캠퍼스 소속</p>
                <p className="font-semibold text-emerald-700 mt-0.5">글로벌</p>
              </div>
              <div className="border-l border-slate-100">
                <p className="text-slate-400">예약한도</p>
                <p className="font-semibold text-slate-700 mt-0.5">주 3회</p>
              </div>
            </div>
          </div>

          {/* 사이드 메뉴 */}
          <nav className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <ul className="divide-y divide-slate-100 text-sm">
              <li>
                <a href="#" className="flex items-center gap-3 px-5 py-4 font-semibold text-[#002c5f] bg-slate-50 border-l-4 border-[#002c5f]">
                  <i className="fa-solid fa-chart-pie w-5"></i> 대시보드 홈
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-5 py-4 text-slate-600 hover:bg-slate-50/50 transition-all"
                  onClick={(e) => { e.preventDefault(); onStudyRoom && onStudyRoom(); }}>
                  <i className="fa-solid fa-users w-5"></i> 스터디룸 조회
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-5 py-4 text-slate-600 hover:bg-slate-50/50 transition-all"
                  onClick={(e) => { e.preventDefault(); alert("서브페이지(강의실 대여) 연결용 목업 메뉴입니다."); }}>
                  <i className="fa-solid fa-graduation-cap w-5"></i> 강의실 시간표 조회
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-5 py-4 text-slate-600 hover:bg-slate-50/50 transition-all"
                  onClick={(e) => { e.preventDefault(); alert("서브페이지(행사시설 대여) 연결용 목업 메뉴입니다."); }}>
                  <i className="fa-solid fa-champagne-glasses w-5"></i> 행사시설 결재조회
                </a>
              </li>
            </ul>
          </nav>

          {/* 에코 배너 */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 text-6xl">
              <i className="fa-solid fa-water"></i>
            </div>
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">Myeongsudang Eco-Rule</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              자연과 함께하는 글로벌캠퍼스! 명수당 야외잔디무대 대여 시, 분리수거 및 주변 정돈은 필수 준수사항입니다.
            </p>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow space-y-8">

          {/* 배너 */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-[#002c5f] text-white p-8 rounded-2xl shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-12 opacity-15 text-[150px] pointer-events-none">
              <i className="fa-solid fa-mountain-sun"></i>
            </div>
            <div className="max-w-2xl relative z-10">
              <span className="bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                HUFS Global Campus SpaceRoom
              </span>
              <h1 className="text-3xl font-bold mt-3 mb-2">안녕하세요, 이모현 학우님!</h1>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                글로벌캠퍼스 내의 유휴 공간들을 학우분들이 자율적으로 안전하게 대여하고 모임을 가질 수 있도록 지원하는 대실 포털 대시보드입니다.
              </p>
            </div>
          </div>

          {/* 공간 유형 카드 3개 */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-emerald-700"></i> 글로벌캠퍼스 공간 유형
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 스터디룸 카드 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-4">
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">스터디룸</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    백년관, 공학관 러닝존 등 소규모 협동 학습과 프로젝트 회의를 위해 예약 승인 절차 없이 실시간으로 대여할 수 있는 스페이스입니다.
                  </p>
                </div>
                <button
                  onClick={() => onStudyRoom && onStudyRoom()}
                  className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs transition"
                >
                  조회 및 신청
                </button>
              </div>

              {/* 강의실 카드 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-blue-50 text-[#3498db] flex items-center justify-center text-xl font-bold mb-4">
                    <i className="fa-solid fa-calendar-week"></i>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">일반 강의실</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    백년관 강의실, 어문관 교실 등 공식 학사 요일별 시간표와 실시간 공강 조회를 동기화하여 비어있는 정규 교실을 예약합니다.
                  </p>
                </div>
                <button
                  onClick={() => onClassroom && onClassroom()}
                  className="mt-6 w-full py-2.5 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg font-medium text-xs transition"
                >
                  조회 및 신청
                </button>
              </div>

              {/* 행사시설 카드 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold mb-4">
                    <i className="fa-solid fa-file-signature"></i>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">행사시설</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    명수당 야외잔디무대, 백년관 대강당 등 안전 및 주변 소음 관리를 위해 공식 심사 계획서 검토가 필요한 인프라입니다.
                  </p>
                </div>
                <button
                  onClick={() => alert("행사시설 대여 상세 페이지로 이동하는 링크 구역입니다.")}
                  className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-xs transition"
                >
                  조회 및 신청
                </button>
              </div>

            </div>
          </div>

          {/* 하단 현황판 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 시설 현황판 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <i className="fa-solid fa-circle-dot text-emerald-500 animate-pulse"></i> 캠퍼스 내 주요 대여 시설 현황
                </h3>
                <span className="text-xs text-slate-400">{updateStandard}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-3">장소 명칭</th>
                      <th className="py-3 px-3">분류</th>
                      <th className="py-3 px-3">수용 인원</th>
                      <th className="py-3 px-3 text-center">대여 상황</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600">
                    {[
                      { name: "백년관 201호 (스터디룸)", type: "스터디룸", typeColor: "text-emerald-600", seats: "6인석", status: "이용 중", statusStyle: "bg-rose-50 text-rose-700 border-rose-100" },
                      { name: "백년관 501호 대강의실", type: "일반강의실", typeColor: "text-[#3498db]", seats: "80인석", status: "대여 가능", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                      { name: "명수당 야외잔디무대", type: "행사시설", typeColor: "text-purple-600", seats: "200인석", status: "이용 중", statusStyle: "bg-rose-50 text-rose-700 border-rose-100" },
                      { name: "공학관 312호 일반강의실", type: "일반강의실", typeColor: "text-[#3498db]", seats: "40인석", status: "대여 가능", statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-3 font-semibold text-slate-800">{row.name}</td>
                        <td className={`py-3.5 px-3 font-medium ${row.typeColor}`}>{row.type}</td>
                        <td className="py-3.5 px-3">{row.seats}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${row.statusStyle}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 나의 대실 현황 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-receipt text-amber-500"></i> 나의 실시간 대여 현황
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700 block">스터디룸</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">백년관 203호 스터디존</h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <i className="fa-regular fa-clock"></i> {myStudyTime}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">예약 승인 완료</span>
                      <span className="text-[11px] text-emerald-700 font-semibold cursor-help"
                        onClick={() => alert("스마트 입실용 QR코드 팝업 기능 연동 영역입니다.")}>
                        <i className="fa-solid fa-qrcode mr-0.5"></i> QR코드
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-purple-700 block">행사대실</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">명수당 야외잔디무대</h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <i className="fa-regular fa-clock"></i> {myEventTime}
                    </p>
                    <div className="mt-3">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-medium">⏳ 단대 관리자 심사 중</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                <p className="text-[11px] text-slate-400">교내 규정에 따라 노쇼 3회 발생 시 글로벌캠퍼스 공간 예약이 제한됩니다.</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-semibold text-slate-500">한국외국어대학교 오픈소스 소프트웨어 설계 및 구현 과제</p>
          <p>본 페이지는 글로벌캠퍼스(용인) 학사 시스템 공간 예약 메인 관리 대시보드 시뮬레이션용 정적 HTML 포털입니다.</p>
          <p className="text-slate-300">© 2026 HUFS SpaceRoom Design Project (Global Campus). All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}
