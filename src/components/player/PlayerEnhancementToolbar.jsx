import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiClock, FiSliders } from "react-icons/fi";
import ShareLinkButton from "../common/ShareLinkButton";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";

const TIMER_OPTIONS = [
  { value: 0, label: "Tắt hẹn giờ" },
  { value: 15, label: "15 phút" },
  { value: 30, label: "30 phút" },
  { value: 60, label: "60 phút" },
];

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

const formatRemaining = (endsAt) => {
  if (!endsAt) return "Hẹn giờ";
  const diffMs = endsAt - Date.now();
  if (diffMs <= 0) return "Hẹn giờ";
  const totalMinutes = Math.max(1, Math.ceil(diffMs / 60000));
  if (totalMinutes < 60) return `${totalMinutes}p`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}g ${minutes}p` : `${hours}g`;
};

function ToolbarMenu({
  open,
  children,
  align = "right",
  placement = "bottom",
  floating = false,
  anchorRef,
  menuRef,
}) {
  const [floatingStyle, setFloatingStyle] = useState(null);

  useLayoutEffect(() => {
    if (!open || !floating || typeof window === "undefined") {
      setFloatingStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const viewportPadding = 16;
      const gap = 12;
      const estimatedHeight = 232;
      const menuWidth = Math.min(
        220,
        Math.max(190, window.innerWidth - viewportPadding * 2)
      );

      let left = rect.right - menuWidth;
      if (align === "left") left = rect.left;
      if (align === "center") {
        left = rect.left + rect.width / 2 - menuWidth / 2;
      }

      left = Math.min(
        window.innerWidth - viewportPadding - menuWidth,
        Math.max(viewportPadding, left)
      );

      const canPlaceAbove = rect.top >= estimatedHeight + gap + viewportPadding;
      const canPlaceBelow =
        window.innerHeight - rect.bottom >= estimatedHeight + gap + viewportPadding;

      let useTopPlacement = placement === "top";
      if (useTopPlacement && !canPlaceAbove && canPlaceBelow) {
        useTopPlacement = false;
      } else if (!useTopPlacement && !canPlaceBelow && canPlaceAbove) {
        useTopPlacement = true;
      }

      setFloatingStyle({
        left: `${left}px`,
        top: useTopPlacement ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
        transform: useTopPlacement ? "translateY(-100%)" : "none",
        width: `${menuWidth}px`,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, anchorRef, floating, open, placement]);

  if (!open) return null;

  const placementClass =
    placement === "top"
      ? "bottom-[calc(100%+0.75rem)] origin-bottom"
      : "top-[calc(100%+0.75rem)] origin-top";
  const alignClass =
    align === "left"
      ? "left-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-0";
  const menu = (
    <div
      ref={menuRef}
      className={`${
        floating
          ? "fixed z-[1200] max-w-[220px]"
          : `absolute z-[90] min-w-[190px] ${placementClass} ${alignClass}`
      } overflow-hidden rounded-[22px] border border-[#25292b] bg-[#111315] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.4)]`}
      style={floating ? floatingStyle || undefined : undefined}
    >
      <div className="relative">{children}</div>
    </div>
  );

  if (floating && typeof document !== "undefined") {
    return createPortal(menu, document.body);
  }

  return menu;
}

export default function PlayerEnhancementToolbar({
  compact = false,
  className = "",
  align = "right",
  menuPlacement,
  wrap = true,
  compactLabelClass = "",
  showShare = true,
}) {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const sleepTimerEndsAt = usePlayerStore((state) => state.sleepTimerEndsAt);
  const sleepTimerMinutes = usePlayerStore((state) => state.sleepTimerMinutes);
  const setPlaybackRate = usePlayerStore((state) => state.setPlaybackRate);
  const setSleepTimer = usePlayerStore((state) => state.setSleepTimer);
  const [activeMenu, setActiveMenu] = useState(null);
  const [tick, setTick] = useState(Date.now());
  const containerRef = useRef(null);
  const speedAnchorRef = useRef(null);
  const speedMenuRef = useRef(null);
  const timerAnchorRef = useRef(null);
  const timerMenuRef = useRef(null);

  useEffect(() => {
    if (!activeMenu) return undefined;

    const handleClickOutside = (event) => {
      const target = event.target;
      if (containerRef.current?.contains(target)) return;
      if (speedMenuRef.current?.contains(target)) return;
      if (timerMenuRef.current?.contains(target)) return;
      setActiveMenu(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [activeMenu]);

  useEffect(() => {
    if (!sleepTimerEndsAt) return undefined;
    const timer = setInterval(() => setTick(Date.now()), 15000);
    return () => clearInterval(timer);
  }, [sleepTimerEndsAt]);

  const timerLabel = useMemo(
    () => formatRemaining(sleepTimerEndsAt),
    [sleepTimerEndsAt, tick]
  );
  const currentSongId = normalizeSongId(currentSong);
  const currentArtistLabel = useMemo(() => {
    if (currentSong?.artist_name) return currentSong.artist_name;
    if (Array.isArray(currentSong?.artists) && currentSong.artists.length) {
      return currentSong.artists
        .map((artist) => artist?.name || artist?.alias || "")
        .filter(Boolean)
        .join(", ");
    }
    return "Nghệ sĩ";
  }, [currentSong]);
  const resolvedPlacement = menuPlacement || (compact ? "top" : "bottom");
  const resolvedCompactLabelClass = compact
    ? compactLabelClass || "max-[390px]:hidden"
    : "";

  const buttonClass = compact
    ? "inline-flex h-10 items-center gap-2 rounded-full border border-[#2a2d30] bg-[#141618] px-3 text-xs font-semibold text-white/78 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition md:hover:bg-[#1a1d1f] md:hover:text-white md:hover:border-[#373b3f] max-[390px]:h-9 max-[390px]:w-9 max-[390px]:justify-center max-[390px]:gap-0 max-[390px]:px-0"
    : "inline-flex h-11 items-center gap-2 rounded-full border border-[#2a2d30] bg-[#141618] px-4 text-sm font-semibold text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition md:hover:bg-[#1a1d1f] md:hover:text-white md:hover:border-[#373b3f]";

  return (
    <div
      ref={containerRef}
      className={[
        wrap ? "flex flex-wrap items-center gap-2" : "flex flex-nowrap items-center gap-2",
        className,
      ].join(" ")}
    >
      <div ref={speedAnchorRef} className="relative">
        <button
          type="button"
          onClick={() => setActiveMenu((prev) => (prev === "speed" ? null : "speed"))}
          className={`${buttonClass} ${activeMenu === "speed" ? "border-[#3d4246] bg-[#1d2022] text-white" : ""}`}
          aria-label="Tốc độ phát"
        >
          <FiSliders className="text-[15px] text-white/60" />
          <span className={resolvedCompactLabelClass}>{playbackRate}x</span>
        </button>
        <ToolbarMenu
          open={activeMenu === "speed"}
          align={compact ? "left" : align}
          placement={resolvedPlacement}
          floating={compact}
          anchorRef={speedAnchorRef}
          menuRef={speedMenuRef}
        >
          <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Tốc độ phát
          </div>
          <div className="space-y-1">
            {SPEED_OPTIONS.map((option) => {
              const isActive = playbackRate === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(option);
                    setActiveMenu(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "border border-[#3a3f43] bg-[#1b1f21] text-white"
                      : "border border-transparent text-white/68 md:hover:border-[#2f3437] md:hover:bg-[#181b1d] md:hover:text-white"
                  }`}
                >
                  <span>{option}x</span>
                  {isActive ? <FiCheck className="text-[13px]" /> : null}
                </button>
              );
            })}
          </div>
        </ToolbarMenu>
      </div>

      <div ref={timerAnchorRef} className="relative">
        <button
          type="button"
          onClick={() => setActiveMenu((prev) => (prev === "timer" ? null : "timer"))}
          className={`${buttonClass} ${
            sleepTimerEndsAt
              ? "border-[#3d4246] bg-[#1d2022] text-white"
              : ""
          }`}
          aria-label="Hẹn giờ dừng phát"
        >
          <FiClock
            className={`text-[15px] ${sleepTimerEndsAt ? "text-white/72" : "text-white/56"}`}
          />
          <span className={resolvedCompactLabelClass}>{timerLabel}</span>
        </button>
        <ToolbarMenu
          open={activeMenu === "timer"}
          align={compact ? "right" : align}
          placement={resolvedPlacement}
          floating={compact}
          anchorRef={timerAnchorRef}
          menuRef={timerMenuRef}
        >
          <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Hẹn giờ dừng
          </div>
          <div className="space-y-1">
            {TIMER_OPTIONS.map((option) => {
              const isActive =
                (option.value === 0 && !sleepTimerEndsAt) ||
                (option.value > 0 && option.value === sleepTimerMinutes);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSleepTimer(option.value);
                    setActiveMenu(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "border border-[#3a3f43] bg-[#1b1f21] text-white"
                      : "border border-transparent text-white/68 md:hover:border-[#2f3437] md:hover:bg-[#181b1d] md:hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {isActive ? <FiCheck className="text-[13px]" /> : null}
                </button>
              );
            })}
          </div>
        </ToolbarMenu>
      </div>

      {showShare && currentSongId ? (
        <ShareLinkButton
          path={`/song/${currentSongId}`}
          title={compact ? "Chia sẻ" : "Chia sẻ bài hát"}
          shareTitle={currentSong?.title || "Bài hát"}
          shareText={`Nghe ${currentSong?.title || "bài hát này"} của ${currentArtistLabel} trên Khoaluan Music.`}
          preview={{
            eyebrow: "Đang phát",
            title: currentSong?.title || "Bài hát",
            subtitle: currentArtistLabel,
            description: compact ? "" : "Mở nhanh trang bài hát đang phát để nghe và chia sẻ.",
            image:
              currentSong?.cover_url ||
              currentSong?.thumbnail_m ||
              currentSong?.thumbnail ||
              currentSong?.image_url ||
              "",
          }}
          compact={compact}
          variant="toolbar"
        />
      ) : null}
    </div>
  );
}
