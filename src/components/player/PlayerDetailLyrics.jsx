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
    lastLyricIndexRef.current = -1;

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
    let active = -1;

    for (let i = 0; i < lyricsState.items.length; i += 1) {
      const item = lyricsState.items[i];
      const start = Number(item?.start_time ?? item?.startTime ?? 0);

      if (ms >= start) active = i;
      else break;
    }

    return active;
  }, [displayedTime, lyricsState.items]);

  useEffect(() => {
    if (!isActive) return;
    if (lyricIndex < 0 || lastLyricIndexRef.current === lyricIndex) return;

    const container = lyricsContainerRef.current;
    const line = container?.querySelector(`[data-lyric-index="${lyricIndex}"]`);
    if (!line) return;

    line.scrollIntoView({ behavior: "smooth", block: "center" });
    lastLyricIndexRef.current = lyricIndex;
  }, [isActive, lyricIndex]);

  const handleLyricClick = (item) => {
    const startMs = Number(item?.start_time ?? item?.startTime ?? 0);
    if (!Number.isFinite(startMs)) return;
    onSeek?.(Math.max(0, startMs / 1000));
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {lyricsState.loading ? (
        <div className="text-sm text-white/56">Đang tải lời bài hát...</div>
      ) : null}

      {lyricsState.error ? (
        <div className="text-sm text-red-100/90">{lyricsState.error}</div>
      ) : null}

      {!lyricsState.loading &&
      !lyricsState.error &&
      lyricsState.items.length === 0 ? (
        <div className="text-sm text-white/48">Bài hát chưa có lời.</div>
      ) : null}

      {!lyricsState.loading &&
      !lyricsState.error &&
      lyricsState.items.length > 0 ? (
        <div
          ref={lyricsContainerRef}
          className="mt-1 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hidden"
        >
          {lyricsState.items.map((item, index) => {
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
