import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import AppIntro from "./components/common/AppIntro";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/auth.store";

const INTRO_DURATION_MS = 1650;
const INTRO_DURATION_REDUCED_MS = 520;

export default function App() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const [introElapsed, setIntroElapsed] = useState(false);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timer = window.setTimeout(
      () => setIntroElapsed(true),
      prefersReducedMotion ? INTRO_DURATION_REDUCED_MS : INTRO_DURATION_MS
    );

    return () => window.clearTimeout(timer);
  }, []);

  const showIntro = !introElapsed || !isAuthReady;

  return (
    <>
      <AppRoutes />
      <AnimatePresence>{showIntro ? <AppIntro /> : null}</AnimatePresence>
    </>
  );
}
