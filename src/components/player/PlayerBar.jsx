import { useEffect, useState } from "react";
import { FaBackwardStep, FaForwardStep, FaPause, FaPlay } from "react-icons/fa6";
import { FiColumns } from "react-icons/fi";
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
import PlayerEnhancementToolbar from "./PlayerEnhancementToolbar";
import { SongDetailLink } from "../song/SongDetailLink";

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
    dockPanelOpen,
    dockPanelTab,
    openDockPanel,
    closeDockPanel,
  } = usePlayerStore();

  useEnsureLikedSongsLoaded(Boolean(currentSong));

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      ensureLastPlayedLoaded();
    }
  }, [ensureLastPlayedLoaded, isAuthReady, isAuthenticated]);

  useEffect(() => {
    if (!showDetail) return;
    closeDockPanel();
  }, [closeDockPanel, showDetail]);

  useEffect(() => {
    if (!currentSong) return undefined;

    const isTypingTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      );
    };

    const handleKeyDown = (event) => {
      const state = usePlayerStore.getState();

      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        state.isPlaying ? state.pause() : state.resume();
        return;
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        state.seek(Math.max(0, state.currentTime - 5));
        return;
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        state.seek(Math.min(state.duration || state.currentTime + 5, state.currentTime + 5));
        return;
      }

      if (event.code === "KeyM") {
        event.preventDefault();
        state.toggleMute();
        return;
      }

      if (event.code === "KeyL") {
        event.preventDefault();
        state.openDockPanel("lyrics");
        return;
      }

      if (event.code === "KeyQ") {
        event.preventDefault();
        state.dockPanelOpen && state.dockPanelTab === "queue"
          ? state.closeDockPanel()
          : state.openDockPanel("queue");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSong]);

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
  const isLiked = likedSongIds.includes(normalizeSongId(currentSong));

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
            <SongDetailLink
              song={currentSong}
              className="block truncate text-sm font-medium text-white transition md:hover:text-emerald-300 md:hover:underline"
            >
              {currentSong.title}
            </SongDetailLink>
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
            className={`text-lg transition ${isLiked ? "text-[#1db954]" : "text-white/70"}`}
            aria-label="Yêu thích"
          >
            {isLiked ? <HiHeart /> : <HiOutlineHeart />}
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

        <div className="hidden h-24 items-center gap-4 px-4 lg:px-5 xl:px-6 sm:flex">
          <div className="flex min-w-0 w-[30%] items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/10">
              <OptimizedImage
                src={resolveAssetUrl(currentSong.cover_url)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <SongDetailLink
                song={currentSong}
                className="block truncate font-semibold text-white transition md:hover:text-emerald-300 md:hover:underline"
              >
                {currentSong.title}
              </SongDetailLink>
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
                isLiked ? "text-[#1db954]" : "text-white/60"
              }`}
              aria-label="Yêu thích"
            >
              {isLiked ? <HiHeart /> : <HiOutlineHeart />}
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
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

          <div className="flex min-w-0 w-[32%] items-center justify-end gap-2 lg:gap-3 xl:gap-3.5">
            <button
              onClick={() => setShowDetail(true)}
              className="text-white/70 md:hover:text-white"
              aria-label="Mở trình phát mở rộng"
              title="Mở trình phát mở rộng"
            >
              <HiOutlineQueueList />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={repeatMode !== "off" ? "text-[#1db954]" : "text-white/70"}
              aria-label="Chế độ lặp"
              title="Chế độ lặp"
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

            <div className="flex min-w-[108px] max-w-[148px] flex-1 items-center gap-2 xl:min-w-[124px] xl:max-w-[164px]">
              <button
                onClick={toggleMute}
                className="text-white/70 md:hover:text-white"
                aria-label={muted || volumePercent === 0 ? "Bật âm thanh" : "Tắt âm thanh"}
                title={muted || volumePercent === 0 ? "Bật âm thanh" : "Tắt âm thanh"}
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

            <PlayerEnhancementToolbar
              compact
              menuPlacement="top"
              wrap={false}
              compactLabelClass="hidden 2xl:inline"
              className="hidden shrink-0 xl:flex"
            />

            <button
              type="button"
              onClick={() =>
                dockPanelOpen ? closeDockPanel() : openDockPanel(dockPanelTab || "queue")
              }
              className={`hidden shrink-0 h-10 w-10 items-center justify-center rounded-xl border transition lg:flex ${
                dockPanelOpen
                  ? "border-[#1db954]/40 bg-[#1db954]/14 text-[#9ff0bc] shadow-[0_10px_24px_rgba(29,185,84,0.16)]"
                  : "border-white/10 bg-[#111111] text-white/70 md:hover:border-white/20 md:hover:bg-[#191919] md:hover:text-white"
              }`}
              aria-label={dockPanelOpen ? "Đóng bảng phát nhạc" : "Mở bảng phát nhạc"}
              title={dockPanelOpen ? "Đóng bảng phát nhạc" : "Mở bảng phát nhạc"}
            >
              <FiColumns size={17} />
            </button>
          </div>
        </div>
      </div>

      <PlayerDetail isOpen={showDetail} onClose={() => setShowDetail(false)} />
    </>
  );
}
