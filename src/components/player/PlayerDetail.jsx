import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaForwardStep,
  FaBackwardStep,
} from "react-icons/fa6";
import usePlayerStore from "../../store/player.store";

const formatTime = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

export default function PlayerDetail({ isOpen, onClose }) {
  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    pause,
    resume,
    next,
    prev,

    // nếu store bạn có mấy cái này thì component sẽ tự dùng
    progress, // currentTime (giây)
    duration, // total (giây)
    seek, // (time) => void  (optional)
    setCurrentTime, // (time) => void (optional)
  } = usePlayerStore();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // fallback audio element nếu store không có seek
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // thử bắt audio trong DOM (tùy app bạn render audio ở đâu)
    audioRef.current = document.querySelector("audio");
  }, [isOpen]);

  // đồng bộ seekValue theo progress (khi không kéo)
  useEffect(() => {
    if (isSeeking) return;
    setSeekValue(Number(progress || 0));
  }, [progress, isSeeking]);

  const total = Number(duration || audioRef.current?.duration || 0) || 0;

  const upcoming = useMemo(() => {
    const list = queue?.length ? queue : [];
    const a = list.slice(currentIndex + 1, currentIndex + 4);
    if (a.length) return a;
    // nếu hết bài phía sau thì lấy 3 bài khác
    return list.filter((_, i) => i !== currentIndex).slice(0, 3);
  }, [queue, currentIndex]);

  if (!isOpen || !currentSong) return null;

  const cover = currentSong.cover || currentSong.cover_url || currentSong.image;

  const doSeek = (t) => {
    const time = Math.max(0, Math.min(total || 0, Number(t) || 0));

    // ưu tiên store
    if (typeof seek === "function") return seek(time);
    if (typeof setCurrentTime === "function") return setCurrentTime(time);

    // fallback audio DOM
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      return;
    }
  };

  const onSeekStart = () => setIsSeeking(true);

  const onSeekChange = (e) => {
    setSeekValue(Number(e.target.value));
  };

  const onSeekCommit = () => {
    setIsSeeking(false);
    doSeek(seekValue);
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else resume();
  };

  return (
    <div className="fixed inset-0 z-[999] text-white">
      {/* Background blur by cover */}
      <div className="absolute inset-0 bg-[#0b1220]" />
      <div
        className="absolute inset-0 opacity-40 blur-3xl"
        style={{
          backgroundImage: `url(${cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/70 via-[#0b1220]/85 to-[#0b1220]" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 h-10 w-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-xl"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Tabs */}
      <div className="relative z-10 flex justify-center pt-6">
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          <button className="px-5 py-2 rounded-full bg-white/15 font-semibold text-sm">
            Danh sách phát
          </button>
          <button className="px-5 py-2 rounded-full text-sm opacity-75 hover:opacity-100">
            Karaoke
          </button>
          <button className="px-5 py-2 rounded-full text-sm opacity-75 hover:opacity-100">
            Lời bài hát
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto mt-12 w-[min(1200px,92vw)]">
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10 items-center">
          {/* Main song */}
          <div className="flex flex-col items-center">
            <div className="w-[360px] h-[360px] rounded-2xl overflow-hidden shadow-2xl bg-white/5">
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

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-center">
              {currentSong.title}
            </h2>
            <p className="mt-2 opacity-75 text-center">
              {currentSong.artist?.name || currentSong.artist_name || "Unknown"}
            </p>
          </div>

          {/* Upcoming */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="text-sm tracking-wider opacity-70 mb-4">
              TIẾP THEO
            </div>

            <div className="flex gap-6">
              {upcoming.map((s) => {
                const sCover = s.cover || s.cover_url || s.image;
                return (
                  <div key={s.id} className="w-[150px]">
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

        {/* Bottom controls */}
        <div className="mt-16">
          {/* Seek row */}
          <div className="flex items-center gap-4">
            <span className="text-xs opacity-70 w-10 text-right">
              {formatTime(isSeeking ? seekValue : progress)}
            </span>

            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={total || 0}
                step={0.1}
                value={Math.min(seekValue, total || 0)}
                onMouseDown={onSeekStart}
                onTouchStart={onSeekStart}
                onChange={onSeekChange}
                onMouseUp={onSeekCommit}
                onTouchEnd={onSeekCommit}
                className="w-full h-2 cursor-pointer accent-violet-500"
              />
            </div>

            <span className="text-xs opacity-70 w-10">
              {formatTime(total)}
            </span>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-center gap-10">
            <button
              onClick={prev}
              className="opacity-85 hover:opacity-100"
              aria-label="Previous"
            >
              <FaBackwardStep size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-violet-500 hover:bg-violet-400 shadow-xl flex items-center justify-center"
              aria-label="Play/Pause"
            >
              {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
            </button>

            <button
              onClick={next}
              className="opacity-85 hover:opacity-100"
              aria-label="Next"
            >
              <FaForwardStep size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
