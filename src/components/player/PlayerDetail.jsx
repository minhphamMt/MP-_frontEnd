import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaForwardStep,
  FaBackwardStep,
  FaShuffle,
  FaRepeat,
} from "react-icons/fa6";
import usePlayerStore from "../../store/player.store";

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
    return () =>
      audioEl?.removeEventListener("loadedmetadata", syncDuration);
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

  /* ================= upcoming ================= */
  const upcoming = useMemo(() => {
    const list = queue || [];
    const next = list.slice(currentIndex + 1, currentIndex + 4);
    if (next.length) return next;
    return list.filter((_, i) => i !== currentIndex).slice(0, 3);
  }, [queue, currentIndex]);

  if (!mounted || !currentSong) return null;

  const cover =
    currentSong.cover ||
    currentSong.cover_url ||
    currentSong.image;

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
      className={`player-detail-shell fixed inset-0 z-[999] text-white ${stableClass} ${animateClass}`}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      {/* CLOSE */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition"
      >
        ✕
      </button>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto mt-14 w-[min(1200px,92vw)] pb-10">
<div
  className={`grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-14 items-center ${songSlideClass}`}
>

          {/* MAIN */}
          <div className="flex flex-col items-center">
            <div className="w-[360px] h-[360px] rounded-2xl overflow-hidden bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
              {cover && (
                <img
                  src={cover}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-center">
              {currentSong.title}
            </h2>
            <p className="mt-1 text-sm opacity-70 text-center">
              {currentSong.artist?.name ||
                currentSong.artist_name ||
                "Unknown"}
            </p>
          </div>

          {/* UPCOMING */}
          <div>
            <div className="mb-4 text-sm tracking-widest opacity-60">
              TIẾP THEO
            </div>
            <div className="flex gap-6">
              {upcoming.map((s, idx) => {
                const sCover = s.cover || s.cover_url || s.image;
                const realIndex = queue.findIndex(
                  (q) => q === s
                );

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
        <div className="mt-16">
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
              className="flex-1 h-2 accent-violet-500"
            />

            <span className="w-10 text-xs opacity-70">
              {formatTime(total)}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex items-center justify-center gap-10">
            <button
              onClick={toggleShuffle}
              className={`transition ${
                shuffle ? "text-violet-400" : "opacity-70"
              }`}
            >
              <FaShuffle />
            </button>

            <button onClick={playPrev}>
              <FaBackwardStep size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-violet-500 hover:bg-violet-400 shadow-xl flex items-center justify-center"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button onClick={playNext}>
              <FaForwardStep size={20} />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`transition ${
                repeatMode !== "off"
                  ? "text-violet-400"
                  : "opacity-70"
              }`}
            >
              <FaRepeat />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
