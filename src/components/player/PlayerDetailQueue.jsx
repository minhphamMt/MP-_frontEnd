import { memo, useMemo } from "react";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";
import ArtistNames from "../artist/ArtistNames";

function PlayerDetailQueue({ queue = [], currentIndex = 0, playAt }) {
  const activeIndex = useMemo(() => {
    if (!Array.isArray(queue) || !queue.length) return 0;
    return Math.min(Math.max(currentIndex, 0), queue.length - 1);
  }, [queue, currentIndex]);

  const currentItem = useMemo(() => {
    if (!Array.isArray(queue) || !queue.length) return null;
    return queue[activeIndex] ?? queue[0] ?? null;
  }, [queue, activeIndex]);

  const played = useMemo(() => {
    if (!Array.isArray(queue) || activeIndex <= 0) return [];
    return queue
      .slice(Math.max(0, activeIndex - 3), activeIndex)
      .map((song, index) => ({
        song,
        index: Math.max(0, activeIndex - 3) + index,
      }));
  }, [queue, activeIndex]);

  const upcoming = useMemo(() => {
    if (!Array.isArray(queue) || !queue.length) return [];

    const next = queue
      .slice(activeIndex + 1, activeIndex + 10)
      .map((song, index) => ({
        song,
        index: activeIndex + 1 + index,
      }));

    if (next.length) return next;

    return queue
      .map((song, index) => ({ song, index }))
      .filter((item) => item.index !== activeIndex)
      .slice(0, 3);
  }, [queue, activeIndex]);

  const Item = ({ song, index, label, isCurrent = false, isPlayed = false }) => {
    const cover = resolveAssetUrl(song?.cover || song?.cover_url || song?.image);

    return (
      <button
        type="button"
        onClick={() => playAt?.(index)}
        className={`group flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition ${
          isCurrent
            ? "bg-white/[0.1] text-white"
            : "bg-white/[0.045] text-white/90 md:hover:bg-white/[0.08]"
        } ${isPlayed ? "opacity-55" : ""}`}
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-black/28">
          {cover ? (
            <OptimizedImage
              src={cover}
              alt={song?.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2b2b2b,#111)] text-[10px] uppercase tracking-[0.2em] text-white/35">
              No
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 text-sm font-semibold leading-tight line-clamp-2">
              {song?.title}
            </div>
            {label ? (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isCurrent
                    ? "bg-white/[0.12] text-white"
                    : "bg-white/[0.06] text-white/58"
                }`}
              >
                {label}
              </span>
            ) : null}
          </div>

          <div className="mt-1 text-[11px] text-white/56 line-clamp-2 sm:text-xs">
            <ArtistNames
              item={song}
              stopPropagation
              fallback="Nghệ sĩ"
              linkClassName="inline-block transition md:hover:text-emerald-200"
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {currentItem ? (
        <div className="shrink-0">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/38">
            Đang phát
          </div>
          <Item song={currentItem} index={activeIndex} label="Now" isCurrent />
        </div>
      ) : null}

      <div
        data-mobile-sheet-scroll="true"
        className="mt-5 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 scrollbar-hidden"
      >
        {played.length ? (
          <div className="space-y-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/34">
              Vừa phát
            </div>
            {played.map((item) => (
              <Item
                key={`${item.index}-${item.song?.id || item.song?.title || "played"}`}
                song={item.song}
                index={item.index}
                isPlayed
              />
            ))}
          </div>
        ) : null}

        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/38">
            Tiếp theo
          </div>
          {upcoming.length ? (
            upcoming.map((item) => (
              <Item
                key={`${item.index}-${item.song?.id || item.song?.title || "next"}`}
                song={item.song}
                index={item.index}
              />
            ))
          ) : (
            <div className="px-1 text-sm text-white/48">Chưa có bài tiếp theo.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(PlayerDetailQueue);
