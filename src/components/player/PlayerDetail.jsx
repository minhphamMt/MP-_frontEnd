import { useEffect, useRef, useState } from "react";
import {
  FaBackwardStep,
  FaForwardStep,
  FaPause,
  FaPlay,
  FaRepeat,
  FaShuffle,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";
import { FiChevronDown, FiHeart, FiMaximize, FiMinimize } from "react-icons/fi";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import PlayerDetailLyrics from "./PlayerDetailLyrics";
import PlayerDetailQueue from "./PlayerDetailQueue";
import OptimizedImage from "../common/OptimizedImage";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";
import ArtistNames from "../artist/ArtistNames";

const formatTime = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

const ANIM_MS = 450;
const ANIM_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function PlayerDetail({ isOpen, onClose }) {
  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    pause,
    resume,
    playNext,
    playPrev,
    playAt,
    shuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    currentTime,
    duration,
    seek,
    volume,
    muted,
    setVolume,
    toggleMute,
    likedSongIds,
    toggleLike,
    appendRecommendationsToQueue,
    recommendationLoading,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState("queue");
  const [mobileTab, setMobileTab] = useState("now");
  const [isCarouselSwipeLocked, setIsCarouselSwipeLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("closed");
  const [backdropReady, setBackdropReady] = useState(false);
  const [songSlideClass, setSongSlideClass] = useState("");
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [fallbackDuration, setFallbackDuration] = useState(0);
  const [mobileDragOffset, setMobileDragOffset] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const phaseRef = useRef("closed");
  const audioRef = useRef(null);
  const carouselRef = useRef(null);
  const scrollRafRef = useRef(null);
  const unlockSwipeTimerRef = useRef(null);
  const prevIndexRef = useRef(currentIndex);
  const lastRecommendationSeedRef = useRef(null);
  const fullscreenByPlayerRef = useRef(false);
  const mobileGestureRef = useRef({
    startX: 0,
    startY: 0,
    tracking: false,
    shouldDrag: false,
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const handleFullscreenChange = () => {
      const nextFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nextFullscreen);
      if (!nextFullscreen) fullscreenByPlayerRef.current = false;
    };

    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setPhase("enter");
      setBackdropReady(false);
      setMobileDragOffset(0);
      const t = setTimeout(() => setBackdropReady(true), 80);
      return () => clearTimeout(t);
    }

    setBackdropReady(false);
    setMobileDragOffset(0);
    setPhase((prev) => (prev === "closed" ? "closed" : "exit"));
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return undefined;
    if (typeof document === "undefined") return undefined;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    if (isOpen) {
      const scrollbarW =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [mounted, isOpen]);

  useEffect(() => {
    if (!mounted || !isOpen) return undefined;
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return undefined;

    const el = carouselRef.current;
    if (!el) return undefined;

    const width = el.clientWidth || 1;
    el.scrollTo({ left: width, behavior: "auto" });
    setMobileTab("now");
    return undefined;
  }, [mounted, isOpen]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (unlockSwipeTimerRef.current) {
        clearTimeout(unlockSwipeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const seedId = normalizeSongId(currentSong);
    if (!seedId) return undefined;
    if (repeatMode !== "off") return undefined;
    if (recommendationLoading) return undefined;
    if (queue.length > currentIndex + 1) return undefined;
    if (lastRecommendationSeedRef.current === seedId) return undefined;

    lastRecommendationSeedRef.current = seedId;
    let active = true;

    appendRecommendationsToQueue().then((appended) => {
      if (!appended && active) {
        lastRecommendationSeedRef.current = null;
      }
    });

    return () => {
      active = false;
    };
  }, [
    appendRecommendationsToQueue,
    currentIndex,
    currentSong,
    queue.length,
    recommendationLoading,
    repeatMode,
  ]);

  const handleAnimEnd = () => {
    const currentPhase = phaseRef.current;
    if (currentPhase === "enter") setPhase("open");
    if (currentPhase === "exit") {
      setMounted(false);
      setPhase("closed");
    }
  };

  useEffect(() => {
    if (prevIndexRef.current === currentIndex) return;

    setSongSlideClass(
      currentIndex > prevIndexRef.current ? "song-slide-next" : "song-slide-prev"
    );
    prevIndexRef.current = currentIndex;

    const t = setTimeout(() => setSongSlideClass(""), 380);
    return () => clearTimeout(t);
  }, [currentIndex]);

  useEffect(() => {
    if (!mounted) return undefined;

    const audioEl = document.querySelector("audio");
    audioRef.current = audioEl;

    const syncDuration = () => {
      setFallbackDuration(audioEl?.duration || 0);
    };

    syncDuration();
    audioEl?.addEventListener("loadedmetadata", syncDuration);

    return () => {
      audioEl?.removeEventListener("loadedmetadata", syncDuration);
    };
  }, [mounted, currentSong]);

  const total = Number(duration || fallbackDuration || 0) || 0;
  const displayedTime = isSeeking ? seekValue : Number(currentTime || 0);

  useEffect(() => {
    if (!isSeeking) setSeekValue(displayedTime);
  }, [displayedTime, isSeeking]);

  const doSeek = (nextTime) => {
    const time = Math.max(0, Math.min(total, Number(nextTime) || 0));
    seek?.(time);
  };

  const onSeekStart = () => setIsSeeking(true);
  const onSeekChange = (e) => setSeekValue(Number(e.target.value));
  const onSeekCommit = () => {
    setIsSeeking(false);
    doSeek(seekValue);
  };

  const lockCarouselSwipe = () => {
    if (unlockSwipeTimerRef.current) {
      clearTimeout(unlockSwipeTimerRef.current);
      unlockSwipeTimerRef.current = null;
    }
    setIsCarouselSwipeLocked(true);
  };

  const unlockCarouselSwipe = () => {
    if (unlockSwipeTimerRef.current) {
      clearTimeout(unlockSwipeTimerRef.current);
    }
    unlockSwipeTimerRef.current = setTimeout(() => {
      setIsCarouselSwipeLocked(false);
      unlockSwipeTimerRef.current = null;
    }, 80);
  };

  const focusRangeInteraction = (e) => {
    e.stopPropagation();
  };

  const handleSliderInteractionStart = (e) => {
    focusRangeInteraction(e);
    lockCarouselSwipe();
  };

  const handleSliderInteractionMove = (e) => {
    focusRangeInteraction(e);
    lockCarouselSwipe();
  };

  const handleSliderInteractionEnd = (e) => {
    focusRangeInteraction(e);
    unlockCarouselSwipe();
  };

  const exitPlayerFullscreen = async () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement || !fullscreenByPlayerRef.current) return;

    try {
      await document.exitFullscreen?.();
    } catch (error) {
      console.error("Exit fullscreen failed", error);
    } finally {
      fullscreenByPlayerRef.current = false;
    }
  };

  const handleClose = async () => {
    await exitPlayerFullscreen();
    onClose?.();
  };

  const toggleFullscreen = async () => {
    if (typeof document === "undefined") return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        fullscreenByPlayerRef.current = false;
        return;
      }

      await document.documentElement.requestFullscreen?.();
      fullscreenByPlayerRef.current = true;
    } catch (error) {
      console.error("Toggle fullscreen failed", error);
    }
  };

  const togglePlay = () => {
    isPlaying ? pause() : resume();
  };

  const handleVolumeChange = (value) => {
    const next = Number(value);
    if (muted && next > 0) toggleMute();
    setVolume(next);
  };

  const resetMobileGesture = () => {
    mobileGestureRef.current = {
      startX: 0,
      startY: 0,
      tracking: false,
      shouldDrag: false,
    };
    setMobileDragOffset(0);
  };

  const handleMobileTouchStart = (e) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) return;
    const touch = e.touches?.[0];
    if (!touch) return;

    const target = e.target;
    const isInteractive = target?.closest?.(
      "button, input, textarea, select, a, [role='button']"
    );
    const scrollRoot = target?.closest?.("[data-mobile-sheet-scroll='true']");
    const isScrollableAwayFromTop =
      scrollRoot && Number(scrollRoot.scrollTop) > 0;

    mobileGestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      tracking: true,
      shouldDrag:
        !isInteractive && !isScrollableAwayFromTop && !isCarouselSwipeLocked,
    };
  };

  const handleMobileTouchMove = (e) => {
    const touch = e.touches?.[0];
    const gesture = mobileGestureRef.current;
    if (!touch || !gesture.tracking || !gesture.shouldDrag) return;

    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;

    if (deltaY <= 0) {
      setMobileDragOffset(0);
      return;
    }

    if (Math.abs(deltaY) <= Math.abs(deltaX) * 1.15) {
      setMobileDragOffset(0);
      return;
    }

    setMobileDragOffset(Math.min(deltaY * 0.58, 120));
  };

  const handleMobileTouchEnd = (e) => {
    const touch = e.changedTouches?.[0];
    const gesture = mobileGestureRef.current;
    if (!touch || !gesture.tracking) {
      resetMobileGesture();
      return;
    }

    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const shouldClose =
      gesture.shouldDrag &&
      deltaY > 110 &&
      Math.abs(deltaY) > Math.abs(deltaX) * 1.2;

    resetMobileGesture();
    if (shouldClose) handleClose();
  };

  if (!mounted || !currentSong) return null;

  const cover = resolveAssetUrl(
    currentSong.cover || currentSong.cover_url || currentSong.image
  );
  const currentSongId = normalizeSongId(currentSong);
  const normalizedIndex = Number.isFinite(currentIndex) ? currentIndex : 0;
  const queueCount = Array.isArray(queue) ? queue.length : 0;
  const safeQueueSize = Math.max(queueCount, normalizedIndex + 1, 1);
  const queuePosition = Math.min(
    safeQueueSize,
    Math.max(normalizedIndex + 1, 1)
  );
  const modeLabel = shuffle
    ? "Trộn"
    : repeatMode === "one"
    ? "Lặp 1"
    : repeatMode === "all"
    ? "Lặp hàng đợi"
    : "Bình thường";
  const metaCards = [
    { label: "Vị trí", value: `${queuePosition}/${safeQueueSize}` },
    { label: "Thời lượng", value: total > 0 ? formatTime(total) : "--:--" },
    { label: "Chế độ", value: modeLabel },
  ];
  const tabs = [
    { id: "queue", label: "Danh sách phát" },
    { id: "lyrics", label: "Lời bài hát" },
  ];
  const mobileTabs = [
    { id: "queue", label: "Danh sách phát" },
    { id: "now", label: "Đang phát" },
    { id: "lyrics", label: "Lời bài hát" },
  ];
  const activeTabTitle =
    activeTab === "queue" ? "Danh sách phát" : "Lời bài hát";
  const activeTabDescription =
    activeTab === "queue"
      ? queueCount
        ? `${queueCount} bài trong hàng đợi`
        : "Hàng đợi hiện chưa có bài hát nào"
      : "Lời bài hát chạy theo thời gian phát";
  const animateClass =
    phase === "enter"
      ? "player-detail-anim-in"
      : phase === "exit"
      ? "player-detail-anim-out"
      : "";
  const stableClass = phase === "exit" ? "opacity-0" : "opacity-100";
  const glassPanelClass = "player-detail-glass";
  const softButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/82 transition active:scale-95 md:hover:bg-white/[0.12] md:hover:text-white";
  const mobileUtilityButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/82 transition active:scale-95";
  const closeButtonClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(82,119,170,0.42),rgba(22,38,62,0.94))] text-white/86 shadow-[0_16px_34px_rgba(6,14,28,0.4)] transition active:scale-95 md:hover:-translate-y-0.5 md:hover:brightness-110 md:hover:text-white";
  const fullscreenButtonClass = `inline-flex h-11 w-11 items-center justify-center rounded-full text-white/84 shadow-[0_16px_34px_rgba(6,14,28,0.34)] transition active:scale-95 md:hover:-translate-y-0.5 md:hover:text-white ${
    isFullscreen
      ? "bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.34),rgba(14,77,112,0.94))]"
      : "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),rgba(28,31,39,0.94))] md:hover:brightness-110"
  }`;
  const pillClass =
    "rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/66 sm:text-[11px]";
  const isLiked = likedSongIds.includes(currentSongId);

  const likeButton = (
    <button
      type="button"
      onClick={() => {
        if (currentSongId) toggleLike(currentSongId);
      }}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 ${
        isLiked
          ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.24)]"
          : "bg-white/[0.07] text-white/80 md:hover:bg-white/[0.12]"
      }`}
      aria-label="Yêu thích"
    >
      <FiHeart />
    </button>
  );

  const detailPanel = (
    <div
      className={`${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4 sm:p-5 lg:p-6`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={pillClass}>
            {isPlaying ? "Đang phát" : "Tạm dừng"}
          </span>
          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-white/56">
            {safeQueueSize} bài trong hàng đợi
          </span>
        </div>
        <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-white/56">
          {modeLabel}
        </span>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-6">
        <div
          className={`grid min-h-0 flex-1 content-center gap-5 md:grid-cols-[minmax(190px,260px)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)] xl:grid-cols-[minmax(240px,360px)_minmax(0,1fr)] xl:gap-8 ${songSlideClass}`}
        >
          <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[260px] md:max-w-none">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[34px] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 65% 72%, rgba(242,178,90,0.16), transparent 42%)",
              }}
            />
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-black/28 shadow-[0_26px_80px_rgba(0,0,0,0.42)]">
              {cover ? (
                <OptimizedImage
                  src={cover}
                  alt={currentSong.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2f2f2f,#111)] text-sm uppercase tracking-[0.32em] text-white/50">
                  No cover
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 text-center md:text-left">
            <div className="overflow-visible pb-2">
              <h2 className="overflow-hidden pt-[0.04em] pb-[0.14em] text-[clamp(2.1rem,8vw,5rem)] font-semibold leading-[1.02] tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                {currentSong.title}
              </h2>
            </div>
            <div className="mt-3 overflow-hidden text-sm font-medium text-white/78 sm:text-base lg:text-xl [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              <ArtistNames
                item={currentSong}
                fallback="Unknown"
                linkClassName="transition md:hover:text-white"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
              {metaCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[20px] bg-white/[0.04] px-3 py-3 text-left backdrop-blur-xl"
                >
                  <div className="text-[10px] uppercase tracking-[0.26em] text-white/42">
                    {card.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white sm:text-base">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto rounded-[24px] bg-black/18 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-5">
          <div className="space-y-2">
            <div className="-my-2 px-1 py-2">
              <input
                type="range"
              min={0}
              max={total || 0}
              step={0.1}
              value={Math.min(displayedTime, total || 0)}
              onPointerDownCapture={handleSliderInteractionStart}
              onPointerMoveCapture={handleSliderInteractionMove}
              onPointerUpCapture={handleSliderInteractionEnd}
              onPointerCancelCapture={handleSliderInteractionEnd}
              onTouchStartCapture={handleSliderInteractionStart}
              onTouchMoveCapture={handleSliderInteractionMove}
              onTouchEndCapture={handleSliderInteractionEnd}
              onTouchCancelCapture={handleSliderInteractionEnd}
              onMouseDownCapture={handleSliderInteractionStart}
              onMouseUpCapture={handleSliderInteractionEnd}
              onPointerDown={onSeekStart}
              onPointerUp={onSeekCommit}
              onPointerCancel={onSeekCommit}
                onMouseDown={onSeekStart}
                onTouchStart={onSeekStart}
                onChange={onSeekChange}
                onMouseUp={onSeekCommit}
                onTouchEnd={onSeekCommit}
                className="player-detail-range h-2.5 w-full cursor-pointer"
                style={{
                  "--range-progress": `${
                    total > 0 ? (Math.min(displayedTime, total) / total) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] text-white/64 sm:text-xs">
              <span>{formatTime(displayedTime)}</span>
              <span>{formatTime(total)}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[auto_1fr_minmax(0,220px)] xl:items-center">
            <div className="flex items-center justify-center gap-2 xl:justify-start">
              {likeButton}
              <AddToPlaylistButton
                song={currentSong}
                triggerClassName="h-11 w-11 bg-white/[0.07] text-white/82 md:hover:bg-white/[0.12]"
              />
            </div>

            <div className="flex items-center justify-center gap-2.5 text-lg sm:gap-3 sm:text-xl">
              <button
                onClick={toggleShuffle}
                className={`${softButtonClass} ${
                  shuffle
                    ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]"
                    : ""
                }`}
                aria-label="Trộn"
              >
                <FaShuffle />
              </button>

              <button
                onClick={playPrev}
                className={softButtonClass}
                aria-label="Bài trước"
              >
                <FaBackwardStep />
              </button>

              <button
                onClick={togglePlay}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#9dfabd,#4ad67f_55%,#249956)] text-2xl text-[#062512] shadow-[0_0_42px_rgba(75,220,126,0.52)] transition active:scale-95 sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-label="Phát hoặc tạm dừng"
              >
                {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className={softButtonClass}
                aria-label="Bài tiếp"
              >
                <FaForwardStep />
              </button>

              <button
                onClick={toggleRepeatMode}
                className={`${softButtonClass} ${
                  repeatMode !== "off"
                    ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]"
                    : ""
                }`}
                aria-label="Lặp lại"
              >
                <span className="relative inline-flex">
                  <FaRepeat />
                  {repeatMode === "one" && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black">
                      1
                    </span>
                  )}
                </span>
              </button>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={toggleMute}
                className={softButtonClass}
                aria-label="Tắt hoặc mở tiếng"
              >
                {muted || volume === 0 ? <FaVolumeXmark /> : <FaVolumeHigh />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onPointerDownCapture={handleSliderInteractionStart}
                onPointerMoveCapture={handleSliderInteractionMove}
                onPointerUpCapture={handleSliderInteractionEnd}
                onPointerCancelCapture={handleSliderInteractionEnd}
                onTouchStartCapture={handleSliderInteractionStart}
                onTouchMoveCapture={handleSliderInteractionMove}
                onTouchEndCapture={handleSliderInteractionEnd}
                onTouchCancelCapture={handleSliderInteractionEnd}
                onMouseDownCapture={handleSliderInteractionStart}
                onMouseUpCapture={handleSliderInteractionEnd}
                onInput={(e) => handleVolumeChange(e.target.value)}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="player-detail-range h-2.5 min-w-0 flex-1 cursor-pointer"
                style={{
                  "--range-progress": `${volume * 100}%`,
                }}
              />
              <span className="w-10 text-right text-[11px] text-white/48 sm:text-xs">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const sidePanel = (
    <div
      className={`${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-3 sm:p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/42 sm:text-[11px]">
            Khám phá
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
            {activeTabTitle}
          </h3>
          <p className="mt-1 text-xs text-white/54 sm:text-sm">
            {activeTabDescription}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start">
          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-white/54">
            {activeTab === "queue" ? `${queueCount} bài` : "Sync"}
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={fullscreenButtonClass}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <FiMinimize size={17} /> : <FiMaximize size={17} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className={closeButtonClass}
            aria-label="Close player detail"
          >
            <FiChevronDown size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 rounded-full bg-black/24 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              activeTab === tab.id
                ? "bg-white/[0.09] text-white shadow-[0_8px_18px_rgba(255,255,255,0.06)]"
                : "text-white/70 md:hover:bg-white/[0.06] md:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-black/16 backdrop-blur-xl">
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-4">
          {activeTab === "queue" ? (
            <PlayerDetailQueue
              queue={queue}
              currentIndex={normalizedIndex}
              playAt={playAt}
            />
          ) : (
            <PlayerDetailLyrics
              currentSong={currentSong}
              displayedTime={displayedTime}
              isActive={activeTab === "lyrics"}
              onSeek={doSeek}
            />
          )}
        </div>
      </div>
    </div>
  );

  const mobileQueuePanel = (
    <div
      className={`${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4`}
    >
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-white">Danh sách phát</h3>
        <p className="mt-1 text-sm text-white/52">
          {queueCount ? `${queueCount} bài trong hàng đợi` : "Hàng đợi hiện đang trống"}
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-black/16 backdrop-blur-xl">
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-3">
          <PlayerDetailQueue
            queue={queue}
            currentIndex={normalizedIndex}
            playAt={playAt}
          />
        </div>
      </div>
    </div>
  );

  const mobileNowPanel = (
    <div
      className={`${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4`}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5 pb-4 pt-2">
        <div className="relative mx-auto w-full max-w-[min(58vw,248px)]">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[34px] opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 65% 72%, rgba(242,178,90,0.16), transparent 42%)",
            }}
          />
          <div className="relative aspect-square overflow-hidden rounded-[28px] bg-black/28 shadow-[0_26px_80px_rgba(0,0,0,0.42)]">
            {cover ? (
              <OptimizedImage
                src={cover}
                alt={currentSong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2f2f2f,#111)] text-sm uppercase tracking-[0.32em] text-white/50">
                No cover
              </div>
            )}
          </div>
        </div>

        <div className="w-full min-w-0 text-center">
          <div className="overflow-visible pb-2">
            <h2 className="overflow-hidden px-2 pt-[0.04em] pb-[0.14em] text-[clamp(1.8rem,8vw,3rem)] font-semibold leading-[1.03] tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {currentSong.title}
            </h2>
          </div>
          <div className="mt-1 overflow-hidden px-3 text-sm font-medium text-white/72 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            <ArtistNames
              item={currentSong}
              fallback="Unknown"
              linkClassName="transition"
            />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/42">
            {isPlaying ? "Đang phát" : "Tạm dừng"} · {modeLabel}
          </p>
        </div>
      </div>

      <div className={`rounded-[24px] bg-black/18 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl ${songSlideClass}`}>
        <div className="space-y-2">
          <div className="-my-1 px-1 py-1">
            <input
              type="range"
              min={0}
              max={total || 0}
              step={0.1}
              value={Math.min(displayedTime, total || 0)}
              onPointerDownCapture={handleSliderInteractionStart}
              onPointerMoveCapture={handleSliderInteractionMove}
              onPointerUpCapture={handleSliderInteractionEnd}
              onPointerCancelCapture={handleSliderInteractionEnd}
              onTouchStartCapture={handleSliderInteractionStart}
              onTouchMoveCapture={handleSliderInteractionMove}
              onTouchEndCapture={handleSliderInteractionEnd}
              onTouchCancelCapture={handleSliderInteractionEnd}
              onMouseDownCapture={handleSliderInteractionStart}
              onMouseUpCapture={handleSliderInteractionEnd}
              onPointerDown={onSeekStart}
              onPointerUp={onSeekCommit}
              onPointerCancel={onSeekCommit}
              onMouseDown={onSeekStart}
              onTouchStart={onSeekStart}
              onChange={onSeekChange}
              onMouseUp={onSeekCommit}
              onTouchEnd={onSeekCommit}
              className="player-detail-range h-2.5 w-full cursor-pointer"
              style={{
                "--range-progress": `${
                  total > 0 ? (Math.min(displayedTime, total) / total) * 100 : 0
                }%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between px-1 text-[11px] text-white/64">
            <span>{formatTime(displayedTime)}</span>
            <span>{formatTime(total)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`${mobileUtilityButtonClass} ${
              shuffle
                ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]"
                : ""
            }`}
            aria-label="Trộn"
          >
            <FaShuffle />
          </button>
          <button
            onClick={playPrev}
            className={mobileUtilityButtonClass}
            aria-label="Bài trước"
          >
            <FaBackwardStep />
          </button>
          <button
            onClick={togglePlay}
            className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#9dfabd,#4ad67f_55%,#249956)] text-[1.65rem] text-[#062512] shadow-[0_0_42px_rgba(75,220,126,0.52)] transition active:scale-95"
            aria-label="Phát hoặc tạm dừng"
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>
          <button
            onClick={playNext}
            className={mobileUtilityButtonClass}
            aria-label="Bài tiếp"
          >
            <FaForwardStep />
          </button>
          <button
            onClick={toggleRepeatMode}
            className={`${mobileUtilityButtonClass} ${
              repeatMode !== "off"
                ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]"
                : ""
            }`}
            aria-label="Lặp lại"
          >
            <span className="relative inline-flex">
              <FaRepeat />
              {repeatMode === "one" && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black">
                  1
                </span>
              )}
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {likeButton}
          <AddToPlaylistButton
            song={currentSong}
            triggerClassName="h-11 w-11 bg-white/[0.07] text-white/82"
          />
        </div>
      </div>
    </div>
  );

  const mobileLyricsPanel = (
    <div
      className={`${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4`}
    >
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-white">Lời bài hát</h3>
        <p className="mt-1 text-sm text-white/52">Vuốt để chuyển trang, chạm để tua</p>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-black/16 backdrop-blur-xl">
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-3">
          <PlayerDetailLyrics
            currentSong={currentSong}
            displayedTime={displayedTime}
            isActive={mobileTab === "lyrics"}
            onSeek={doSeek}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`player-detail-shell fixed inset-0 z-[999] h-[100svh] max-h-[100svh] overflow-hidden text-white ${stableClass} ${animateClass}`}
      style={{
        animationDuration: `${ANIM_MS}ms`,
        animationTimingFunction: ANIM_EASE,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onAnimationEnd={handleAnimEnd}
    >
      <div
        className="absolute inset-0 bg-black/48 backdrop-blur-[2px]"
        onMouseDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (backdropReady) handleClose();
        }}
      />

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-[-12%] scale-110 opacity-[0.7] blur-[120px]"
          style={
            cover
              ? {
                  backgroundImage: `url(${cover})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "saturate(1.02) brightness(0.48) contrast(1.01)",
                }
              : {
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(229,162,84,0.14), transparent 35%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.12), transparent 28%), linear-gradient(160deg, rgba(8,10,10,0.96), rgba(4,4,5,0.92))",
                }
          }
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(228,164,90,0.08),transparent_30%),linear-gradient(135deg,rgba(6,8,7,0.68),rgba(2,2,4,0.92))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.48))]" />
      </div>

      <div className="relative z-10 h-full w-full overflow-hidden">
        <div className="flex h-full min-h-0 flex-col px-3 pb-3 pt-[calc(env(safe-area-inset-top)+8px)] sm:px-5 sm:pb-5 sm:pt-5 lg:px-7 lg:pt-6">
          <div className="hidden flex-1 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,380px)] lg:gap-5 xl:grid-cols-[minmax(0,1.24fr)_420px]">
            <div className="min-h-0">{detailPanel}</div>
            <div className="min-h-0">{sidePanel}</div>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1 lg:hidden"
            onTouchStart={handleMobileTouchStart}
            onTouchMove={handleMobileTouchMove}
            onTouchEnd={handleMobileTouchEnd}
            onTouchCancel={resetMobileGesture}
            style={{
              transform: mobileDragOffset
                ? `translateY(${mobileDragOffset}px)`
                : undefined,
              opacity:
                mobileDragOffset > 0
                  ? Math.max(0.78, 1 - mobileDragOffset / 420)
                  : undefined,
              transition: mobileDragOffset
                ? "none"
                : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="mb-3 flex items-center justify-center pt-1">
              <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-xl">
                {mobileTabs.map((tab) => (
                  <span
                    key={tab.id}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                      mobileTab === tab.id
                        ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.78)]"
                        : "bg-zinc-400/75"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div
              ref={carouselRef}
              onScroll={() => {
                if (scrollRafRef.current) return;
                scrollRafRef.current = requestAnimationFrame(() => {
                  const el = carouselRef.current;
                  if (!el) return;

                  const width = el.clientWidth || 1;
                  const index = Math.round(el.scrollLeft / width);
                  const next = mobileTabs[index]?.id || "now";
                  setMobileTab(next);
                  scrollRafRef.current = null;
                });
              }}
              className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hidden"
              style={{
                overflowX: isCarouselSwipeLocked ? "hidden" : "auto",
                scrollSnapType: isCarouselSwipeLocked ? "none" : undefined,
              }}
            >
              <div className="flex min-h-0 w-full min-w-full snap-center overflow-hidden">
                {mobileQueuePanel}
              </div>
              <div className="flex min-h-0 w-full min-w-full snap-center overflow-hidden">
                {mobileNowPanel}
              </div>
              <div className="flex min-h-0 w-full min-w-full snap-center overflow-hidden">
                {mobileLyricsPanel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
