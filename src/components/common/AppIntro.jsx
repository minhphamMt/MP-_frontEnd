import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/auth.store";

const MotionDiv = motion.div;
const MotionSpan = motion.span;

function IntroPulse({ barClassName }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <MotionSpan
          key={index}
          className={clsx("block h-8 w-1.5 rounded-full", barClassName)}
          animate={{
            scaleY: [0.58, 1, 0.7, 0.92],
            opacity: [0.4, 1, 0.55, 0.9],
          }}
          transition={{
            duration: 1.05,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 0.09,
          }}
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
      description:
        "Đang đồng bộ phiên làm việc và chuẩn bị đúng không gian phù hợp cho bạn.",
      helper: "Vui lòng đợi trong giây lát...",
    };
  }

  if (!isAuthenticated) {
    return {
      badge: "Guest Session",
      title: "Chào mừng đến với Khoaluan Music",
      description:
        "Đang mở không gian khám phá, bảng xếp hạng, album và những giai điệu mới để bạn bắt đầu thật nhẹ nhàng.",
      helper: "Khám phá nhạc mới, tìm kiếm và đăng nhập bất cứ lúc nào.",
    };
  }

  if (role === "ADMIN") {
    return {
      badge: "Admin Console",
      title: "Khu vực quản trị đã sẵn sàng",
      description:
        "Đang mở dashboard, kiểm duyệt nội dung và các công cụ quản lý hệ thống cho phiên làm việc của bạn.",
      helper: "Theo dõi dữ liệu, xử lý yêu cầu và quản trị nền tảng.",
    };
  }

  if (role === "ARTIST") {
    return {
      badge: "Artist Workspace",
      title: "Studio của bạn đang mở ra",
      description:
        "Đang chuẩn bị workspace nghệ sĩ, danh sách bài hát, album và các chỉ số để bạn tiếp tục sáng tạo.",
      helper: "Quản lý phát hành, cập nhật hồ sơ và theo dõi hiệu suất âm nhạc.",
    };
  }

  return {
    badge: "Listener Mode",
    title: "Chào mừng bạn quay lại",
    description:
      "Đang làm mới thư viện cá nhân, lịch sử nghe gần đây và không gian phát nhạc để bạn tiếp tục đúng nhịp.",
    helper: "Playlist, bài hát yêu thích và hành trình nghe nhạc của bạn đang chờ sẵn.",
  };
}

function getIntroTone({ role, pathname, intent }) {
  const isArtistRoute =
    role === "ARTIST" ||
    pathname === "/artist-auth" ||
    pathname === "/artist-request" ||
    pathname.startsWith("/artist/") ||
    (pathname === "/verify-email" && intent === "artist");

  if (isArtistRoute) {
    return {
      shellClassName: "auth-shell-artist",
      badgeClassName: "border-sky-300/18 bg-sky-400/10 text-sky-100/85",
      panelClassName:
        "border-sky-300/[0.08] bg-[#0b1016]/96 shadow-[0_28px_90px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(191,219,254,0.03)]",
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
      "border-emerald-300/[0.07] bg-[#0b1016]/96 shadow-[0_28px_90px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(167,243,208,0.03)]",
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
        pathname: location.pathname,
        intent,
      }),
    [intent, location.pathname, role]
  );

  return (
    <MotionDiv
      className={clsx("auth-intro-shell fixed inset-0 z-[120] overflow-hidden text-white", introTone.shellClassName)}
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
      <div className="absolute inset-0 auth-shell-top-grid" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-[360px] w-[min(84vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full auth-shell-focus-glow md:h-[420px]" />
      <div className="absolute inset-x-[-10%] bottom-[-34%] h-[54%] auth-shell-floor-grid" />
      <div className="absolute inset-x-[-10%] bottom-[-34%] h-[54%] auth-shell-floor-grid auth-shell-floor-grid--fine" />
      <div className="absolute inset-0 auth-shell-vignette" />
      <div className="absolute inset-0 opacity-[0.08] auth-shell-noise-map" />
      <img
        src="/logo-brand.png"
        alt=""
        className="pointer-events-none absolute bottom-4 right-4 h-28 w-28 select-none opacity-[0.035] grayscale sm:h-32 sm:w-32 lg:h-40 lg:w-40"
        draggable="false"
      />

      <div className="pointer-events-none absolute inset-0 z-10 px-5 sm:px-8">
        <div className="mx-auto flex h-full w-full max-w-[1180px] items-center justify-center">
          <MotionDiv
            className={clsx(
              "pointer-events-auto w-full max-w-[560px] rounded-[32px] border px-6 py-8 text-center backdrop-blur-xl sm:px-8 sm:py-10",
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

          <div className="mt-6 flex justify-center">
            <div className="relative h-[108px] w-[108px] rounded-[30px] border border-white/10 bg-[#050706] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
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
            className="mt-6 text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.08, duration: 0.38 }}
          >
            {introCopy.title}
          </MotionDiv>
          <MotionDiv
            className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/62 sm:text-[15px]"
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
}
