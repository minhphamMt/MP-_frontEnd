import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/auth.store";
import { syncBootIntroTheme } from "./utils/bootIntro";

const INTRO_DURATION_MS = 2200;
const INTRO_DURATION_REDUCED_MS = 1600;

export default function App() {
  const location = useLocation();
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const role = useAuthStore((state) => state.role);
  const authContext = useAuthStore((state) => state.authContext);
  const [introMinElapsed, setIntroMinElapsed] = useState(false);
  const hideIntroFrameRef = useRef(0);
  const hideIntroCommitRef = useRef(0);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timer = window.setTimeout(
      () => setIntroMinElapsed(true),
      prefersReducedMotion ? INTRO_DURATION_REDUCED_MS : INTRO_DURATION_MS
    );

    return () => window.clearTimeout(timer);
  }, []);

  const bootIntroVisible = !introMinElapsed || !isAuthReady;

  useLayoutEffect(() => {
    syncBootIntroTheme({
      pathname: location.pathname,
      search: location.search,
      role,
      authContext,
    });
  }, [authContext, location.pathname, location.search, role]);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (typeof window === "undefined") return undefined;

    const bootIntro = document.getElementById("app-boot-intro");
    if (!bootIntro) return undefined;

    window.cancelAnimationFrame(hideIntroFrameRef.current);
    window.cancelAnimationFrame(hideIntroCommitRef.current);

    if (bootIntroVisible) {
      bootIntro.classList.remove("is-hidden");
    } else {
      hideIntroFrameRef.current = window.requestAnimationFrame(() => {
        hideIntroCommitRef.current = window.requestAnimationFrame(() => {
          bootIntro.classList.add("is-hidden");
        });
      });
    }

    return () => {
      window.cancelAnimationFrame(hideIntroFrameRef.current);
      window.cancelAnimationFrame(hideIntroCommitRef.current);
    };
  }, [bootIntroVisible]);

  return <AppRoutes />;
}
