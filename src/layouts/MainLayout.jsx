import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";
import Sidebar from "../components/sidebar/Sidebar";

export default function MainLayout() {
  const mainRef = useRef(null);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const mainEl = mainRef.current;

    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "auto" });
    }

    // Đảm bảo cả cửa sổ cũng được reset scroll khi chuyển trang
    window.scrollTo({ top: 0, behavior: "auto" });
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen flex-col bg-[#0b0b15] text-white">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main
          ref={mainRef}
          className="scrollbar-muted relative flex-1 overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#0b1020] to-[#0a1628] px-4 py-4 sm:px-6 sm:py-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.08),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(167,139,250,0.08),transparent_45%)]" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}