import { useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaForwardStep,
  FaBackwardStep,
  FaShuffle,
  FaRepeat,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";
import { FiChevronDown, FiHeart } from "react-icons/fi";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import PlayerDetailLyrics from "./PlayerDetailLyrics";
import PlayerDetailQueue from "./PlayerDetailQueue";
import OptimizedImage from "../common/OptimizedImage";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";

/* ================= utils ================= */
const formatTime = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

const ANIM_MS = 450;
const ANIM_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ================= component ================= */
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
  const carouselRef = useRef(null);
  const scrollRafRef = useRef(null);
  const lastRecommendationSeedRef = useRef(null);

  /* ================= animation ================= */
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("closed"); // closed | enter | open | exit
  const [backdropReady, setBackdropReady] = useState(false);

  const phaseRef = useRef("closed");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setPhase("enter");
      setBackdropReady(false);
      const t = setTimeout(() => setBackdropReady(true), 80);
      return () => clearTimeout(t);
    }

    if (!isOpen) {
      setBackdropReady(false);
      setPhase((prev) => (prev === "closed" ? "closed" : "exit"));
    }
  }, [isOpen]);

  // ✅ Lock body scroll so overlay never scrolls the page behind
  useEffect(() => {
    if (!mounted) return;
    if (typeof document === "undefined") return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    if (isOpen) {
      // avoid layout shift when scrollbar disappears
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
    if (!mounted || !isOpen) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return;
    const el = carouselRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: width, behavior: "auto" });
    setMobileTab("now");
  }, [mounted, isOpen]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const seedId = normalizeSongId(currentSong);
    if (!seedId) return;
    if (recommendationLoading) return;
    if (queue.length > currentIndex + 1) return;
    if (lastRecommendationSeedRef.current === seedId) return;

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
  ]);

  const handleAnimEnd = () => {
    const p = phaseRef.current;
    if (p === "enter") setPhase("open");
    if (p === "exit") {
      setMounted(false);
      setPhase("closed");
    }
  };

  /* ===== song switch animation (ADD) ===== */
  const [songSlideClass, setSongSlideClass] = useState("");
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (prevIndexRef.current === currentIndex) return;

    if (currentIndex > prevIndexRef.current) {
      setSongSlideClass("song-slide-next");
    } else {
      setSongSlideClass("song-slide-prev");
    }

    prevIndexRef.current = currentIndex;

    const t = setTimeout(() => setSongSlideClass(""), 380);
    return () => clearTimeout(t);
  }, [currentIndex]);

  /* ================= seek logic (GIỮ NGUYÊN) ================= */
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [fallbackDuration, setFallbackDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!mounted) return;
    const audioEl = document.querySelector("audio");
    audioRef.current = audioEl;

    const syncDuration = () => {
      setFallbackDuration(audioEl?.duration || 0);
    };

    syncDuration();
    audioEl?.addEventListener("loadedmetadata", syncDuration);
    return () => audioEl?.removeEventListener("loadedmetadata", syncDuration);
  }, [mounted, currentSong]);

  const total = Number(duration || fallbackDuration || 0) || 0;
  const displayedTime = isSeeking ? seekValue : Number(currentTime || 0);

  useEffect(() => {
    if (!isSeeking) setSeekValue(displayedTime);
  }, [displayedTime, isSeeking]);

  const doSeek = (t) => {
    const time = Math.max(0, Math.min(total, Number(t) || 0));
    seek?.(time);
  };

  const onSeekStart = () => setIsSeeking(true);
  const onSeekChange = (e) => setSeekValue(Number(e.target.value));
  const onSeekCommit = () => {
    setIsSeeking(false);
    doSeek(seekValue);
  };

  /* ================= playback ================= */
  const togglePlay = () => {
    isPlaying ? pause() : resume();
  };

  const handleVolumeChange = (value) => {
    const next = Number(value);
    if (muted && next > 0) {
      toggleMute();
    }
    setVolume(next);
  };

  if (!mounted || !currentSong) return null;

  const cover = resolveAssetUrl(
    currentSong.cover || currentSong.cover_url || currentSong.image
  );

  const likeButton = (
    <button
      type="button"
      onClick={() => {
        const songId = normalizeSongId(currentSong);
        if (songId) toggleLike(songId);
      }}
      className={`flex h-10 w-10 items-center justify-center rounded-full border ring-1 ring-white/5 transition active:scale-95 ${
        likedSongIds.includes(normalizeSongId(currentSong))
          ? "border-[#1db954] text-[#1db954] bg-[#1db954]/10"
          : "border-white/10 text-white/80 bg-white/5 md:hover:bg-white/10"
      }`}
      aria-label="Yêu thích"
    >
      <FiHeart />
    </button>
  );

  const animateClass =
    phase === "enter"
      ? "player-detail-anim-in"
      : phase === "exit"
      ? "player-detail-anim-out"
      : "";

  const stableClass =
    phase === "open" || phase === "enter"
      ? "translate-y-0 opacity-100"
      : "translate-y-full opacity-0";

  const detailPanel = (
  <div
    className={`flex w-full flex-1 min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/15 via-white/5 to-black/30 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-xl sm:bg-white/5 sm:p-6 ${songSlideClass}`}
  >
    {/* ✅ KHÔNG SCROLL ở panel này để không mất controls */}
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ================== ALBUM (auto scale) ================== */}
      <div className="flex min-h-0 items-center justify-center py-0.5 sm:flex-1 sm:py-0">
        {/* Desktop/Laptop/Tablet landscape: ảnh chữ nhật */}
        <div
          className="
            relative hidden w-full overflow-hidden rounded-3xl bg-black/30 shadow-[0_25px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10
            sm:flex
          "
          style={{
            // ✅ tự co theo màn hình: không chiếm hết làm mất controls
            height: "clamp(180px, 38vh, 320px)",
          }}
        >
          {cover && (
            <OptimizedImage
              src={cover}
              alt={currentSong.title}
              className="h-full w-full object-contain"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
        </div>

        {/* Phone: đĩa tròn */}
        <div className="relative flex items-center justify-center sm:hidden">
          <div
            className="overflow-hidden rounded-full bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.60)] ring-1 ring-white/10"
            style={{
              // ✅ co theo màn hình điện thoại để không lẹm
              width: "clamp(210px, 70vw, 320px)",
              height: "clamp(210px, 70vw, 320px)",
            }}
          >
            {cover && (
              <OptimizedImage
                src={cover}
                alt={currentSong.title}
                className={`player-detail-disc h-full w-full object-cover ${
                  isPlaying ? "is-playing" : ""
                }`}
              />
            )}
          </div>

          {/* subtle glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(29,185,84,.35), transparent 60%)",
            }}
          />
        </div>
      </div>

      <div className="mt-3 text-center sm:hidden">
        <h3 className="truncate text-2xl font-semibold tracking-tight text-white">
          {currentSong.title}
        </h3>
        <p className="mt-1 truncate text-sm text-white/70">
          {currentSong.artist?.name || currentSong.artist_name || "Unknown"}
        </p>
      </div>

      {/* ================== SEEK ================== */}
      <div className="mt-2.5 space-y-2 sm:mt-4">
        <div className="px-1 sm:px-2">
          <input
            type="range"
            min={0}
            max={total || 0}
            step={0.1}
            value={Math.min(displayedTime, total || 0)}
            onPointerDown={onSeekStart}
            onPointerUp={onSeekCommit}
            onPointerCancel={onSeekCommit}
            onMouseDown={onSeekStart}
            onTouchStart={onSeekStart}
            onChange={onSeekChange}
            onMouseUp={onSeekCommit}
            onTouchEnd={onSeekCommit}
            className="player-detail-range h-2 w-full cursor-pointer"
            style={{
              "--range-progress": `${
                total > 0 ? (Math.min(displayedTime, total) / total) * 100 : 0
              }%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between px-1 sm:px-2 text-[11px] text-white/60 sm:text-xs">
          <span>{formatTime(displayedTime)}</span>
          <span>{formatTime(total)}</span>
        </div>
      </div>

      {/* ================== CONTROLS BAR (always visible) ================== */}
      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:mt-4">
        {/* Like: luôn bên trái */}
        <div className="flex items-center justify-start">
          {likeButton}
        </div>

        {/* Controls: luôn center */}
        <div className="flex items-center justify-center gap-4 text-xl sm:gap-5 sm:text-2xl">
          <button
            onClick={toggleShuffle}
            className={`transition ${
              shuffle ? "text-[#1db954]" : "text-white/55 md:hover:text-white/85"
            }`}
            aria-label="Trộn"
          >
            <FaShuffle />
          </button>

          <button
            onClick={playPrev}
            className="text-white/75 transition md:hover:text-white"
            aria-label="Bài trước"
          >
            <FaBackwardStep />
          </button>

          <button
            onClick={togglePlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] text-2xl text-black shadow-[0_0_45px_rgba(29,185,84,0.55)] transition active:scale-95 sm:h-16 sm:w-16"
            aria-label="Phát/Tạm dừng"
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>

          <button
            onClick={playNext}
            className="text-white/75 transition md:hover:text-white"
            aria-label="Bài tiếp"
          >
            <FaForwardStep />
          </button>

          <button
            onClick={toggleRepeatMode}
            className={`relative transition ${
              repeatMode !== "off"
                ? "text-[#1db954]"
                : "text-white/55 md:hover:text-white/85"
            }`}
            aria-label="Lặp"
          >
            <span className="relative inline-flex">
              <FaRepeat />
              {repeatMode === "one" && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black">
                  1
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Right actions: Add to playlist (always visible) + volume (md+) */}
        <div className="flex items-center justify-end gap-2 md:gap-3">
          <AddToPlaylistButton
            song={currentSong}
            triggerClassName="h-10 w-10 border-white/15 bg-white/5 text-white/80 ring-1 ring-white/5 md:hover:border-white/30 md:hover:bg-white/15"
          />

          <button
            onClick={toggleMute}
            className="hidden text-lg opacity-70 transition md:inline-flex md:hover:opacity-100"
            aria-label="Tắt/Mở tiếng"
          >
            {muted || volume === 0 ? <FaVolumeXmark /> : <FaVolumeHigh />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => handleVolumeChange(e.target.value)}
            className="player-detail-range hidden h-2 w-32 cursor-pointer md:block"
            style={{
              "--range-progress": `${(muted ? 0 : volume) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 px-1 md:hidden">
        <button
          onClick={toggleMute}
          className="text-base text-white/70 transition active:scale-95"
          aria-label="Tắt/Mở tiếng"
        >
          {muted || volume === 0 ? <FaVolumeXmark /> : <FaVolumeHigh />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => handleVolumeChange(e.target.value)}
          className="player-detail-range h-2.5 w-full cursor-pointer"
          style={{
            "--range-progress": `${(muted ? 0 : volume) * 100}%`,
          }}
        />
        <FaVolumeHigh className="text-base text-white/60" aria-hidden="true" />
      </div>
    </div>
  </div>
);



  /* ================= render ================= */
  return (
    <div
      className={`player-detail-shell fixed inset-0 z-[999] h-[100svh] max-h-[100svh]
      overflow-hidden text-white ${stableClass} ${animateClass}`}
      style={{
        animationDuration: `${ANIM_MS}ms`,
        animationTimingFunction: ANIM_EASE,
        paddingBottom: "env(safe-area-inset-bottom)", // ✅ iOS safe area
      }}
      onAnimationEnd={handleAnimEnd}
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
        onMouseDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (backdropReady) onClose?.();
        }}
      />

      {/* BG IMAGE (isolated layer) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-[-20%] opacity-40 blur-3xl"
          style={{
            backgroundImage: `url(${cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0b0b0b]/85 to-black" />
      </div>

      {/* CONTENT */}
      {/* ✅ h-full + min-h-0 để flex con không “lèm” */}
      <div className="relative z-10 h-full w-full overflow-hidden">
        <div className="relative mx-auto flex h-full w-full min-h-0 max-w-[1240px] flex-col overflow-hidden px-3 pt-[calc(env(safe-area-inset-top)+8px)] pb-3 sm:px-6 sm:pt-7 sm:pb-7">
          {/* Close button */}
          <button
            onClick={onClose}
            className="
              absolute
              right-3 top-[calc(env(safe-area-inset-top)+8px)]
              z-20
              flex h-9 w-9 items-center justify-center
              rounded-2xl
              bg-black/45
              text-base text-white/85
              ring-1 ring-white/20
              backdrop-blur
              shadow-[0_8px_25px_rgba(0,0,0,0.35)]
              transition md:hover:bg-black/60 md:hover:text-white
              sm:right-6 sm:top-6 sm:h-10 sm:w-10
            "
            aria-label="Đóng"
          >
            <span className="-mt-[1px]">✕</span>
          </button>

          {/* Title */}
          <div className="mt-4 hidden flex-col items-center gap-1 text-center sm:mt-6 sm:flex">
            <h2 className="text-xl font-semibold tracking-tight sm:text-3xl">
              {currentSong.title}
            </h2>
            <p className="text-xs text-white/60 sm:text-sm">
              {currentSong.artist?.name || currentSong.artist_name || "Unknown"}
            </p>
          </div>

          {/* Main grid */}
          {/* Desktop layout */}
          <div className="mt-5 hidden min-h-0 flex-1 gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_400px] overflow-hidden">
            {detailPanel}

            {/* RIGHT */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
              {/* Tabs */}
              <div className="flex items-center gap-2 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                {[
                  { id: "queue", label: "Danh sách phát" },
                  { id: "lyrics", label: "Lời bài hát" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                      activeTab === tab.id
                        ? "bg-white text-black shadow-sm"
                        : "text-white/70 md:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ✅ only this area scrolls */}
              <div className="min-h-0 flex-1 overflow-y-auto mt-4">
                {activeTab === "queue" && (
                  <PlayerDetailQueue
                    queue={queue}
                    currentIndex={currentIndex}
                    playAt={playAt}
                  />
                )}

                {activeTab === "lyrics" && (
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

          {/* Mobile/tablet swipe layout */}
          <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
            <div className="mb-4 flex items-center justify-center gap-2 overflow-x-auto px-1 text-xs text-white/60 sm:mb-3 sm:px-0">
              {[
                { id: "lyrics", label: "Lời bài hát" },
                { id: "now", label: "Đang phát" },
                { id: "queue", label: "Danh sách phát" },
              ].map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    const el = carouselRef.current;
                    if (!el) return;
                    const width = el.clientWidth;
                    el.scrollTo({ left: width * index, behavior: "smooth" });
                    setMobileTab(tab.id);
                  }}
                  className={`rounded-full px-3 py-1 ring-1 transition ${
                    mobileTab === tab.id
                      ? "bg-white/15 text-white/90 ring-white/20"
                      : "bg-white/5 text-white/60 ring-white/10 md:hover:text-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
                  const next =
                    index === 0 ? "lyrics" : index === 1 ? "now" : "queue";
                  setMobileTab(next);
                  scrollRafRef.current = null;
                });
              }}
              className="
                flex flex-1 min-h-0
                w-full
                snap-x snap-mandatory
                gap-0
                overflow-x-auto
                overflow-y-hidden
                pb-3 sm:pb-6
                scrollbar-hidden
              "
            >
              {/* Lyrics slide */}
              <div className="flex min-h-0 w-full min-w-[100%] snap-center overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur-xl overflow-hidden">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Lời bài hát
                  </div>

                  {/* ✅ only lyrics area scrolls */}
                  <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                    <PlayerDetailLyrics
                      currentSong={currentSong}
                      displayedTime={displayedTime}
                      isActive={mobileTab === "lyrics"}
                      onSeek={doSeek}
                    />
                  </div>
                </div>
              </div>

              {/* Now playing slide */}
              <div className="flex min-h-0 w-full min-w-[100%] snap-center overflow-hidden">
                {detailPanel}
              </div>

              {/* Queue slide */}
              <div className="flex min-h-0 w-full min-w-[100%] snap-center overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/5 backdrop-blur-xl overflow-hidden">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Danh sách phát
                  </div>

                  {/* ✅ only queue area scrolls */}
                  <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                    <PlayerDetailQueue
                      queue={queue}
                      currentIndex={currentIndex}
                      playAt={playAt}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ optional extra safe bottom spacing */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
