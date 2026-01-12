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
  HiOutlineSpeakerXMark,
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
    muted,
    repeatMode,
    pause,
    resume,
    playNext,
    playPrev,
    seek,
    toggleMute,
    setVolume,
    toggleRepeatMode,
  } = usePlayerStore();

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePercent = Math.round((volume ?? 0) * 100);
  const displayVolumePercent = muted ? 0 : volumePercent;

  const handleVolumeChange = (value) => {
    const next = Math.round(Number(value));
    if (muted && next > 0) {
      toggleMute();
    }
    setVolume(next / 100);
  };
  if (!currentSong) {
    return (
      <div className="flex h-auto items-center border-t border-white/10 bg-gradient-to-r from-[#140c26] via-[#120b22] to-[#0b0914] px-4 py-4 sm:h-24 sm:px-6 sm:py-0 backdrop-blur">
        <span className="text-sm text-white/60">Chưa phát bài nào</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative border-t border-white/10 bg-gradient-to-r from-[#140c26] via-[#120b22] to-[#0b0914] px-4 py-4 sm:h-24 sm:px-6 sm:py-0 backdrop-blur">
        {/* glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(167,139,250,0.15),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.15),transparent_40%)]" />

        <div className="relative flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* LEFT */}
          <div className="flex w-full min-w-0 items-center gap-3 sm:w-1/3">
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
            <div className="flex items-center gap-4 text-lg sm:gap-5">
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
              <span className="w-10 text-right sm:w-12">
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

              <span className="w-10 sm:w-12">{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT */}
        <div className="flex w-full flex-wrap items-center justify-end gap-3 text-lg sm:w-1/3 sm:flex-nowrap sm:justify-end sm:gap-4">
            <div className="flex items-center gap-3">
              <button
                className="hidden p-2 text-white/70 transition hover:text-white sm:inline-flex"
                aria-label="Danh sách phát"
              >
                <HiOutlineQueueList />
              </button>

             <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // ✅ chặn event lọt sang backdrop
                  setShowDetail(true);
                }}
                onClick={(e) => e.stopPropagation()} // ✅ dự phòng
                className="p-2 text-white/70 transition hover:text-white"
                aria-label="Mở trang chi tiết"
                title="Trang chi tiết"
              >
                <HiOutlineArrowsPointingOut />
              </button>

              <button
                onClick={toggleRepeatMode}
                className={`relative hidden p-2 transition sm:inline-flex ${
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
                <RiRepeat2Fill />
                {repeatMode === "one" && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">
                    1
                  </span>
                )}
              </button>
            </div>

            <div className="hidden min-w-[120px] flex-1 items-center gap-2 sm:flex sm:min-w-[160px] sm:flex-none">
              <button
                onClick={toggleMute}
                className="text-xl text-white/70 transition hover:text-white"
                aria-label={muted ? "Bật âm lượng" : "Tắt âm lượng"}
              >
                {muted || volumePercent === 0 ? (
                  <HiOutlineSpeakerXMark />
                ) : (
                  <HiOutlineSpeakerWave />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={displayVolumePercent}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="player-slider flex-1"
                style={{
                  background: `linear-gradient(to right, #38bdf8 ${displayVolumePercent}%, rgba(255,255,255,0.2) ${displayVolumePercent}%)`,
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