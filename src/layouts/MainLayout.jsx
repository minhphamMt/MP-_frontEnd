import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminDialogHost from "../components/admin/AdminDialogHost";
import Toast from "../components/common/Toast";
import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";
import PlayerDockPanel from "../components/player/PlayerDockPanel";
import Sidebar from "../components/sidebar/Sidebar";
import useAuthStore from "../store/auth.store";
import { AUTH_REQUIRED_EVENT, getAuthRequiredMessage } from "../utils/authPrompt";
import { APP_TOAST_EVENT } from "../utils/appToast";

export default function MainLayout() {
  const mainRef = useRef(null);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");
  const [appToast, setAppToast] = useState({
    title: "",
    message: "",
    duration: 2600,
  });
  const role = useAuthStore((state) => state.role);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isArtistWorkspaceRoute =
    /^\/artist\/(dashboard|profile|albums|songs|trash)(\/|$)/.test(
      location.pathname
    );
  const isUserRoute = !isAdminRoute && !isArtistWorkspaceRoute;
  const shouldShowPlayer = role !== "ARTIST" && role !== "ADMIN";
  const isArtistChrome = role === "ARTIST";

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
    if (typeof window === "undefined") return undefined;

    const onAppToast = (event) => {
      const nextDetail = event?.detail || {};
      setAppToast({
        title: nextDetail.title || "Thông báo",
        message: nextDetail.message || "",
        duration: nextDetail.duration || 2600,
      });
    };

    window.addEventListener(APP_TOAST_EVENT, onAppToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, onAppToast);
  }, []);

  useEffect(() => {
    const mainEl = mainRef.current;

    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "auto" });
    }

    window.scrollTo({ top: 0, behavior: "auto" });
    if (!isSidebarOpen) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      setIsSidebarOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isSidebarOpen, location.pathname]);

  return (
    <div className="flex h-screen flex-col bg-[#000000] text-white">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        isArtistWorkspace={isArtistChrome}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isArtistWorkspace={isArtistChrome}
        />

        <main
          ref={mainRef}
          className={`scrollbar-page relative min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 ${
            isAdminRoute
              ? "admin-main-surface bg-[#0a0a0a]"
              : isArtistWorkspaceRoute
                ? "artist-main-surface bg-[#090d18]"
                : "user-main-surface bg-[#0a0a0a]"
          }`}
        >
          <div
            className={`relative z-10 w-full min-w-0 ${
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

        {shouldShowPlayer ? <PlayerDockPanel /> : null}
      </div>

      {shouldShowPlayer ? <PlayerBar /> : null}
      <AdminDialogHost />

      <Toast
        title="Thông báo"
        message={authToastMessage}
        onClose={() => setAuthToastMessage("")}
      />
      <Toast
        title={appToast.title || "Thông báo"}
        message={appToast.message}
        duration={appToast.duration}
        onClose={() => setAppToast((prev) => ({ ...prev, message: "" }))}
      />
    </div>
  );
}
