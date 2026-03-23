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
import { shouldUseArtistTheme } from "../utils/routeContext";

export default function MainLayout() {
  const mainRef = useRef(null);
  const previousPathnameRef = useRef(null);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");
  const [appToast, setAppToast] = useState({
    title: "",
    message: "",
    duration: 2600,
  });
  const role = useAuthStore((state) => state.role);
  const authContext = useAuthStore((state) => state.authContext);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const usesArtistExperience =
    !isAdminRoute &&
    shouldUseArtistTheme({
      pathname: location.pathname,
      search: location.search,
      role,
      authContext,
    });
  const isUserRoute = !isAdminRoute && !usesArtistExperience;
  const shouldShowPlayer = role !== "ARTIST" && role !== "ADMIN";

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
  }, [location.pathname]);

  useEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = location.pathname;
      return undefined;
    }

    if (previousPathnameRef.current === location.pathname) {
      return undefined;
    }

    previousPathnameRef.current = location.pathname;

    if (!isSidebarOpen) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      setIsSidebarOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isSidebarOpen, location.pathname]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return undefined;
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    const syncBodyLock = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = previousOverflow;
        document.body.style.touchAction = previousTouchAction;
        return;
      }

      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    };

    syncBodyLock();
    window.addEventListener("resize", syncBodyLock);

    return () => {
      window.removeEventListener("resize", syncBodyLock);
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isSidebarOpen]);

  return (
    <div className="app-shell flex flex-col bg-[#000000] text-white">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        isArtistWorkspace={usesArtistExperience}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isArtistWorkspace={usesArtistExperience}
        />

        <main
          ref={mainRef}
          className={`scrollbar-page relative min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 ${
            isAdminRoute
              ? "admin-main-surface bg-[#0a0a0a]"
              : usesArtistExperience
                ? "artist-main-surface bg-[#0c1623]"
                : "user-main-surface bg-[#0a0a0a]"
          }`}
        >
          <div
            className={`relative z-10 w-full min-w-0 ${
              isAdminRoute
                ? "admin-content"
                : usesArtistExperience
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
