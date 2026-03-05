import { memo, useMemo } from "react";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";
import ArtistNames from "../artist/ArtistNames";

function PlayerDetailQueue({ queue, currentIndex, playAt }) {
  const played = useMemo(() => {
    const list = queue || [];
    if (currentIndex <= 0) return [];
    return list.slice(Math.max(0, currentIndex - 3), currentIndex);
  }, [queue, currentIndex]);

  const upcoming = useMemo(() => {
    const list = queue || [];
    const next = list.slice(currentIndex + 1, currentIndex + 10);
    if (next.length) return next;
    return list.filter((_, i) => i !== currentIndex).slice(0, 3);
  }, [queue, currentIndex]);

  const Item = ({ song, idx, label, isPlayed }) => {
    const sCover = resolveAssetUrl(song.cover || song.cover_url || song.image);
    const realIndex = queue.findIndex((q) => q === song);
    const isCurrent = realIndex === currentIndex;
    return (
      <button
        key={song.id || idx}
        type="button"
        onClick={() => playAt(realIndex)}
        className={`
          group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition
          backdrop-blur-md
           ${
            isCurrent
              ? "border-emerald-300/55 bg-emerald-400/12 shadow-[0_14px_28px_rgba(20,120,72,0.26)]"
              : "border-white/10 bg-white/[0.03] md:hover:border-white/20 md:hover:bg-white/[0.07]"
          }
          ${isPlayed ? "opacity-55" : ""}
        `}
      >
        <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10 ring-1 ring-black/30 shadow-[0_10px_22px_rgba(0,0,0,0.25)]">
          {sCover && (
            <OptimizedImage
              src={sCover}
              alt={song.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-white/90 sm:text-sm line-clamp-2">
              {song.title}
            </div>
            {label ? (
              <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/72">
                {label}
              </span>
            ) : null}
             {isCurrent ? (
              <span className="shrink-0 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                Đang phát
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-[11px] text-white/62 sm:text-xs line-clamp-2">
            <ArtistNames
              item={song}
              stopPropagation
              fallback="Nghệ sĩ"
              linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="mt-4 flex-1 min-h-0 space-y-6 overflow-y-auto pr-1 scrollbar-hidden">
      {played.length ? (
        <div className="space-y-2.5">
          {played.map((song, idx) => (
            <Item key={song.id || idx} song={song} idx={idx} isPlayed />
          ))}
        </div>
) : null}

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/56">
          Tiếp theo
        </div>

        {upcoming.length ? (
          <div className="space-y-2.5">
            {upcoming.map((song, idx) => (
              <Item key={song.id || idx} song={song} idx={idx} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">Chưa có bài tiếp theo</p>
        )}
      </div>
    </div>
  );
}
export default memo(PlayerDetailQueue);


