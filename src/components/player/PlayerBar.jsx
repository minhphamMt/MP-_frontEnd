import {
  FaBackwardStep,
  FaPause,
  FaPlay,
  FaForwardStep,
} from "react-icons/fa6";
import {
  HiOutlineQueueList,
  HiOutlineSpeakerWave,
  HiOutlineSpeakerXMark,
  HiOutlineHeart,
  HiHeart,
} from "react-icons/hi2";
import { RiRepeat2Fill } from "react-icons/ri";
import { useState } from "react";
import { Link } from "react-router-dom";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import PlayerDetail from "./PlayerDetail";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

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
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  if (!currentSong) {
    return (
       <div className="border-t border-white/10 bg-[#000000] px-4 py-3">
        <span className="text-sm text-white/60">Chưa phát bài nào</span>
      </div>
    );
  }

  const progress = duration
    ? Math.min(100, (currentTime / duration) * 100)
    : 0;

  const volumePercent = Math.round((volume ?? 0) * 100);
  const displayVolumePercent = muted ? 0 : volumePercent;
  const volumeGradient = `linear-gradient(to right, #1db954 ${displayVolumePercent}%, rgba(255,255,255,0.2) ${displayVolumePercent}%)`;
  const artistId =
    currentSong?.artist_id ??
    currentSong?.artist?.id ??
    currentSong?.artistId;
  const artistLabel =
    currentSong?.artist_name || currentSong?.artist?.name || "";

  const handleVolumeChange = (value) => {
    const next = Math.round(Number(value));
    if (muted && next > 0) toggleMute();
    setVolume(next / 100);
  };

  return (
    <>
      <div className="relative border-t border-white/10 bg-[#000000] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">

        {/* ================= MOBILE MINI PLAYER ================= */}
        <div
           className={`relative flex items-center gap-3 px-3 py-2.5 sm:hidden ${
            showDetail ? "hidden" : ""
          }`}
          onClick={() => setShowDetail(true)} // 👈 tap toàn bar để mở detail
        >
          {/* Cover */}
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white/10">
            <OptimizedImage
              src={resolveAssetUrl(currentSong.cover_url)}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title + Artist */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">
              {currentSong.title}
            </div>
            <div className="truncate text-xs text-white/60">
              {artistId ? (
                <Link
                  to={`/artist/${artistId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                >
                  {artistLabel}
                </Link>
              ) : (
                artistLabel
              )}
            </div>
          </div>

          {/* ❤️ Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
             const songId = normalizeSongId(currentSong);
              if (songId) toggleLike(songId);
            }}
            className={`text-lg transition ${
              likedSongIds.includes(normalizeSongId(currentSong))
                ? "text-[#1db954]"
                : "text-white/70"
            }`}
          >
            {likedSongIds.includes(normalizeSongId(currentSong)) ? (
              <HiHeart />
            ) : (
              <HiOutlineHeart />
            )}
          </button>

          {/* Play / Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              isPlaying ? pause() : resume();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40"
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="text-white/70"
          >
            <FaForwardStep />
          </button>

          {/* Progress bar (BOTTOM) */}
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

        {/* ================= DESKTOP FULL PLAYER ================= */}
        <div className="hidden sm:flex h-24 items-center px-6">
          {/* LEFT */}
          <div className="flex w-1/3 items-center gap-3 min-w-0">
            <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/10">
              <OptimizedImage
                src={resolveAssetUrl(currentSong.cover_url)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">
                {currentSong.title}
              </div>
              <div className="truncate text-sm text-white/60">
                {artistId ? (
                  <Link
                    to={`/artist/${artistId}`}
                    className="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                  >
                    {artistLabel}
                  </Link>
                ) : (
                  artistLabel
                )}
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

          {/* CENTER */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-5 text-lg">
              <button
                onClick={playPrev}
                className="text-white/70 md:hover:text-white"
              >
                <FaBackwardStep />
              </button>

              <button
                onClick={isPlaying ? pause : resume}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40"
              >
                {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="text-white/70 md:hover:text-white"
              >
                <FaForwardStep />
              </button>
            </div>

            <div className="flex w-full items-center gap-3 text-xs text-white/60">
              <span className="w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="player-slider flex-1"
                style={{
                  background: `linear-gradient(to right, #1db954 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                }}
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex w-1/3 items-center justify-end gap-4">

            <button
              onClick={() => setShowDetail(true)}
              className="text-white/70 md:hover:text-white"
            >
              <HiOutlineQueueList />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={
                repeatMode !== "off"
                  ? "text-[#1db954]"
                  : "text-white/70"
              }
            >
              <span className="relative inline-flex">
                <RiRepeat2Fill />
                {repeatMode === "one" && (
                 <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black">
                    1
                  </span>
                )}
              </span>
            </button>

            <div className="flex items-center gap-2 min-w-[140px]">
              <button
                onClick={toggleMute}
                className="text-white/70 md:hover:text-white"
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
                  background: volumeGradient,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <PlayerDetail
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}
