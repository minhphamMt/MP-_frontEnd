import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { getAlbums } from "../../api/album.api";
import { ArtistSongListLoading } from "../../components/artist/ArtistLoadingState";
import { deleteSong, getArtistSongs } from "../../api/song.api";
import { getMyArtistProfile } from "../../api/artist.api";
import { resolveAssetUrl } from "../../utils/asset";
import { confirmAdminAction } from "../../utils/adminDialog";

const statusLabelMap = {
  approved: "Công khai",
  pending: "Chờ duyệt",
  draft: "Nháp",
  rejected: "Từ chối",
  blocked: "Bị chặn",
};

const statusClassMap = {
  approved: "border-sky-300/30 bg-sky-400/12 text-sky-100",
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  draft: "border-slate-300/30 bg-slate-500/10 text-slate-100",
  rejected: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  blocked: "border-rose-400/30 bg-rose-500/10 text-rose-100",
};

export default function ArtistSongs() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [artistProfile, setArtistProfile] = useState(user?.artist ?? null);
  const artistId = artistProfile?.id ?? user?.artist_id ?? null;

  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const loadAlbums = useCallback(async () => {
    if (!artistId) return;
    try {
      const res = await getAlbums({ artist_id: artistId, limit: 200 });
      const data = res?.data?.data || [];
      setAlbums(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load artist albums failed", error);
      setAlbums([]);
    }
  }, [artistId]);

  const loadSongs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getArtistSongs(artistId);
      const payload = res?.data?.data || res?.data || {};
      const list = payload?.songs || payload?.data || payload || [];
      setSongs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load artist songs failed", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadAlbums();
    loadSongs();
  }, [loadAlbums, loadSongs]);

  const albumMap = useMemo(() => {
    return albums.reduce((acc, album) => {
      acc[album.id] = album;
      return acc;
    }, {});
  }, [albums]);

  const normalizedSongs = useMemo(() => {
    return songs.map((song) => {
      const songId = song.id ?? song.song_id ?? song.songId;
      return {
        ...song,
        id: songId,
        album_title:
          song.album_title || song.album?.title || albumMap[song.album_id]?.title || "Single",
      };
    });
  }, [albumMap, songs]);

  const filteredSongs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return normalizedSongs.filter((song) => {
      const matchesKeyword = normalizedKeyword
        ? (song.title || "").toLowerCase().includes(normalizedKeyword)
        : true;
      const matchesStatus = statusFilter === "all" ? true : song.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [keyword, normalizedSongs, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: normalizedSongs.length,
      approved: normalizedSongs.filter((song) => song.status === "approved").length,
      pending: normalizedSongs.filter((song) => song.status === "pending").length,
    };
  }, [normalizedSongs]);

  const handleDelete = async (songId) => {
    if (!songId) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm bài hát",
      message: "Bài hát sẽ được chuyển vào thùng rác. Bạn có chắc chắn muốn tiếp tục?",
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteSong(songId);
      await loadSongs();
    } catch (error) {
      console.error("Delete song failed", error);
    }
  };

  return (
    <div className="artist-list-page">
      <section className="artist-page-shell p-6 sm:p-8">
        <div className="artist-list-header">
          <div className="artist-list-heading">
            <p className="artist-label">Songs</p>
            <h1 className="artist-list-title">Quản lý bài hát</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/songs/new")}
            className="artist-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <FiPlus />
            Tạo bài hát mới
          </button>
        </div>
      </section>

      <section className="artist-stat-grid">
        <article className="artist-stat-card">
          <p className="artist-stat-label">Tổng bài hát</p>
          <p className="artist-stat-value">{stats.total}</p>
        </article>
        <article className="artist-stat-card">
          <p className="artist-stat-label">Công khai</p>
          <p className="artist-stat-value">{stats.approved}</p>
        </article>
        <article className="artist-stat-card">
          <p className="artist-stat-label">Chờ duyệt</p>
          <p className="artist-stat-value">{stats.pending}</p>
        </article>
      </section>

      <section className="artist-toolbar-panel">
        <div className="artist-toolbar-group">
          <div className="artist-search-shell">
            <FiSearch className="artist-search-icon" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên bài hát..."
              className="artist-input"
            />
          </div>
        </div>

        <div className="artist-toolbar-actions">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="artist-select ui-select rounded-full"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Công khai</option>
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Nháp</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </section>

      {loading && <ArtistSongListLoading rows={5} />}

      {!loading && !filteredSongs.length && (
        <div className="artist-empty-state">
          Không có bài hát phù hợp với bộ lọc hiện tại.
        </div>
      )}

      <section className="artist-data-panel">
        <div className="artist-table-head hidden grid-cols-[2.2fr_1fr_1fr] gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/45 md:grid">
          <span>Bài hát</span>
          <span>Trạng thái</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {filteredSongs.map((song) => {
            const statusClass =
              statusClassMap[song.status] || "border-white/10 bg-white/5 text-white/75";
            const statusLabel = statusLabelMap[song.status] || song.status || "Chưa xác định";

            return (
              <div
                key={`${song.id ?? song.title}-${song.album_id ?? "single"}`}
                className="artist-table-row flex flex-col gap-4 px-6 py-4 text-sm text-white/85 md:grid md:grid-cols-[2.2fr_1fr_1fr] md:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {song.cover_url ? (
                      <img
                        src={resolveAssetUrl(song.cover_url)}
                        alt={song.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-white/45">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="text-xs text-white/55">ID #{song.id}</p>
                    <p className="text-xs text-white/55">{song.album_title || "Single"}</p>
                    {song.status === "rejected" && song.reject_reason ? (
                      <p className="mt-1 text-xs text-rose-200/95">
                        Lý do từ chối: {song.reject_reason}
                      </p>
                    ) : null}
                  </div>
                </div>

                <span className={`w-fit rounded-full border px-3 py-1 text-xs ${statusClass}`}>
                  {statusLabel}
                </span>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/artist/songs/${song.id}/edit`)}
                    disabled={!song.id}
                    className="artist-btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiEdit2 />
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(song.id)}
                    disabled={!song.id}
                    className="artist-btn-danger inline-flex items-center gap-2 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiTrash2 />
                    Xóa mềm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
