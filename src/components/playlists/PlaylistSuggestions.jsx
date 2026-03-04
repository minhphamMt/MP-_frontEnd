import { Link } from "react-router-dom";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function PlaylistSuggestions({
  songs = [],
  loading = false,
  onRefresh,
  onPlay,
  onAdd,
  saving = false,
}) {
  if (!songs.length && !loading) return null;

  return (
    <div className="user-page-shell p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="user-heading-label">Gợi ý</p>
          <h3 className="text-xl font-bold text-white">Bài hát gợi ý</h3>
          <p className="text-sm text-white/60">Thêm nhanh vào playlist của bạn</p>
        </div>

        <button
          onClick={onRefresh}
          className="user-btn-secondary px-4 py-2 text-xs font-semibold"
        >
          Làm mới
        </button>
      </div>

      <div className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#151515] px-2 sm:px-3">
        {loading && (
          <div className="py-4 text-sm text-white/60">Đang tải gợi ý...</div>
        )}

        {!loading && !songs.length && (
          <div className="py-4 text-sm text-white/60">Chưa có gợi ý khả dụng.</div>
        )}

        {songs.map((song) => {
          const artistId = song?.artist_id ?? song?.artist?.id ?? song?.artistId;
          const artistLabel = song?.artist_name || song?.artist || "";

          return (
            <div
              key={song.id}
              className="group flex flex-col gap-3 rounded-xl px-2 py-3 transition md:hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <OptimizedImage
                    src={resolveAssetUrl(song.cover_url)}
                    alt={song.title}
                    className="h-full w-full object-cover transition duration-500 md:group-hover:scale-110"
                  />
                  <button
                    onClick={() => onPlay?.(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition md:group-hover:opacity-100"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg">
                      ▶
                    </span>
                  </button>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {song.title}
                  </p>
                  <p className="truncate text-xs text-white/60">
                    {artistId ? (
                      <Link
                        to={`/artist/${artistId}`}
                        className="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                      >
                        {artistLabel}
                      </Link>
                    ) : (
                      artistLabel
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onPlay?.(song)}
                  className="user-btn-secondary px-3 py-2 text-xs font-semibold sm:hidden"
                >
                  ▶ Nghe thử
                </button>

                <button
                  onClick={() => onAdd?.(song)}
                  disabled={saving}
                  className="user-btn-primary px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  + Thêm
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
