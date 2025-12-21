import usePlayerStore from "../../store/player.store";

export default function SongCard({ song, queue }) {
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const isActive = currentSong?.id === song.id;
  const isLiked = likedSongIds.includes(song.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isActive) {
      isPlaying ? pause() : resume();
    } else {
      playSong(song, queue);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(song.id);
  };

  return (
    <div
      onClick={() => playSong(song, queue)}
      className={`p-3 rounded cursor-pointer transition
        ${isActive ? "bg-white/10" : "hover:bg-white/5"}
      `}
    >
      <div className="flex items-center gap-3">
        {/* COVER */}
        <div className="relative" onClick={handlePlay}>
          <img
            src={song.cover_url}
            className="w-12 h-12 rounded object-cover"
          />

          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
              <span className="text-lg">
                {isPlaying ? "⏸" : "▶"}
              </span>
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="flex-1">
          <div
            className={`text-sm font-medium ${
              isActive ? "text-green-400" : ""
            }`}
          >
            {song.title}
          </div>
          <div className="text-xs text-white/60">
            {song.artist_name}
          </div>
        </div>

        {/* ♥ LIKE */}
        <button
          onClick={handleLike}
          className={`text-lg transition ${
            isLiked ? "text-red-500" : "text-white/40"
          }`}
        >
          ♥
        </button>
      </div>
    </div>
  );
}
