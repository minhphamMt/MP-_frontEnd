import { memo, useEffect, useRef, useState } from "react";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";

const EMPTY_LYRICS = [];
const resolveLyricIndex = (lyricItems, displayedTimeMs) => {
  if (!lyricItems.length) return -1;

  let active = -1;

  for (let index = 0; index < lyricItems.length; index += 1) {
    const item = lyricItems[index];
    const start = Number(item?.start_time ?? item?.startTime ?? 0);

    if (displayedTimeMs >= start) active = index;
    else break;
  }

  return active;
};

function PlayerDetailLyrics({ currentSong, isActive, onSeek }) {
  const lyricsContainerRef = useRef(null);
  const lastLyricIndexRef = useRef(-1);
  const [lyricIndex, setLyricIndex] = useState(-1);
  const songId = normalizeSongId(currentSong);
  const ensureLyricsLoaded = usePlayerStore((state) => state.ensureLyricsLoaded);
  const lyricItems = usePlayerStore((state) =>
    songId ? state.lyricsBySongId[songId] ?? EMPTY_LYRICS : EMPTY_LYRICS
  );
  const lyricsLoading = usePlayerStore((state) =>
    songId ? Boolean(state.lyricsLoadingBySongId[songId]) : false
  );
  const lyricsError = usePlayerStore((state) =>
    songId ? state.lyricsErrorBySongId[songId] ?? null : null
  );

  useEffect(() => {
    lastLyricIndexRef.current = -1;
    setLyricIndex(-1);
  }, [songId]);

  useEffect(() => {
    if (!songId) return;
    ensureLyricsLoaded(songId);
  }, [ensureLyricsLoaded, songId]);

  useEffect(() => {
    const audio = usePlayerStore.getState().audio;
    if (!audio) return undefined;

    const syncLyricIndex = () => {
      const nextIndex = resolveLyricIndex(
        lyricItems,
        Math.floor((audio.currentTime || 0) * 1000)
      );
      setLyricIndex((previous) => (previous === nextIndex ? previous : nextIndex));
    };

    syncLyricIndex();
    audio.addEventListener("timeupdate", syncLyricIndex);
    audio.addEventListener("seeked", syncLyricIndex);
    audio.addEventListener("loadedmetadata", syncLyricIndex);

    return () => {
      audio.removeEventListener("timeupdate", syncLyricIndex);
      audio.removeEventListener("seeked", syncLyricIndex);
      audio.removeEventListener("loadedmetadata", syncLyricIndex);
    };
  }, [lyricItems, songId]);

  useEffect(() => {
    if (!isActive) return;
    if (lyricIndex < 0 || lastLyricIndexRef.current === lyricIndex) return;

    const container = lyricsContainerRef.current;
    const line = container?.querySelector(`[data-lyric-index="${lyricIndex}"]`);
    if (!line) return;

    line.scrollIntoView({
      behavior: lastLyricIndexRef.current < 0 ? "auto" : "smooth",
      block: "center",
    });
    lastLyricIndexRef.current = lyricIndex;
  }, [isActive, lyricIndex]);

  const handleLyricClick = (item) => {
    const startMs = Number(item?.start_time ?? item?.startTime ?? 0);
    if (!Number.isFinite(startMs)) return;
    onSeek?.(Math.max(0, startMs / 1000));
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {lyricsLoading ? (
        <div className="text-sm text-white/56">
          {"\u0110ang t\u1ea3i l\u1eddi b\u00e0i h\u00e1t..."}
        </div>
      ) : null}

      {lyricsError ? (
        <div className="text-sm text-red-100/90">{lyricsError}</div>
      ) : null}

      {!lyricsLoading && !lyricsError && lyricItems.length === 0 ? (
        <div className="text-sm text-white/48">
          {"B\u00e0i h\u00e1t ch\u01b0a c\u00f3 l\u1eddi."}
        </div>
      ) : null}

      {!lyricsLoading && !lyricsError && lyricItems.length > 0 ? (
        <div
          ref={lyricsContainerRef}
          data-mobile-sheet-scroll="true"
          className="mt-1 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hidden"
        >
          {lyricItems.map((item, index) => {
            const isLineActive = index === lyricIndex;

            return (
              <button
                key={item.id || `${index}-${item.text}`}
                type="button"
                data-lyric-index={index}
                onClick={() => handleLyricClick(item)}
                className={`relative block w-full px-1 py-1.5 text-left transition ${
                  isLineActive
                    ? "translate-x-2 text-white"
                    : "text-white/40 md:hover:text-white/60"
                }`}
              >
                {isLineActive ? (
                  <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-white/85" />
                ) : null}
                <span
                  className={`block leading-[1.75] transition ${
                    isLineActive
                      ? "text-[1.04rem] font-semibold sm:text-[1.1rem]"
                      : "text-[0.95rem] sm:text-[1rem]"
                  }`}
                  style={
                    isLineActive
                      ? {
                          color: "rgba(255,255,255,0.98)",
                          textShadow: "0 0 28px rgba(255,255,255,0.14)",
                        }
                      : undefined
                  }
                >
                  {item.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default memo(PlayerDetailLyrics);
