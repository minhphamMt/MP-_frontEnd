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
import { getSongLyrics } from "../../api/song.api";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";

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
  const [lyricsState, setLyricsState] = useState({
    items: [],
    loading: false,
    error: null,
  });
  const lyricsContainerRef = useRef(null);
  const lastLyricIndexRef = useRef(-1);

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

   useEffect(() => {
    const songId = normalizeSongId(currentSong);
    if (!songId) {
      setLyricsState({ items: [], loading: false, error: null });
      return;
    }

    setLyricsState((prev) => ({ ...prev, loading: true, error: null }));
    getSongLyrics(songId)
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? {};
        const items = payload?.items ?? payload ?? [];
        setLyricsState({
          items: Array.isArray(items) ? items : [],
          loading: false,
          error: null,
        });
      })
      .catch(() => {
        setLyricsState({
          items: [],
          loading: false,
          error: "Không thể tải lời bài hát",
        });
      });
  }, [currentSong]);

  const lyricIndex = useMemo(() => {
    if (!lyricsState.items.length) return -1;
    const ms = Math.floor(displayedTime * 1000);
    for (let i = 0; i < lyricsState.items.length; i += 1) {
      const item = lyricsState.items[i];
      const start = Number(item?.start_time ?? item?.startTime ?? 0);
      const end = Number(item?.end_time ?? item?.endTime ?? 0);
      const nextItem = lyricsState.items[i + 1];
      const nextStart = Number(
        nextItem?.start_time ?? nextItem?.startTime ?? Number.POSITIVE_INFINITY
      );

      if (ms >= start && (end ? ms <= end : ms < nextStart)) {
        return i;
      }
    }
    return -1;
  }, [displayedTime, lyricsState.items]);

  useEffect(() => {
    if (activeTab !== "lyrics") return;
    if (lyricIndex < 0 || lastLyricIndexRef.current === lyricIndex) return;
    const container = lyricsContainerRef.current;
    const line = container?.querySelector(
      `[data-lyric-index="${lyricIndex}"]`
    );
    if (line) {
      line.scrollIntoView({ behavior: "smooth", block: "center" });
      lastLyricIndexRef.current = lyricIndex;
    }
  }, [lyricIndex, activeTab]);

  const played = useMemo(() => {
    const list = queue || [];
    if (currentIndex <= 0) return [];
    return list.slice(Math.max(0, currentIndex - 3), currentIndex);
  }, [queue, currentIndex]);

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#121212]/85 to-black" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-[min(1280px,94vw)] flex-col justify-center pb-6 pt-6 sm:min-h-[calc(100vh-120px)] sm:pb-10 sm:pt-8">
         <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 sm:hidden"
            aria-label="Đóng chi tiết"
          >
            <FiChevronDown />
          </button>
          <div className="flex-1 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70 sm:text-sm">
            Đang phát
          </div>
          <button
            onClick={onClose}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-white/20 sm:flex"
          >
            ✕
          </button>
        </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-center sm:mt-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            {currentSong.title}
          </h2>
          <p className="text-sm text-white/70">
            {currentSong.artist?.name || currentSong.artist_name || "Unknown"}
          </p>
        </div>

           <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* LEFT */}
          <div
            className={`flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 ${songSlideClass}`}
          >
            <div className="flex flex-col items-center gap-5">
              <div className="h-56 w-56 overflow-hidden rounded-full bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.55)] sm:h-72 sm:w-72">
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

              <div className="flex items-center gap-3">
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
                <span className="text-sm text-white/60">
                  {likedSongIds.includes(normalizeSongId(currentSong))
                    ? "Đã thích"
                    : "Thích"}
                </span>
              </div>
            </div>

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
                className="h-2 w-full accent-[#1db954]"
              />
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{formatTime(displayedTime)}</span>
                <span>{formatTime(total)}</span>
              </div>
            </div>
        

          <div className="flex items-center justify-center gap-5 text-xl sm:text-2xl">
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
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] text-2xl text-black shadow-xl shadow-[#1db954]/40"
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

            <div className="flex items-center justify-center gap-3">
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
                className="h-2 w-40 accent-[#1db954]"
              />
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="flex items-center gap-2 rounded-full bg-white/5 p-1">
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
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "queue" && (
              <div className="mt-5 space-y-6">
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Đã phát
                  </div>
                  {played.length ? (
                    <div className="space-y-3">
                      {played.map((song, idx) => {
                        const sCover = resolveAssetUrl(
                          song.cover || song.cover_url || song.image
                        );
                        const realIndex = queue.findIndex((q) => q === song);
                        return (
                          <button
                            key={song.id || idx}
                            type="button"
                            onClick={() => playAt(realIndex)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-left transition hover:border-white/20"
                          >
                            <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/5">
                              {sCover && (
                                <img
                                  src={sCover}
                                  alt={song.title}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold line-clamp-1">
                                {song.title}
                              </div>
                              <div className="text-xs text-white/60 line-clamp-1">
                                {song.artist?.name || song.artist_name || ""}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">Chưa có bài trước đó</p>
                  )}
                </div>

                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Tiếp theo
                  </div>
                  {upcoming.length ? (
                    <div className="space-y-3">
                      {upcoming.map((song, idx) => {
                        const sCover = resolveAssetUrl(
                          song.cover || song.cover_url || song.image
                        );
                        const realIndex = queue.findIndex((q) => q === song);
                        return (
                          <button
                            key={song.id || idx}
                            type="button"
                            onClick={() => playAt(realIndex)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-left transition hover:border-white/20"
                          >
                            <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/5">
                              {sCover && (
                                <img
                                  src={sCover}
                                  alt={song.title}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold line-clamp-1">
                                {song.title}
                              </div>
                              <div className="text-xs text-white/60 line-clamp-1">
                                {song.artist?.name || song.artist_name || ""}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">Chưa có bài tiếp theo</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "lyrics" && (
              <div className="mt-5 flex min-h-[320px] flex-1 flex-col">
                {lyricsState.loading && (
                  <p className="text-sm text-white/60">Đang tải lời bài hát...</p>
                )}
                {lyricsState.error && (
                  <p className="text-sm text-red-300">{lyricsState.error}</p>
                )}
                {!lyricsState.loading &&
                  !lyricsState.error &&
                  lyricsState.items.length === 0 && (
                    <p className="text-sm text-white/50">
                      Bài hát chưa có lời.
                    </p>
                  )}

                {!lyricsState.loading &&
                  !lyricsState.error &&
                  lyricsState.items.length > 0 && (
                    <div
                      ref={lyricsContainerRef}
                      className="mt-1 flex-1 space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed text-white/70"
                    >
                      {lyricsState.items.map((item, index) => {
                        const isActive = index === lyricIndex;
                        return (
                          <p
                            key={item.id || index}
                            data-lyric-index={index}
                            className={`transition ${
                              isActive
                                ? "text-base font-semibold text-white"
                                : "text-white/60"
                            }`}
                          >
                            {item.text}
                          </p>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
