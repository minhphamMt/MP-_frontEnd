import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiClock,
  FiDisc,
  FiHeadphones,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getAlbums } from "../../api/album.api";
import { getArtistSongs } from "../../api/song.api";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
import { getMyArtistProfile } from "../../api/artist.api";

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistProfile, setArtistProfile] = useState(user?.artist ?? null);

  const artistId = artistProfile?.id ?? user?.artist_id ?? null;
  const artistName =
    artistProfile?.name ||
    user?.display_name ||
    user?.name ||
    user?.email ||
    "Nghệ sĩ";

  useEffect(() => {
    const loadArtistProfile = async () => {
      if (artistProfile?.id || user?.artist_id) return;
      try {
        const res = await getMyArtistProfile();
        const artist = res?.data?.data ?? res?.data ?? null;
        if (artist) {
          setArtistProfile(artist);
          if (user) {
            updateUser({
              ...user,
              artist,
            });
          }
        }
      } catch (error) {
        console.error("Load artist profile failed", error);
      }
    };

    loadArtistProfile();
  }, [artistProfile?.id, updateUser, user, user?.artist_id]);

  const loadDashboardData = useCallback(async () => {
    if (!artistId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [albumsRes, songsRes] = await Promise.all([
        getAlbums({ artist_id: artistId, limit: 12 }),
        getArtistSongs(artistId),
      ]);

      const albumData = albumsRes?.data?.data || [];
      setAlbums(Array.isArray(albumData) ? albumData : []);

      const payload = songsRes?.data?.data || songsRes?.data || {};
      const list = payload?.songs || payload?.data || payload || [];
      setSongs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load artist dashboard failed", error);
      setAlbums([]);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    const totalSongs = songs.length;
    const pendingSongs = songs.filter((song) => song?.status === "pending").length;
    const newestAlbum = albums[0]?.title || "Chưa có album";

    return { totalAlbums, totalSongs, pendingSongs, newestAlbum };
  }, [albums, songs]);

  const latestAlbums = albums.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="artist-page-shell artist-glass overflow-hidden p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="artist-label">Artist Workspace</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Xin chào, {artistName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Theo dõi hiệu suất phát hành, quản lý album và bài hát trong một giao diện
              thống nhất dành cho nghệ sĩ.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/artist/albums/new")}
                className="artist-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <FiPlus />
                Tạo album mới
              </button>
              <button
                type="button"
                onClick={() => navigate("/artist/songs/new")}
                className="artist-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <FiHeadphones />
                Thêm bài hát
              </button>
              <button
                type="button"
                onClick={() => navigate("/artist/profile")}
                className="artist-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <FiUser />
                Cập nhật hồ sơ
              </button>
            </div>
          </div>

          <div className="artist-soft-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Album mới nhất</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{stats.newestAlbum}</h3>
            <p className="mt-2 text-sm text-white/60">
              Duy trì lịch phát hành ổn định để tăng độ phủ và lượt nghe.
            </p>
            <button
              type="button"
              onClick={() => navigate("/artist/albums")}
              className="artist-btn-secondary mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              Đi tới quản lý album
              <FiArrowUpRight />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Tổng album</p>
          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{stats.totalAlbums}</h3>
            <span className="rounded-xl bg-emerald-400/20 p-3 text-emerald-100">
              <FiDisc className="text-lg" />
            </span>
          </div>
        </article>
        <article className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Tổng bài hát</p>
          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{stats.totalSongs}</h3>
            <span className="rounded-xl bg-cyan-400/20 p-3 text-cyan-100">
              <FiHeadphones className="text-lg" />
            </span>
          </div>
        </article>
        <article className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Chờ duyệt</p>
          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{stats.pendingSongs}</h3>
            <span className="rounded-xl bg-amber-400/20 p-3 text-amber-100">
              <FiClock className="text-lg" />
            </span>
          </div>
        </article>
        <article className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Hành động nhanh</p>
          <button
            type="button"
            onClick={() => navigate("/artist/songs")}
            className="artist-btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm"
          >
            Quản lý bài hát
            <FiArrowUpRight />
          </button>
        </article>
      </section>

      <section className="artist-page-shell artist-glass p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="artist-label">Recent Albums</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Phát hành gần đây</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            Xem tất cả
            <FiArrowUpRight />
          </button>
        </div>

        {loading && (
          <div className="artist-soft-card p-5 text-sm text-white/70">Đang tải dữ liệu...</div>
        )}

        {!loading && !latestAlbums.length && (
          <div className="artist-soft-card p-5 text-sm text-white/70">
            Bạn chưa có album nào. Hãy tạo album đầu tiên để bắt đầu phát hành.
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
