import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/auth.store";

const INTRO_DURATION_MS = 2200;
const INTRO_DURATION_REDUCED_MS = 1600;

export default function App() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const [introMinElapsed, setIntroMinElapsed] = useState(false);

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

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const bootIntro = document.getElementById("app-boot-intro");
    if (!bootIntro) return undefined;

    if (bootIntroVisible) {
      bootIntro.classList.remove("is-hidden");
    } else {
      bootIntro.classList.add("is-hidden");
    }

    return undefined;
  }, [bootIntroVisible]);

  return <AppRoutes />;
}
