import {
  FaBackwardStep,
  FaForwardStep,
  FaPause,
  FaPlay,
} from "react-icons/fa6";
import { HiOutlineQueueList, HiOutlineSpeakerWave } from "react-icons/hi2";
import { RiRepeat2Fill } from "react-icons/ri";
import usePlayerStore from "../../store/player.store";

const formatTime = (t = 0) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    playNext,
    playPrev,
    seek,
    setVolume,
  } = usePlayerStore();

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePercent = Math.round((volume ?? 0) * 100);

  if (!currentSong) {
    return (
      <div className="h-24 bg-[#0e0818] border-t border-white/10 flex items-center px-6">
        <span className="text-sm text-white/60">Chưa phát bài nào</span>
      </div>
    );
  }

  return (
    <div className="h-24 bg-[#0e0818] border-t border-white/10 flex items-center px-6 gap-6">
      {/* Left: artwork & info */}
      <div className="w-1/3 flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
          {currentSong?.cover_url ? (
            <img
              src={currentSong.cover_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/60 to-white/30" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {currentSong.title}
          </div>
          <div className="text-xs text-white/60 truncate">
            {currentSong.artist_name}
          </div>
        </div>
      </div>

      {/* Middle: controls */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 text-lg">
          <button
            onClick={playPrev}
            className="p-2 hover:text-white/80 transition"
            aria-label="Bài trước"
          >
            <FaBackwardStep />
          </button>

          <button
            onClick={isPlaying ? pause : resume}
            className="w-11 h-11 rounded-full border border-white/40 flex items-center justify-center text-base bg-white/10 hover:bg-white/15 transition"
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>

          <button
            onClick={playNext}
            className="p-2 hover:text-white/80 transition"
            aria-label="Bài tiếp"
          >
            <FaForwardStep />
          </button>
        </div>

        <div className="w-full flex items-center gap-3 text-[11px] text-white/60">
          <span className="w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="player-slider flex-1"
            style={{
              background: `linear-gradient(to right, #d9b4ff ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
            }}
            aria-label="Thanh tiến trình"
          />
          <span className="w-12">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="w-1/3 flex items-center justify-end gap-4 text-lg">
        <button className="p-2 hover:text-white/80 transition" aria-label="Danh sách phát">
          <HiOutlineQueueList />
        </button>
        <button className="p-2 hover:text-white/80 transition" aria-label="Lặp lại">
          <RiRepeat2Fill />
        </button>
        <div className="flex items-center gap-2 min-w-[160px]">
          <HiOutlineSpeakerWave className="text-xl" aria-hidden />
          <input
            type="range"
            min={0}
            max={100}
            value={volumePercent}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="player-slider flex-1"
            style={{
              background: `linear-gradient(to right, #d9b4ff ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`,
            }}
            aria-label="Âm lượng"
          />
        </div>
      </div>
    </div>
  );
}