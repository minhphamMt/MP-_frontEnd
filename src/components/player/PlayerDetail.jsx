import { useEffect, useMemo, useRef, useState } from "react";
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

  /* ================= upcoming ================= */
  const upcoming = useMemo(() => {
    const list = queue || [];
    const next = list.slice(currentIndex + 1, currentIndex + 4);
    if (next.length) return next;
    return list.filter((_, i) => i !== currentIndex).slice(0, 3);
  }, [queue, currentIndex]);

  const played = useMemo(() => {
    const list = queue || [];
    if (currentIndex <= 0) return [];
    return list.slice(Math.max(0, currentIndex - 3), currentIndex);
  }, [queue, currentIndex]);

  if (!mounted || !currentSong) return null;

  const cover = currentSong.cover || currentSong.cover_url || currentSong.image;

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#121212]/85 to-black" />

      {/* CLOSE */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-white/20 sm:right-8 sm:top-6 sm:flex sm:h-10 sm:w-10 sm:text-xl"
      >
        ✕
      </button>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-[min(1280px,94vw)] flex-col justify-center pb-6 pt-6 sm:min-h-[calc(100vh-120px)] sm:pb-10 sm:pt-8">
        <div className="flex h-full flex-col gap-6 sm:hidden">
          <div className="flex items-center justify-between text-lg">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90"
              aria-label="Đóng chi tiết"
            >
              <FiChevronDown />
            </button>
            <div className="flex-1 truncate px-3 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
              {currentSong.title}
            </div>
            <button
              type="button"
              onClick={() => {
                const songId = normalizeSongId(currentSong);
                if (songId) toggleLike(songId);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                likedSongIds.includes(normalizeSongId(currentSong))
                  ? "border-[#1db954] text-[#1db954] bg-[#1db954]/10"
                  : "border-white/10 text-white/80 bg-white/5"
              }`}
              aria-label="Yêu thích"
            >
              <FiHeart />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="h-60 w-60 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
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

            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">
                {currentSong.title}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {currentSong.artist?.name ||
                  currentSong.artist_name ||
                  "Unknown"}
              </p>
            </div>

            <div className="h-px w-20 bg-white/10" />
          </div>

          <div className="space-y-3">
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
              className="h-2 w-full accent-[#1db954]"
            />
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{formatTime(displayedTime)}</span>
              <span>{formatTime(total)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xl">
            <button
              onClick={toggleShuffle}
              className={`transition ${
                shuffle ? "text-[#1db954]" : "text-white/60"
              }`}
            >
              <FaShuffle />
            </button>
            <button onClick={playPrev} className="text-white/80">
              <FaBackwardStep />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1db954] text-2xl text-black shadow-xl shadow-[#1db954]/40"
            >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-white/80">
              <FaForwardStep />
            </button>
            <button
              onClick={toggleRepeatMode}
              className={`relative transition ${
                repeatMode !== "off" ? "text-[#1db954]" : "text-white/60"
              }`}
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
        </div>
        <div
          className={`hidden grid-cols-1 lg:grid-cols-[360px_520px_360px] gap-10 items-start sm:grid ${songSlideClass}`}
        >
          {/* PLAYED */}
          <div className="hidden lg:block">
            <div className="mb-4 text-sm tracking-widest opacity-60">
              ĐÃ PHÁT
            </div>
            <div className="flex gap-6 justify-end">
              {played.length ? (
                played.map((s, idx) => {
                  const sCover = s.cover || s.cover_url || s.image;
                  const realIndex = queue.findIndex((q) => q === s);
                  return (
                    <div
                      key={s.id || idx}
                      className="w-[150px] cursor-pointer hover:scale-[1.04] transition"
                      onClick={() => playAt(realIndex)}
                    >
                      <div className="w-[150px] h-[150px] rounded-xl overflow-hidden bg-white/5 shadow-lg">
                        {sCover && (
                          <img
                            src={sCover}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="mt-2 text-sm font-semibold line-clamp-2 text-right">
                        {s.title}
                      </div>
                      <div className="text-xs opacity-70 line-clamp-1 text-right">
                        {s.artist?.name || s.artist_name || ""}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm opacity-50">Chưa có bài trước đó</div>
              )}
            </div>
          </div>

          {/* MAIN */}
          <div className="flex flex-col items-center">
            <div className="h-56 w-56 overflow-hidden rounded-full bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.55)] sm:h-72 sm:w-72 lg:h-[360px] lg:w-[360px]">
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

            <h2 className="mt-4 text-xl font-semibold text-center sm:mt-6 sm:text-3xl">
              {currentSong.title}
            </h2>
            <p className="mt-1 text-xs opacity-70 text-center sm:text-sm">
              {currentSong.artist?.name || currentSong.artist_name || "Unknown"}
            </p>
          </div>

          {/* UPCOMING */}
          <div className="hidden lg:block">
            <div className="mb-4 text-sm tracking-widest opacity-60">
              TIẾP THEO
            </div>
            <div className="flex gap-6 justify-start">
              {upcoming.map((s, idx) => {
                const sCover = s.cover || s.cover_url || s.image;
                const realIndex = queue.findIndex((q) => q === s);

                return (
                  <div
                    key={s.id || idx}
                    className="w-[150px] cursor-pointer hover:scale-[1.04] transition"
                    onClick={() => playAt(realIndex)}
                  >
                    <div className="w-[150px] h-[150px] rounded-xl overflow-hidden bg-white/5 shadow-lg">
                      {sCover && (
                        <img
                          src={sCover}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold line-clamp-2">
                      {s.title}
                    </div>
                    <div className="text-xs opacity-70 line-clamp-1">
                      {s.artist?.name || s.artist_name || ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* CONTROLS */}
        <div className="mt-6 hidden sm:block sm:mt-12">
          {/* SEEK */}
          <div className="flex items-center gap-4">
            <span className="w-10 text-right text-xs opacity-70">
              {formatTime(displayedTime)}
            </span>

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
              className="flex-1 h-2 accent-[#1db954]"
            />

            <span className="w-10 text-xs opacity-70">{formatTime(total)}</span>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 relative flex flex-col items-center sm:mt-10 sm:ml-14 lg:flex-row">
            <div className="flex items-center justify-center gap-6 sm:gap-8 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <button
                onClick={toggleShuffle}
                className={`transition ${
                  shuffle ? "text-[#1db954]" : "opacity-70"
                }`}
              >
                <FaShuffle />
              </button>

              <button onClick={playPrev}>
                <FaBackwardStep size={20} />
              </button>

              <button
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] text-black shadow-xl shadow-[#1db954]/40 hover:bg-[#1ed760] sm:h-14 sm:w-14"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>

              <button onClick={playNext}>
                <FaForwardStep size={20} />
              </button>

              <button
                onClick={toggleRepeatMode}
                className={`relative transition ${
                  repeatMode !== "off" ? "text-[#1db954]" : "opacity-70"
                }`}
              >
                <FaRepeat />
                {repeatMode === "one" && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black">
                    1
                  </span>
                )}
              </button>
            </div>

            <div className="hidden items-center gap-2 sm:flex lg:absolute lg:right-0">
              <button
                onClick={toggleMute}
                className="text-lg opacity-70 hover:opacity-100 transition"
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
                className="h-2 w-32 accent-[#1db954]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
