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

  return (
    <div className="mt-5 space-y-6">
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Đã phát
        </div>
        {played.length ? (
          <div className="space-y-3">
            {played.map((song, idx) => {
              const sCover = resolveAssetUrl(
                song.cover || song.cover_url || song.image
              );
              const realIndex = queue.findIndex((q) => q === song);
              return (
                <button
                  key={song.id || idx}
                  type="button"
                  onClick={() => playAt(realIndex)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-left transition hover:border-white/20"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/5">
                    {sCover && (
                      <img
                        src={sCover}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold line-clamp-1">
                      {song.title}
                    </div>
                    <div className="text-xs text-white/60 line-clamp-1">
                      {song.artist?.name || song.artist_name || ""}
                    </div>
                  </div>
                </button>
              );
            })}
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
            {upcoming.map((song, idx) => {
              const sCover = resolveAssetUrl(
                song.cover || song.cover_url || song.image
              );
              const realIndex = queue.findIndex((q) => q === song);
              return (
                <button
                  key={song.id || idx}
                  type="button"
                  onClick={() => playAt(realIndex)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-left transition hover:border-white/20"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/5">
                    {sCover && (
                      <img
                        src={sCover}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold line-clamp-1">
                      {song.title}
                    </div>
                    <div className="text-xs text-white/60 line-clamp-1">
                      {song.artist?.name || song.artist_name || ""}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-white/50">Chưa có bài tiếp theo</p>
        )}
      </div>
    </div>
  );
}