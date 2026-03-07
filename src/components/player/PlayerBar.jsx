import { useEffect, useState } from "react";
import { FaBackwardStep, FaForwardStep, FaPause, FaPlay } from "react-icons/fa6";
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlineQueueList,
  HiOutlineSpeakerWave,
  HiOutlineSpeakerXMark,
} from "react-icons/hi2";
import { RiRepeat2Fill } from "react-icons/ri";
import ArtistNames from "../artist/ArtistNames";
import OptimizedImage from "../common/OptimizedImage";
import { useEnsureLikedSongsLoaded } from "../../hooks/useEnsureLibraryState";
import useAuthStore from "../../store/auth.store";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import PlayerDetail from "./PlayerDetail";

const formatTime = (t = 0) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export default function PlayerBar() {
  const [showDetail, setShowDetail] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

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
    likedSongIds,
    toggleLike,
    lastPlayedLoading,
    ensureLastPlayedLoaded,
  } = usePlayerStore();

  useEnsureLikedSongsLoaded(Boolean(currentSong));

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      ensureLastPlayedLoaded();
    }
  }, [ensureLastPlayedLoaded, isAuthReady, isAuthenticated]);

  if (!currentSong) {
    const isInitializingPlayer = !isAuthReady || (isAuthenticated && lastPlayedLoading);

    return (
      <div className="border-t border-white/10 bg-[#000000] px-4 py-3">
        <span className="text-sm text-white/60">
          {isInitializingPlayer ? "Đang tải bài nghe gần đây..." : "Chưa phát bài nào"}
        </span>
      </div>
    );
  }

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePercent = Math.round((volume ?? 0) * 100);
  const displayVolumePercent = muted ? 0 : volumePercent;
  const volumeGradient = `linear-gradient(to right, #1db954 ${displayVolumePercent}%, rgba(255,255,255,0.2) ${displayVolumePercent}%)`;

  const handleVolumeChange = (value) => {
    const next = Math.round(Number(value));
    if (muted && next > 0) toggleMute();
    setVolume(next / 100);
  };

  return (
    <>
      <div className="relative border-t border-white/10 bg-[#000000] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div
          className={`relative flex items-center gap-3 px-3 py-2.5 sm:hidden ${
            showDetail ? "hidden" : ""
          }`}
          onClick={() => setShowDetail(true)}
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white/10">
            <OptimizedImage
              src={resolveAssetUrl(currentSong.cover_url)}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{currentSong.title}</div>
            <div className="truncate text-xs text-white/60">
              <ArtistNames
                item={currentSong}
                stopPropagation
                linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
              />
            </div>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              const songId = normalizeSongId(currentSong);
              if (songId) toggleLike(songId);
            }}
            className={`text-lg transition ${
              likedSongIds.includes(normalizeSongId(currentSong))
                ? "text-[#1db954]"
                : "text-white/70"
            }`}
            aria-label="Yêu thích"
          >
            {likedSongIds.includes(normalizeSongId(currentSong)) ? <HiHeart /> : <HiOutlineHeart />}
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              isPlaying ? pause() : resume();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40"
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              playNext();
            }}
            className="text-white/70"
            aria-label="Bài tiếp theo"
          >
            <FaForwardStep />
          </button>

          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10">
            <div
              className="h-full transition-all"
              style={{
                width: `${progress}%`,
                background: "#1db954",
              }}
            />
          </div>
        </div>

        <div className="hidden h-24 items-center px-6 sm:flex">
          <div className="flex min-w-0 w-1/3 items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/10">
              <OptimizedImage
                src={resolveAssetUrl(currentSong.cover_url)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{currentSong.title}</div>
              <div className="truncate text-sm text-white/60">
                <ArtistNames
                  item={currentSong}
                  linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const songId = normalizeSongId(currentSong);
                if (songId) toggleLike(songId);
              }}
              className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm transition md:hover:border-white/20 ${
                likedSongIds.includes(normalizeSongId(currentSong))
                  ? "text-[#1db954]"
                  : "text-white/60"
              }`}
              aria-label="Yêu thích"
            >
              {likedSongIds.includes(normalizeSongId(currentSong)) ? (
                <HiHeart />
              ) : (
                <HiOutlineHeart />
              )}
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-5 text-lg">
              <button onClick={playPrev} className="text-white/70 md:hover:text-white">
                <FaBackwardStep />
              </button>

              <button
                onClick={isPlaying ? pause : resume}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
              </button>

              <button onClick={playNext} className="text-white/70 md:hover:text-white">
                <FaForwardStep />
              </button>
            </div>

            <div className="flex w-full items-center gap-3 text-xs text-white/60">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(event) => seek(Number(event.target.value))}
                className="player-slider flex-1"
                style={{
                  background: `linear-gradient(to right, #1db954 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                }}
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex w-1/3 items-center justify-end gap-4">
            <button
              onClick={() => setShowDetail(true)}
              className="text-white/70 md:hover:text-white"
              aria-label="Mở hàng chờ"
            >
              <HiOutlineQueueList />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={repeatMode !== "off" ? "text-[#1db954]" : "text-white/70"}
              aria-label="Chế độ lặp"
            >
              <span className="relative inline-flex">
                <RiRepeat2Fill />
                {repeatMode === "one" && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black">
                    1
                  </span>
                )}
              </span>
            </button>

            <div className="flex min-w-[140px] items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white/70 md:hover:text-white"
                aria-label={muted || volumePercent === 0 ? "Bật âm thanh" : "Tắt âm thanh"}
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
                onChange={(event) => handleVolumeChange(event.target.value)}
                className="player-slider flex-1"
                style={{ background: volumeGradient }}
              />
            </div>
          </div>
        </div>
      </div>

      <PlayerDetail isOpen={showDetail} onClose={() => setShowDetail(false)} />
    </>
  );
}
