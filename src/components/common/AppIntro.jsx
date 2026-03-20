import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import useAuthStore from "../../store/auth.store";

function IntroPulse() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <motion.span
          key={index}
          className="block h-8 w-1.5 rounded-full bg-gradient-to-t from-emerald-500/35 via-emerald-300/90 to-cyan-300/90"
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

export default function AppIntro() {
  const reduceMotion = useReducedMotion();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const role = useAuthStore((state) => state.role);

  const introCopy = useMemo(
    () => getIntroCopy({ isAuthReady, isAuthenticated, role }),
    [isAuthReady, isAuthenticated, role]
  );

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-hidden bg-[#030504]"
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(45,212,191,0.14),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(29,185,84,0.12),transparent_34%)]" />
      <motion.div
        className="absolute inset-0 opacity-60"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.04, 1], opacity: [0.42, 0.66, 0.42] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      >
        <div className="absolute left-[-8%] top-[16%] h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-[10%] right-[-6%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl sm:h-80 sm:w-80" />
      </motion.div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          className="w-full max-w-[560px] rounded-[32px] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-6 py-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:px-8 sm:py-10"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985 }}
          transition={{ duration: reduceMotion ? 0.18 : 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto inline-flex rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-200/85">
            {introCopy.badge}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="relative h-[108px] w-[108px] rounded-[30px] border border-white/10 bg-[#050706] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(110,231,183,0.12),transparent_50%)]" />
              <img
                src="/logo-brand.png"
                alt="Khoaluan Music"
                className="relative h-full w-full rounded-[22px] object-cover"
                draggable="false"
              />
            </div>
          </div>

          <motion.h1
            className="mt-6 text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.08, duration: 0.38 }}
          >
            {introCopy.title}
          </motion.h1>
          <motion.p
            className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/62 sm:text-[15px]"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { delay: 0.16, duration: 0.38 }}
          >
            {introCopy.description}
          </motion.p>

          {reduceMotion ? null : <IntroPulse />}

          <motion.p
            className="mt-5 text-xs font-medium tracking-[0.06em] text-white/42 sm:text-[13px]"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={reduceMotion ? undefined : { delay: 0.22, duration: 0.35 }}
          >
            {introCopy.helper}
          </motion.p>

          <div className="mx-auto mt-6 h-[4px] w-full max-w-[260px] overflow-hidden rounded-full bg-white/8">
            <motion.span
              className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 shadow-[0_0_22px_rgba(52,211,153,0.45)]"
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
        </motion.div>
      </div>
    </motion.div>
  );
}
