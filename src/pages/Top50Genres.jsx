import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { getTop50ByGenres } from "../api/chart.api";
import { filterPlayableSongs } from "../utils/song";

/* ================= utils ================= */
const normalizeTopGenres = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.items || payload?.data || [];

  return list.map((item) => ({
    genre: item.genre || item,
    songs: filterPlayableSongs(item.songs || []),
  }));
};

const getArtistPreview = (songs) => {
  const names = songs
    .map((song) => song.artist_name)
    .filter(Boolean)
    .filter((name, index, self) => self.indexOf(name) === index);

  if (!names.length) return "Nhiều nghệ sĩ";
  return names.slice(0, 3).join(", ");
};

/* ================= component ================= */
export default function Top50Genres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const res = await getTop50ByGenres();
      const payload = res?.data?.data || res?.data || [];
      setGenres(normalizeTopGenres(payload));
    } catch (error) {
      console.error("Load top 50 genres failed", error);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
         <div className="rounded-2xl border border-white/5 bg-[#181818] p-4 text-xs text-white/60">
          Đang tải Top 50 theo thể loại...
        </div>
      );
    }

    if (!genres.length) {
      return (
        <div className="rounded-2xl border border-white/5 bg-[#181818] p-4 text-xs text-white/60">
          Chưa có thể loại đủ dữ liệu để hiển thị.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map(({ genre, songs }) => {
          const cover = songs[0]?.cover_url;
          const artistPreview = getArtistPreview(songs);

          return (
            <Link
              key={genre?.id}
              to={`/top-50/${genre?.id}`}
              state={{ genre, songs }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#181818] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition hover:bg-[#202020]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-emerald-500/10 opacity-0 transition group-hover:opacity-100" />

              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                {cover ? (
                  <img
                    src={cover}
                    alt={genre?.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-white/50">
                    Chưa có ảnh
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur">
                  Top 50
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">
                    {genre?.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-white/65 line-clamp-1">
                    {artistPreview}
                  </p>
                </div>
              </div>

              <div className="relative mt-3 flex items-center justify-between text-xs text-white/60">
                <span>{songs.length} bài hát</span>
                <span className="flex items-center gap-1 font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  Xem <FiChevronRight />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }, [genres, loading]);

  return (
     <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="rounded-2xl border border-white/5 bg-[#181818] p-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Bảng xếp hạng
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          Top 50 Theo Thể Loại
        </h1>
        <p className="mt-1 text-xs text-white/60">
          Tuyển tập 50 bản nhạc nổi bật cho từng thể loại
        </p>
      </div>

      {content}
    </div>
  );
}