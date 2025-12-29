import {
  FaBackwardStep,
  FaForwardStep,
  FaPause,
  FaPlay,
  FaForwardStep as FaNext,
} from "react-icons/fa6";
import {
  HiOutlineArrowsPointingOut,
  HiOutlineQueueList,
  HiOutlineSpeakerWave,
} from "react-icons/hi2";
import { RiRepeat2Fill } from "react-icons/ri";
import { useState } from "react";
import usePlayerStore from "../../store/player.store";
import PlayerDetail from "./PlayerDetail";

const formatTime = (t = 0) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export default function PlayerBar() {
  const [showDetail, setShowDetail] = useState(false);
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    pause,
    resume,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleRepeatMode,
  } = usePlayerStore();

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePercent = Math.round((volume ?? 0) * 100);

  if (!currentSong) {
    return (
      <div className="h-24 border-t border-white/10 bg-gradient-to-r from-[#140c26] via-[#120b22] to-[#0b0914] flex items-center px-6 backdrop-blur">
        <span className="text-sm text-white/60">Chưa phát bài nào</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-24 border-t border-white/10 bg-gradient-to-r from-[#140c26] via-[#120b22] to-[#0b0914] px-6 backdrop-blur">
        {/* glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(167,139,250,0.15),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.15),transparent_40%)]" />

        <div className="relative flex h-full items-center gap-6">
          {/* LEFT */}
          <div className="flex w-1/3 items-center gap-3 min-w-0">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
              {currentSong.cover_url ? (
                <img
                  src={currentSong.cover_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-purple-500/60 to-white/20" />
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {currentSong.title}
              </div>
              <div className="truncate text-xs text-white/60">
                {currentSong.artist_name}
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-5 text-lg">
              <button
                onClick={playPrev}
                className="p-2 text-white/70 transition hover:text-white"
                aria-label="Bài trước"
              >
                <FaBackwardStep />
              </button>

              <button
                onClick={isPlaying ? pause : resume}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-base shadow-lg shadow-black/40 transition hover:scale-[1.05] hover:bg-white/15"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-white/70 transition hover:text-white"
                aria-label="Bài tiếp"
              >
                <FaNext />
              </button>
            </div>

            <div className="flex w-full items-center gap-3 text-[11px] text-white/60">
              <span className="w-12 text-right">
                {formatTime(currentTime)}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.01}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="player-slider flex-1"
                style={{
                  background: `linear-gradient(to right, #a78bfa ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                }}
                aria-label="Thanh tiến trình"
              />

              <span className="w-12">{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex w-1/3 items-center justify-end gap-4 text-lg">
            <button
              className="p-2 text-white/70 transition hover:text-white"
              aria-label="Danh sách phát"
            >
              <HiOutlineQueueList />
            </button>

            <button
              onClick={() => setShowDetail(true)}
              className="p-2 text-white/70 transition hover:text-white"
              aria-label="Mở trang chi tiết"
              title="Trang chi tiết"
            >
              <HiOutlineArrowsPointingOut />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`p-2 transition ${
                repeatMode !== "off"
                  ? "text-violet-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]"
                  : "text-white/70 hover:text-white"
              }`}
              aria-label="Lặp lại"
              title={
                repeatMode === "all"
                  ? "Lặp lại danh sách"
                  : repeatMode === "one"
                  ? "Lặp lại một bài"
                  : "Tắt lặp lại"
              }
            >
              <RiRepeat2Fill
                className={repeatMode === "one" ? "rotate-45" : ""}
              />
            </button>

            <div className="flex min-w-[160px] items-center gap-2">
              <HiOutlineSpeakerWave className="text-xl text-white/70" />
              <input
                type="range"
                min={0}
                max={100}
                value={volumePercent}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="player-slider flex-1"
                style={{
                  background: `linear-gradient(to right, #38bdf8 ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`,
                }}
                aria-label="Âm lượng"
              />
            </div>
          </div>
        </div>
      </div>

  <PlayerDetail isOpen={showDetail} onClose={() => setShowDetail(false)} />


    </>
  );
}