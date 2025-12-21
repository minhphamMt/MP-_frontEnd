import usePlayerStore from "../../store/player.store";

const formatTime = (t = 0) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    pause,
    resume,
    playNext,
    playPrev,
    seek,
  } = usePlayerStore();

  if (!currentSong) {
    return (
      <div className="h-20 bg-[#120c1c] border-t border-white/10 flex items-center px-6">
        <span className="text-sm text-white/60">
          Chưa phát bài nào
        </span>
      </div>
    );
  }

  return (
    <div className="h-20 bg-[#120c1c] border-t border-white/10 flex items-center px-6">
      <div className="w-1/4">
        <div className="text-sm font-semibold">
          {currentSong.title}
        </div>
        <div className="text-xs text-white/60">
          {currentSong.artist_name}
        </div>
      </div>

      <div className="w-1/2 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={playPrev}>⏮</button>
          <button
            className="text-xl"
            onClick={isPlaying ? pause : resume}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={playNext}>⏭</button>
        </div>

        <div className="w-full flex items-center gap-2 text-xs">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
