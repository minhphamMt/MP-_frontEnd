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
        <p className="rounded-xl border-[0.5px] border-slate-500/34 bg-white/[0.04] px-3 py-2 text-sm text-white/65">Đang tải lời bài hát...</p>
      )}
      {lyricsState.error && (
        <p className="rounded-xl border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">{lyricsState.error}</p>
      )}
      {!lyricsState.loading &&
        !lyricsState.error &&
        lyricsState.items.length === 0 && (
          <p className="rounded-xl border-[0.5px] border-slate-500/34 bg-white/[0.04] px-3 py-2 text-sm text-white/55">Bài hát chưa có lời.</p>
        )}

      {!lyricsState.loading &&
        !lyricsState.error &&
        lyricsState.items.length > 0 && (
          <div
            ref={lyricsContainerRef}
            className="
              mt-3 flex-1 space-y-1.5 overflow-y-auto pr-2
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
                    group block w-full rounded-xl border px-3 py-2 text-left transition
                    ${
                      isLineActive
                        ? "border-slate-400/42 bg-white/[0.14] text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                        : "border-transparent text-white/62 md:hover:border-slate-500/34 md:hover:bg-white/[0.05] md:hover:text-white/86"
                    }
                  `}
                >
                  <span
                    className={`
                      block transition
                      ${
                        isLineActive
                          ? "text-[15px] sm:text-[1.05rem] font-semibold"
                          : "text-[13px] sm:text-[15px]"
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


