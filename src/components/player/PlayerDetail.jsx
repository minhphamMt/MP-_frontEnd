import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaForwardStep,
  FaBackwardStep,
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
    currentTime,
    duration,
    seek,
  } = usePlayerStore();

  /* ================= animation ================= */
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("closed");
  const [backdropReady, setBackdropReady] = useState(false);

useEffect(() => {
  if (isOpen) {
    // ===== OPEN =====
    setMounted(true);
    setPhase("enter");
    setBackdropReady(false);

    const backdropTimer = setTimeout(() => {
      setBackdropReady(true);
    }, 80);

    const openTimer = setTimeout(() => {
      setPhase("open");
    }, ANIM_MS);

    return () => {
      clearTimeout(backdropTimer);
      clearTimeout(openTimer);
    };
  }

  // ===== CLOSE =====
  if (!isOpen && mounted) {
    setPhase("exit");
    setBackdropReady(false);

    const closeTimer = setTimeout(() => {
      setMounted(false);
      setPhase("closed");
    }, ANIM_MS);

    return () => clearTimeout(closeTimer);
  }
}, [isOpen]); // ❗ KHÔNG thêm mounted vào dependency


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

    return () => {
      audioEl?.removeEventListener("loadedmetadata", syncDuration);
    };
  }, [mounted, currentSong]);

  const total = Number(duration || fallbackDuration || 0) || 0;
  const displayedTime = isSeeking ? seekValue : Number(currentTime || 0);

  useEffect(() => {
    if (!isSeeking) setSeekValue(displayedTime);
  }, [displayedTime, isSeeking]);

  const doSeek = (t) => {
    const time = Math.max(0, Math.min(total, Number(t) || 0));
    if (typeof seek === "function") {
      seek(time);
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
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
    phase === "open" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0";

  /* ================= render ================= */
  return (
    <div
      className={`player-detail-shell fixed inset-0 z-[999] text-white ${stableClass} ${animateClass}`}
      style={{ animationDuration: `${ANIM_MS}ms`, animationTimingFunction: ANIM_EASE }}
    >
      {/* ================= BACKGROUND GLASS ================= */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
        onClick={() => backdropReady && onClose?.()}
      />
      <div
        className="absolute inset-0 opacity-40 blur-3xl"
        style={{
          backgroundImage: `url(${cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      {/* ================= CLOSE ================= */}
      <div className="absolute inset-x-0 top-3 z-50 flex justify-center">
        <div className="h-1.5 w-16 rounded-full bg-white/30" />
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-8 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition"
      >
        ✕
      </button>

      {/* ================= TABS ================= */}
      <div className="relative z-10 flex justify-center pt-10">
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          <button className="px-5 py-2 rounded-full bg-white/20 text-sm font-semibold">
            Danh sách phát
          </button>
          <button className="px-5 py-2 rounded-full text-sm opacity-70 hover:opacity-100">
            Karaoke
          </button>
          <button className="px-5 py-2 rounded-full text-sm opacity-70 hover:opacity-100">
            Lời bài hát
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto mt-12 w-[min(1200px,92vw)] pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-14 items-center">
          {/* ===== MAIN SONG ===== */}
          <div className="flex flex-col items-center">
            <div className="w-[360px] h-[360px] rounded-2xl overflow-hidden bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
              {cover ? (
                <img
                  src={cover}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-center">
              {currentSong.title}
            </h2>
            <p className="mt-1 text-sm opacity-70 text-center">
              {currentSong.artist?.name ||
                currentSong.artist_name ||
                "Unknown"}
            </p>
          </div>

          {/* ===== UPCOMING ===== */}
          <div>
            <div className="mb-4 text-sm tracking-widest opacity-60">
              TIẾP THEO
            </div>

            <div className="flex gap-6">
              {upcoming.map((s) => {
                const sCover = s.cover || s.cover_url || s.image;
                return (
                  <div
                    key={s.id}
                    className="w-[150px] cursor-pointer transition hover:scale-[1.04]"
                  >
                    <div className="w-[150px] h-[150px] rounded-xl overflow-hidden bg-white/5 shadow-lg">
                      {sCover ? (
                        <img
                          src={sCover}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10" />
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

        {/* ================= CONTROLS ================= */}
        <div className="mt-16">
          {/* ===== SEEK ===== */}
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
              className="flex-1 h-2 cursor-pointer accent-violet-500"
            />

            <span className="w-10 text-xs opacity-70">
              {formatTime(total)}
            </span>
          </div>

          {/* ===== BUTTONS ===== */}
          <div className="mt-8 flex items-center justify-center gap-12">
            <button
              onClick={playPrev}
              className="opacity-80 hover:opacity-100 transition"
            >
              <FaBackwardStep size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-violet-500 hover:bg-violet-400 shadow-xl flex items-center justify-center transition"
            >
              {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
            </button>

            <button
              onClick={playNext}
              className="opacity-80 hover:opacity-100 transition"
            >
              <FaForwardStep size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
