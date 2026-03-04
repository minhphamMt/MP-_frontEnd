import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Toast from "../components/common/Toast";
import { AUTH_REQUIRED_EVENT, getAuthRequiredMessage } from "../utils/authPrompt";
import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";
import Sidebar from "../components/sidebar/Sidebar";
import useAuthStore from "../store/auth.store";

export default function MainLayout() {
  const mainRef = useRef(null);
  const backgroundRef = useRef(null);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = useAuthStore((state) => state.role);
  const isAdminRoute = location.pathname.startsWith("/admin");
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

  useEffect(() => {
    const backgroundEl = backgroundRef.current;

    const animejs = window.anime;

    if (!backgroundEl || !animejs) {
      return;
    }

    const blobs = backgroundEl.querySelectorAll("[data-blob]");

    animejs({
      targets: blobs,
      translateX: () => animejs.random(-120, 120),
      translateY: () => animejs.random(-120, 120),
      scale: () => animejs.random(80, 120) / 100,
      duration: 9000,
      delay: animejs.stagger(350),
      direction: "alternate",
      easing: "easeInOutSine",
      loop: true,
    });

    animejs({
      targets: backgroundEl,
      opacity: [0.35, 0.7],
      duration: 7000,
      direction: "alternate",
      easing: "easeInOutQuad",
      loop: true,
    });

    return () => {
      animejs.remove(blobs);
      animejs.remove(backgroundEl);
    };
  }, []);

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
              ? "admin-main-surface bg-[radial-gradient(circle_at_top,_#1f1537_0%,_#111111_45%,_#0a0a0a_100%)]"
              : "bg-[#121212]"
          }`}
        >
          <div
            ref={backgroundRef}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div
              data-blob
              className={`absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl ${
                isAdminRoute ? "bg-violet-500/25" : "bg-indigo-500/20"
              }`}
            />
            <div
              data-blob
              className={`absolute top-24 right-0 h-80 w-80 rounded-full blur-3xl ${
                isAdminRoute ? "bg-sky-500/20" : "bg-fuchsia-500/20"
              }`}
            />
            <div
              data-blob
              className={`absolute bottom-12 left-1/3 h-64 w-64 rounded-full blur-3xl ${
                isAdminRoute ? "bg-purple-400/20" : "bg-cyan-400/15"
              }`}
            />
          </div>
          <div className={`relative z-10 ${isAdminRoute ? "admin-content" : ""}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {shouldShowPlayer && <PlayerBar />}
      <Toast
        title="Thông báo"
        message={authToastMessage}
        onClose={() => setAuthToastMessage("")}
      />
    </div>
  );
}
