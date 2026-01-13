import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "../components/header/Header";
import PlayerBar from "../components/player/PlayerBar";
import Sidebar from "../components/sidebar/Sidebar";

export default function MainLayout() {
  const mainRef = useRef(null);
  const backgroundRef = useRef(null);
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
          className="scrollbar-muted relative flex-1 overflow-y-auto bg-[#121212] px-4 py-4 sm:px-6 sm:py-6"
        >
           <div
            ref={backgroundRef}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div
              data-blob
              className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
            />
            <div
              data-blob
              className="absolute top-24 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"
            />
            <div
              data-blob
              className="absolute bottom-12 left-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"
            />
          </div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}