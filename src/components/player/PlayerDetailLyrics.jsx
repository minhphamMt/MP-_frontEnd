import { useEffect, useMemo, useRef, useState } from "react";
import { getSongLyrics } from "../../api/song.api";
import { normalizeSongId } from "../../store/player.store";

export default function PlayerDetailLyrics({
  currentSong,
  displayedTime,
  isActive,
  onSeek,
}) {
  const [lyricsState, setLyricsState] = useState({
    items: [],
    loading: false,
    error: null,
  });
  const lyricsContainerRef = useRef(null);
  const lastLyricIndexRef = useRef(-1);

  useEffect(() => {
    const songId = normalizeSongId(currentSong);
    if (!songId) {
      setLyricsState({ items: [], loading: false, error: null });
      return;
    }

    setLyricsState((prev) => ({ ...prev, loading: true, error: null }));
    getSongLyrics(songId)
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? {};
        const items = payload?.items ?? payload ?? [];
        setLyricsState({
          items: Array.isArray(items) ? items : [],
          loading: false,
          error: null,
        });
      })
      .catch(() => {
        setLyricsState({
          items: [],
          loading: false,
          error: "Không thể tải lời bài hát",
        });
      });
  }, [currentSong]);

  const lyricIndex = useMemo(() => {
    if (!lyricsState.items.length) return -1;
    const ms = Math.floor(displayedTime * 1000);
    for (let i = 0; i < lyricsState.items.length; i += 1) {
      const item = lyricsState.items[i];
      const start = Number(item?.start_time ?? item?.startTime ?? 0);
      const end = Number(item?.end_time ?? item?.endTime ?? 0);
      const nextItem = lyricsState.items[i + 1];
      const nextStart = Number(
        nextItem?.start_time ?? nextItem?.startTime ?? Number.POSITIVE_INFINITY
      );

      if (ms >= start && (end ? ms <= end : ms < nextStart)) {
        return i;
      }
    }
    return -1;
  }, [displayedTime, lyricsState.items]);

  useEffect(() => {
    if (!isActive) return;
    if (lyricIndex < 0 || lastLyricIndexRef.current === lyricIndex) return;
    const container = lyricsContainerRef.current;
    const line = container?.querySelector(
      `[data-lyric-index="${lyricIndex}"]`
    );
    if (line) {
      line.scrollIntoView({ behavior: "smooth", block: "center" });
      lastLyricIndexRef.current = lyricIndex;
    }
  }, [lyricIndex, isActive]);

  const handleLyricClick = (item) => {
    const startMs = Number(item?.start_time ?? item?.startTime ?? 0);
    if (!Number.isFinite(startMs)) return;
    onSeek?.(Math.max(0, startMs / 1000));
  };

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
      {lyricsState.loading && (
        <p className="text-sm text-white/60">Đang tải lời bài hát...</p>
      )}
      {lyricsState.error && (
        <p className="text-sm text-red-300">{lyricsState.error}</p>
      )}
      {!lyricsState.loading &&
        !lyricsState.error &&
        lyricsState.items.length === 0 && (
          <p className="text-sm text-white/50">Bài hát chưa có lời.</p>
        )}

      {!lyricsState.loading &&
        !lyricsState.error &&
        lyricsState.items.length > 0 && (
          <div
            ref={lyricsContainerRef}
            className="
              mt-3 flex-1 space-y-2 overflow-y-auto pr-2
              text-sm sm:text-base
              leading-relaxed
              scrollbar-hidden
            "
          >
            {lyricsState.items.map((item, index) => {
              const isLineActive = index === lyricIndex;

              return (
                <button
                  key={item.id || index}
                  type="button"
                  data-lyric-index={index}
                  onClick={() => handleLyricClick(item)}
                  className={`
                    group block w-full rounded-2xl px-3 py-2 text-left transition
                    ${
                      isLineActive
                        ? "bg-white/15 text-white ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white/85"
                    }
                  `}
                >
                  <span
                    className={`
                      block transition
                      ${
                        isLineActive
                          ? "text-base sm:text-lg font-semibold"
                          : "text-sm sm:text-base"
                      }
                    `}
                  >
                    {item.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
}
