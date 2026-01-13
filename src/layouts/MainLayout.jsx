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
    <div className="flex h-screen flex-col bg-[#000000] text-white">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main
          ref={mainRef}
           className="scrollbar-muted relative flex-1 overflow-y-auto bg-[#121212] px-4 py-4 sm:px-6 sm:py-6"
        >
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}