import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Toast from "../components/common/Toast";
import AdminDialogHost from "../components/admin/AdminDialogHost";
import { AUTH_REQUIRED_EVENT, getAuthRequiredMessage } from "../utils/authPrompt";
import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";
import Sidebar from "../components/sidebar/Sidebar";
import useAuthStore from "../store/auth.store";

export default function MainLayout() {
  const mainRef = useRef(null);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = useAuthStore((state) => state.role);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isArtistWorkspaceRoute = /^\/artist\/(dashboard|profile|albums|songs|trash)(\/|$)/.test(
    location.pathname
  );
  const isUserRoute = !isAdminRoute && !isArtistWorkspaceRoute;
  const shouldShowPlayer = role !== "ARTIST" && role !== "ADMIN";
  const [authToastMessage, setAuthToastMessage] = useState("");



  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onAuthRequired = (event) => {
      const nextMessage = event?.detail?.message || getAuthRequiredMessage();
      setAuthToastMessage(nextMessage);
    };

    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
  }, []);

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
          className={`scrollbar-page relative flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 ${
            isAdminRoute
              ? "admin-main-surface bg-[#0a0a0a]"
              : isArtistWorkspaceRoute
                ? "artist-main-surface bg-[#0a0a0a]"
                : "user-main-surface bg-[#0a0a0a]"
          }`}
        >
          <div
            className={`relative z-10 ${
              isAdminRoute
                ? "admin-content"
                : isArtistWorkspaceRoute
                  ? "artist-content"
                  : isUserRoute
                    ? "user-content"
                    : ""
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {shouldShowPlayer && <PlayerBar />}
      <AdminDialogHost />
      <Toast
        title="Thông báo"
        message={authToastMessage}
        onClose={() => setAuthToastMessage("")}
      />
    </div>
  );
}
