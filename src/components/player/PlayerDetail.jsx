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
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState("queue");

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

  /* ================= render ================= */
  return (
    <div
      className={`player-detail-shell fixed inset-0 z-[999] h-[100dvh] overflow-hidden text-white ${stableClass} ${animateClass}`}
      style={{
        animationDuration: `${ANIM_MS}ms`,
        animationTimingFunction: ANIM_EASE,
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

      {/* BG IMAGE */}
      <div
        className="absolute inset-0 opacity-40 blur-3xl"
        style={{
          backgroundImage: `url(${cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0b0b0b]/85 to-black" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-[min(1320px,94vw)] flex-col justify-start pb-6 pt-5 sm:justify-center sm:pb-10 sm:pt-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/10 transition hover:bg-white/15 sm:hidden"
            aria-label="Đóng chi tiết"
          >
            <FiChevronDown />
          </button>

          <button
            onClick={onClose}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg ring-1 ring-white/10 transition hover:bg-white/20 sm:flex"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div className="mt-5 flex flex-col items-center gap-1 text-center sm:mt-7">
          <h2 className="text-xl font-semibold tracking-tight sm:text-3xl">
            {currentSong.title}
          </h2>
          <p className="text-xs text-white/60 sm:text-sm">
            {currentSong.artist?.name || currentSong.artist_name || "Unknown"}
          </p>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
          {/* LEFT */}
          <div
            className={`flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-xl sm:p-8 ${songSlideClass}`}
          >
            {/* Album + like */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="h-44 w-44 overflow-hidden rounded-full bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.60)] ring-1 ring-white/10 sm:h-56 sm:w-56 lg:h-72 lg:w-72">
                  {cover && (
                    <img
                      src={cover}
                      alt={currentSong.title}
                      className={`player-detail-disc h-full w-full object-cover ${
                        isPlaying ? "is-playing" : ""
                      }`}
                    />
                  )}
                </div>

                {/* subtle glow */}
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl opacity-40"
                     style={{ background: "radial-gradient(circle, rgba(29,185,84,.35), transparent 60%)" }}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const songId = normalizeSongId(currentSong);
                    if (songId) toggleLike(songId);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ring-1 ring-white/5 transition active:scale-95 ${
                    likedSongIds.includes(normalizeSongId(currentSong))
                      ? "border-[#1db954] text-[#1db954] bg-[#1db954]/10"
                      : "border-white/10 text-white/80 bg-white/5 hover:bg-white/10"
                  }`}
                  aria-label="Yêu thích"
                >
                  <FiHeart />
                </button>
                <span className="text-sm text-white/60">
                  {likedSongIds.includes(normalizeSongId(currentSong))
                    ? "Đã thích"
                    : "Thích"}
                </span>
              </div>
            </div>

            {/* Seek */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={total || 0}
                step={0.1}
                value={Math.min(displayedTime, total || 0)}
                onMouseDown={onSeekStart}
                onTouchStart={onSeekStart}
                onChange={onSeekChange}
                onMouseUp={onSeekCommit}
                onTouchEnd={onSeekCommit}
                className="h-2 w-full cursor-pointer accent-[#1db954]"
              />
              <div className="flex items-center justify-between text-[11px] text-white/60 sm:text-xs">
                <span>{formatTime(displayedTime)}</span>
                <span>{formatTime(total)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 text-xl sm:text-2xl">
              <button
                onClick={toggleShuffle}
                className={`transition hover:opacity-100 ${
                  shuffle ? "text-[#1db954]" : "text-white/55 hover:text-white/80"
                }`}
                aria-label="Trộn"
              >
                <FaShuffle />
              </button>

              <button
                onClick={playPrev}
                className="text-white/75 transition hover:text-white"
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
                className="text-white/75 transition hover:text-white"
                aria-label="Bài tiếp"
              >
                <FaForwardStep />
              </button>

              <button
                onClick={toggleRepeatMode}
                className={`relative transition hover:opacity-100 ${
                  repeatMode !== "off"
                    ? "text-[#1db954]"
                    : "text-white/55 hover:text-white/80"
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

            {/* Volume */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleMute}
                className="text-lg opacity-70 transition hover:opacity-100"
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
                className="h-2 w-40 cursor-pointer accent-[#1db954]"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex h-[520px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5 backdrop-blur-xl sm:h-[600px] sm:p-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 rounded-full bg-white/5 p-1 ring-1 ring-white/5">
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
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
    </div>
  );
}
