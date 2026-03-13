import { FiPlay, FiPlus } from "react-icons/fi";

import ArtistNames from "../artist/ArtistNames";
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
  if (loading) {
    return (
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`suggestion-skeleton-${index}`}
            className="ui-skeleton h-[104px] rounded-[20px] border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center">
        <h3 className="text-lg font-bold text-white">Chưa có gợi ý phù hợp</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/60">
          Chưa có bài nào thật sự ăn khớp với playlist này lúc này. Bạn có thể
          làm mới để thử một mạch gợi ý khác.
        </p>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="user-btn-secondary mt-5 px-4 py-2 text-sm font-semibold"
          >
            Làm mới gợi ý
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {songs.map((song) => (
        <article
          key={song.id}
          className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-4 transition md:hover:border-white/16 md:hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))]"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <OptimizedImage
                src={resolveAssetUrl(song.cover_url)}
                alt={song.title}
                className="h-full w-full object-cover transition duration-500 md:group-hover:scale-105"
              />

              <button
                type="button"
                onClick={() => onPlay?.(song)}
                className="absolute inset-0 flex items-center justify-center bg-black/48 opacity-0 transition md:group-hover:opacity-100"
                aria-label={`Phát thử ${song.title}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-black shadow-[0_8px_18px_rgba(52,211,153,0.35)]">
                  <FiPlay className="ml-0.5 text-sm" />
                </span>
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="user-heading-label">Gợi ý thêm</p>
              <h3 className="mt-2 truncate text-base font-bold text-white">
                {song.title}
              </h3>
              <div className="mt-1 truncate text-sm text-white/60">
                <ArtistNames
                  item={song}
                  stopPropagation
                  linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                  fallback="Đang cập nhật nghệ sĩ"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPlay?.(song)}
              className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
            >
              <FiPlay />
              Nghe thử
            </button>

            <button
              type="button"
              onClick={() => onAdd?.(song)}
              disabled={saving}
              className="user-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlus />
              {saving ? "Đang thêm..." : "Thêm vào playlist"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
