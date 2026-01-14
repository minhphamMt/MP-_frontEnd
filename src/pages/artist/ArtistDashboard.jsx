import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiDisc,
  FiHeadphones,
  FiPlus,
  FiTrendingUp,
} from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getAlbums } from "../../api/album.api";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const artistId = user?.artist?.id ?? user?.artist_id ?? user?.id;
  const artistName =
    user?.artist?.name ||
    user?.display_name ||
    user?.name ||
    user?.email ||
    "Nghệ sĩ";

  const loadAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAlbums({ artist_id: artistId, limit: 12 });
      const data = res?.data?.data || [];
      setAlbums(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load artist albums failed", error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    const totalSongs = albums.reduce(
      (total, album) =>
        total +
        (album?.song_count ?? album?.track_count ?? album?.songs?.length ?? 0),
      0
    );
    const newestAlbum = albums[0]?.title || "Chưa có album";

    return { totalAlbums, totalSongs, newestAlbum };
  }, [albums]);

  const latestAlbums = albums.slice(0, 3);

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Nghệ sĩ
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            {artistName}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/60">
            Theo dõi hiệu suất album, cập nhật phát hành mới và quản lý nội dung
            dành riêng cho nghệ sĩ.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/artist/albums")}
              className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px]"
            >
              Quản lý album
              <FiArrowUpRight />
            </button>
            <button
              type="button"
              onClick={() => navigate("/artist/albums/new")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
            >
              <FiPlus />
              Tạo album mới
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Album
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {stats.totalAlbums}
                </h3>
              </div>
              <span className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-200">
                <FiDisc className="text-xl" />
              </span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Tổng số album đã xuất bản.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Bài hát
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {stats.totalSongs}
                </h3>
              </div>
              <span className="rounded-2xl bg-sky-500/15 p-3 text-sky-200">
                <FiHeadphones className="text-xl" />
              </span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Tổng số bài hát trong các album.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Album mới nhất
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {stats.newestAlbum}
                </h3>
              </div>
              <span className="rounded-2xl bg-fuchsia-500/15 p-3 text-fuchsia-200">
                <FiTrendingUp className="text-xl" />
              </span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Theo dõi bản phát hành gần nhất.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Album gần đây
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Hoạt động mới nhất
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10"
          >
            Xem tất cả
            <FiArrowUpRight />
          </button>
        </div>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            Đang tải dữ liệu album...
          </div>
        )}

        {!loading && !latestAlbums.length && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            Bạn chưa có album nào. Hãy tạo album mới để bắt đầu.
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latestAlbums.map((album) => (
            <ArtistAlbumTile
              key={album.id}
              album={album}
              onView={() => navigate(`/album/${album.id}`)}
              onEdit={() => navigate(`/artist/albums/${album.id}/edit`)}
              onDelete={() => navigate(`/artist/albums/${album.id}/edit`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}