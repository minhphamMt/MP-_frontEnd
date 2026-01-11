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
    volume,
    muted,
    setVolume,
    toggleMute,
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
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20 sm:right-8 sm:top-6"
      >
        ✕
      </button>

      {/* CONTENT */}
           <div className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] w-[min(1280px,94vw)] flex-col justify-center pb-10 pt-8">
        <div
  className={`grid grid-cols-1 lg:grid-cols-[360px_520px_360px] gap-10 items-start ${songSlideClass}`}
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
            <div className="h-64 w-64 overflow-hidden rounded-2xl bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.55)] sm:h-72 sm:w-72 lg:h-[360px] lg:w-[360px]">
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
 <div className="hidden lg:block">
            <div className="mb-4 text-sm tracking-widest opacity-60">
              TIẾP THEO
            </div>
            <div className="flex gap-6 justify-start">
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
 <div className="mt-8 flex flex-col gap-6 lg:hidden">
          <div>
            <div className="mb-3 text-xs tracking-widest opacity-60">
              ĐÃ PHÁT
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hidden">
              {played.length ? (
                played.map((s, idx) => {
                  const sCover = s.cover || s.cover_url || s.image;
                  const realIndex = queue.findIndex((q) => q === s);
                  return (
                    <button
                      key={s.id || idx}
                      type="button"
                      onClick={() => playAt(realIndex)}
                      className="w-28 flex-shrink-0 text-left"
                    >
                      <div className="h-24 w-24 overflow-hidden rounded-xl bg-white/10 shadow-lg">
                        {sCover && (
                          <img
                            src={sCover}
                            alt={s.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="mt-2 text-xs font-semibold line-clamp-1">
                        {s.title}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-xs opacity-50">Chưa có bài trước đó</div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs tracking-widest opacity-60">
              TIẾP THEO
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hidden">
              {upcoming.map((s, idx) => {
                const sCover = s.cover || s.cover_url || s.image;
                const realIndex = queue.findIndex((q) => q === s);
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => playAt(realIndex)}
                    className="w-28 flex-shrink-0 text-left"
                  >
                    <div className="h-24 w-24 overflow-hidden rounded-xl bg-white/10 shadow-lg">
                      {sCover && (
                        <img
                          src={sCover}
                          alt={s.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="mt-2 text-xs font-semibold line-clamp-1">
                      {s.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* CONTROLS */}
        <div className="mt-12">
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
         <div className="mt-10 ml-14 relative flex flex-col items-center  lg:flex-row">
            <div className="flex  items-center justify-center gap-8 mt-8 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
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
              className={`relative transition ${
                repeatMode !== "off"
                  ? "text-violet-400"
                  : "opacity-70"
              }`}
            >
              <FaRepeat />
               {repeatMode === "one" && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">
                  1
                </span>
              )}
            </button>
             </div>

            <div className="flex items-center gap-2 lg:absolute lg:right-0 mt-8">
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
                className="h-2 w-32 accent-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
