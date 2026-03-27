import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation, useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { shouldUseArtistTheme } from "../../utils/routeContext";

const MotionDiv = motion.div;
const MotionSpan = motion.span;

function IntroPulse({ barClassName }) {
  return (
    <div className="boot-intro__pulse mt-6 flex items-center justify-center gap-2" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={clsx("boot-intro__pulse-bar block h-8 w-1.5 rounded-full", barClassName)}
          style={{ animationDelay: `${index * 0.09}s` }}
        />
      ))}
    </div>
  );
}

function getIntroCopy({ isAuthReady, isAuthenticated, role }) {
  if (!isAuthReady) {
    return {
      badge: "Sync Session",
      title: "Khoaluan Music",
      description: "Đang đồng bộ phiên làm việc cho bạn.",
      helper: "Vui lòng chờ trong giây lát...",
    };
  }

  if (!isAuthenticated) {
    return {
      badge: "Guest Session",
      title: "Chào mừng đến với Khoaluan Music",
      description: "Đang mở không gian nghe nhạc và khám phá cho bạn.",
      helper: "Mọi thứ sẽ sẵn sàng ngay.",
    };
  }

  if (role === "ADMIN") {
    return {
      badge: "Admin Console",
      title: "Khu vực quản trị đã sẵn sàng",
      description: "Đang mở dashboard và công cụ quản trị hệ thống.",
      helper: "Chuẩn bị dữ liệu cho phiên làm việc của bạn.",
    };
  }

  if (role === "ARTIST") {
    return {
      badge: "Artist Workspace",
      title: "Studio của bạn đang mở ra",
      description: "Đang chuẩn bị workspace nghệ sĩ cho bạn.",
      helper: "Bài hát, album và hồ sơ sẽ sẵn sàng ngay.",
    };
  }

  return {
    badge: "Listener Mode",
    title: "Chào mừng bạn quay lại",
    description: "Đang làm mới thư viện và không gian phát nhạc của bạn.",
    helper: "Playlist và lịch sử nghe sẽ hiện ngay sau đó.",
  };
}

function getIntroTone({ role, authContext, pathname, intent }) {
  const isArtistRoute = shouldUseArtistTheme({
    pathname,
    search: intent ? `intent=${intent}` : "",
    role,
    authContext,
  });

  if (isArtistRoute) {
      return {
        shellClassName: "auth-shell-artist",
        badgeClassName: "border-sky-300/18 bg-sky-400/10 text-sky-100/85",
        panelClassName:
          "border-sky-300/[0.06] bg-[#0a121d]/96 shadow-[0_28px_90px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(191,219,254,0.025)]",
        pulseBarClassName: "bg-gradient-to-t from-sky-500/35 via-sky-300/90 to-cyan-200/90",
        logoAuraClassName: "bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.16),transparent_50%)]",
        progressClassName:
        "bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 shadow-[0_0_22px_rgba(96,165,250,0.42)]",
    };
  }

  return {
    shellClassName: "auth-shell-listener",
    badgeClassName: "border-emerald-300/18 bg-emerald-400/10 text-emerald-100/85",
    panelClassName:
      "border-emerald-300/[0.06] bg-[#0a1512]/96 shadow-[0_28px_90px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(167,243,208,0.025)]",
    pulseBarClassName: "bg-gradient-to-t from-emerald-500/28 via-emerald-300/82 to-lime-200/88",
    logoAuraClassName: "bg-[radial-gradient(circle_at_top,rgba(118,204,152,0.14),transparent_50%)]",
    progressClassName:
      "bg-gradient-to-r from-emerald-300 via-emerald-400 to-lime-300 shadow-[0_0_22px_rgba(88,168,121,0.34)]",
  };
}

export default function AppIntro() {
  const reduceMotion = useReducedMotion();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const role = useAuthStore((state) => state.role);
  const authContext = useAuthStore((state) => state.authContext);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent") || "user";

  const introCopy = useMemo(
    () => getIntroCopy({ isAuthReady, isAuthenticated, role }),
    [isAuthReady, isAuthenticated, role]
  );
  const introTone = useMemo(
    () =>
      getIntroTone({
        role,
        authContext,
        pathname: location.pathname,
        intent,
      }),
    [authContext, intent, location.pathname, role]
  );

  const introMarkup = (
    <MotionDiv
      className={clsx("auth-intro-shell fixed inset-0 z-[2400] overflow-hidden text-white", introTone.shellClassName)}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: reduceMotion ? 0.16 : 0.46,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
    >
      <div className="absolute inset-0 auth-shell-backdrop" />
      <div className="pointer-events-none absolute inset-0 auth-shell-wave auth-shell-wave--left" />
      <div className="pointer-events-none absolute inset-0 auth-shell-wave auth-shell-wave--right" />
      <div className="absolute inset-0 auth-shell-top-grid" />
      <div className="pointer-events-none absolute left-1/2 top-[40%] h-[380px] w-[min(84vw,780px)] -translate-x-1/2 -translate-y-1/2 rounded-full auth-shell-focus-glow md:h-[440px]" />
      <div className="absolute inset-x-[-12%] bottom-[-22%] h-[62%] auth-shell-floor-grid" />
      <div className="absolute inset-x-[-12%] bottom-[-22%] h-[62%] auth-shell-floor-grid auth-shell-floor-grid--fine" />
      <div className="absolute inset-0 auth-shell-vignette" />
      <div className="absolute inset-0 opacity-[0.08] auth-shell-noise-map" />
      <img
        src="/logo-brand.png"
        alt=""
        className="pointer-events-none absolute bottom-4 right-4 h-28 w-28 select-none opacity-[0.035] grayscale sm:h-32 sm:w-32 lg:h-40 lg:w-40"
        draggable="false"
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5 sm:px-8">
        <div className="mx-auto flex h-full w-full max-w-[1180px] items-center justify-center">
          <MotionDiv
            className={clsx(
              "pointer-events-auto auth-main-card w-full max-w-[430px] rounded-[32px] px-6 py-7 text-center sm:px-7 sm:py-8",
              introTone.panelClassName
            )}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0.18 : 0.52, ease: [0.22, 1, 0.36, 1] }}
          >
          <div
            className={clsx(
              "mx-auto inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em]",
              introTone.badgeClassName
            )}
          >
            {introCopy.badge}
          </div>

          <div className="mt-5 flex justify-center">
            <div className="auth-brand-frame relative h-[108px] w-[108px] rounded-[30px] p-3">
              <div className={clsx("absolute inset-0 rounded-[30px]", introTone.logoAuraClassName)} />
              <img
                src="/logo-brand.png"
                alt="Khoaluan Music"
                className="relative h-full w-full rounded-[22px] object-cover"
                draggable="false"
              />
            </div>
          </div>

          <MotionDiv
            className="mt-5 text-[2rem] font-black tracking-[-0.06em] text-white sm:text-[2.35rem]"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.08, duration: 0.38 }}
          >
            {introCopy.title}
          </MotionDiv>
          <MotionDiv
            className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-white/62 sm:text-[14px]"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.16, duration: 0.38 }}
          >
            {introCopy.description}
          </MotionDiv>

          {reduceMotion ? null : <IntroPulse barClassName={introTone.pulseBarClassName} />}

          <MotionDiv
            className="mt-5 text-xs font-medium tracking-[0.06em] text-white/42 sm:text-[13px]"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={reduceMotion ? undefined : { delay: 0.22, duration: 0.35 }}
          >
            {introCopy.helper}
          </MotionDiv>

          <div className="mx-auto mt-6 h-[4px] w-full max-w-[260px] overflow-hidden rounded-full bg-white/8">
            <MotionSpan
              className={clsx("block h-full w-full origin-left rounded-full", introTone.progressClassName)}
              initial={{ scaleX: 0.12, x: "-18%" }}
              animate={
                reduceMotion
                  ? { scaleX: 0.9, x: 0 }
                  : { scaleX: [0.16, 0.88, 0.98], x: ["-18%", "0%", "0%"] }
              }
              transition={
                reduceMotion
                  ? { duration: 0.42 }
                  : { duration: 1.45, ease: [0.22, 1, 0.36, 1] }
              }
            />
          </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  );

  if (typeof document === "undefined") {
    return introMarkup;
  }

  return createPortal(introMarkup, document.body);
}
