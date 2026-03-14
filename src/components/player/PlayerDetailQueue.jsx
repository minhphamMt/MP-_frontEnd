import { memo, useCallback, useMemo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { resolveAssetUrl } from "../../utils/asset";
import usePlayerStore from "../../store/player.store";
import OptimizedImage from "../common/OptimizedImage";
import ArtistNames from "../artist/ArtistNames";
import { SongDetailLink } from "../song/SongDetailLink";
import usePointerReorder from "../../hooks/usePointerReorder";

function GripDots() {
  return (
    <div
      aria-hidden
      className="grid h-8 w-4 shrink-0 grid-cols-2 gap-1 text-white/22 transition group-hover:text-white/40"
    >
      <span className="rounded-full bg-current" />
      <span className="rounded-full bg-current" />
      <span className="rounded-full bg-current" />
      <span className="rounded-full bg-current" />
    </div>
  );
}

function PlayerDetailQueue({ queue = [], currentIndex = 0, playAt, onNavigate }) {
  const moveQueueItem = usePlayerStore((state) => state.moveQueueItem);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const handleReorder = useCallback(
    (fromIndex, toIndex) => moveQueueItem(fromIndex, toIndex),
    [moveQueueItem]
  );
  const { draggingIndex, dropTarget, startDrag, shouldSuppressClick } = usePointerReorder({
    itemCount: queue.length,
    onReorder: handleReorder,
  });

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
    const isDragging = draggingIndex === index;
    const dropPosition =
      dropTarget?.index === index && draggingIndex !== null ? dropTarget.position : null;

    const handleSelect = () => {
      if (shouldSuppressClick()) return;
      playAt?.(index);
    };

    return (
      <div className="relative">
        {dropPosition === "before" ? (
          <div className="absolute inset-x-4 top-0 z-10 h-[2px] rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.42)]" />
        ) : null}

        {dropPosition === "after" ? (
          <div className="absolute inset-x-4 bottom-0 z-10 h-[2px] rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.42)]" />
        ) : null}

        <div
          role="button"
          tabIndex={0}
          data-reorder-item="true"
          data-reorder-index={index}
          onClick={handleSelect}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleSelect();
            }
          }}
          className={`group flex w-full cursor-grab items-center gap-3 rounded-[18px] px-3 py-3 text-left transition active:cursor-grabbing ${
            isCurrent
              ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] text-white"
              : "bg-white/[0.045] text-white/90 md:hover:bg-white/[0.08]"
          } ${isPlayed ? "opacity-55" : ""} ${
            isDragging
              ? "scale-[0.975] -rotate-[1deg] opacity-65 ring-1 ring-emerald-300/28 shadow-[0_22px_36px_rgba(16,185,129,0.14)]"
              : ""
          }`}
        >
          <button
            type="button"
            onPointerDown={(event) => startDrag(event, index)}
            onClick={(event) => event.stopPropagation()}
            className={`flex h-9 w-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-full text-white/40 transition active:cursor-grabbing md:hover:bg-white/[0.05] md:hover:text-white/68 ${
              isDragging ? "bg-emerald-400/10 text-emerald-100" : ""
            }`}
            aria-label="Kéo để đổi vị trí phát"
          >
            <GripDots />
          </button>

          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-black/28 [transform:translateZ(0)] [backface-visibility:hidden]">
            {cover ? (
              <OptimizedImage
                src={cover}
                alt={song?.title}
                loading="eager"
                decoding="sync"
                className="h-full w-full object-cover [transform:translateZ(0)] [backface-visibility:hidden]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2b2b2b,#111)] text-[10px] uppercase tracking-[0.2em] text-white/35">
                No
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <SongDetailLink
                song={song}
                className="min-w-0 flex-1 text-sm font-semibold leading-tight line-clamp-2 transition md:hover:text-emerald-300 md:hover:underline"
                onNavigate={onNavigate}
              >
                {song?.title}
              </SongDetailLink>
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
                onNavigate={onNavigate}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              removeFromQueue(index);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-white/58 ring-1 ring-inset ring-white/10 transition md:opacity-0 md:group-hover:opacity-100 md:hover:bg-rose-500/10 md:hover:text-rose-200 md:hover:ring-rose-400/30"
            aria-label="Gỡ bài khỏi hàng đợi"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/38">
            {queue.length ? `${queue.length} bài trong hàng đợi` : "Hàng đợi"}
          </div>
          {queue.length > 1 ? (
            <div className="mt-1 text-[11px] text-white/42">
              Kéo thả để đổi thứ tự phát tiếp theo.
            </div>
          ) : null}
        </div>
        {queue.length ? (
          <button
            type="button"
            onClick={clearQueue}
            className="rounded-full bg-[#111314] px-3 py-1.5 text-[11px] font-semibold text-white/72 ring-1 ring-inset ring-[#242829] transition md:hover:bg-[#171a1c] md:hover:text-white md:hover:ring-[#2d3233]"
          >
            Xóa hàng đợi
          </button>
        ) : null}
      </div>

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
