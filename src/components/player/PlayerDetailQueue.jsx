import { useMemo } from "react";
import { resolveAssetUrl } from "../../utils/asset";

export default function PlayerDetailQueue({ queue, currentIndex, playAt }) {
  const played = useMemo(() => {
    const list = queue || [];
    if (currentIndex <= 0) return [];
    return list.slice(Math.max(0, currentIndex - 3), currentIndex);
  }, [queue, currentIndex]);

  const upcoming = useMemo(() => {
    const list = queue || [];
    const next = list.slice(currentIndex + 1, currentIndex + 4);
    if (next.length) return next;
    return list.filter((_, i) => i !== currentIndex).slice(0, 3);
  }, [queue, currentIndex]);

  const Item = ({ song, idx, label }) => {
    const sCover = resolveAssetUrl(song.cover || song.cover_url || song.image);
    const realIndex = queue.findIndex((q) => q === song);

    return (
      <button
        key={song.id || idx}
        type="button"
        onClick={() => playAt(realIndex)}
        className="
          flex w-full items-center gap-3 rounded-2xl border border-white/10
          bg-white/5 px-3 py-2 text-left transition
          hover:border-white/20 hover:bg-white/10
          ring-1 ring-white/5
        "
      >
        <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
          {sCover && (
            <img
              src={sCover}
              alt={song.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold line-clamp-1">
              {song.title}
            </div>
            {label ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">
                {label}
              </span>
            ) : null}
          </div>
          <div className="text-xs text-white/60 line-clamp-1">
            {song.artist?.name || song.artist_name || ""}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="mt-5 space-y-7">
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Đã phát
        </div>

        {played.length ? (
          <div className="space-y-3">
            {played.map((song, idx) => (
              <Item key={song.id || idx} song={song} idx={idx} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">Chưa có bài trước đó</p>
        )}
      </div>

      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Tiếp theo
        </div>

        {upcoming.length ? (
          <div className="space-y-3">
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
