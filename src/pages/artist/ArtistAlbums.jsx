import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { deleteAlbum, getAlbums } from "../../api/album.api";
import { ArtistAlbumGridLoading } from "../../components/artist/ArtistLoadingState";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
import { getMyArtistProfile } from "../../api/artist.api";
import { confirmAdminAction } from "../../utils/adminDialog";

export default function ArtistAlbums() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [artistProfile, setArtistProfile] = useState(user?.artist ?? null);
  const artistId = artistProfile?.id ?? user?.artist_id ?? null;

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
    if (!artistId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getAlbums({ artist_id: artistId, limit: 50 });
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

  const filteredAlbums = useMemo(() => {
    if (!keyword) return albums;
    const lowerKeyword = keyword.toLowerCase();
    return albums.filter((album) => (album?.title || "").toLowerCase().includes(lowerKeyword));
  }, [albums, keyword]);

  const stats = useMemo(() => {
    const total = albums.length;
    const approved = albums.filter((item) => item?.status === "approved").length;
    const pending = albums.filter((item) => item?.status === "pending").length;
    return { total, approved, pending };
  }, [albums]);

  const handleDelete = async (albumId) => {
    if (!albumId) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm album",
      message: "Album sẽ được chuyển vào thùng rác. Bạn có muốn tiếp tục không?",
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteAlbum(albumId);
      await loadAlbums();
    } catch (error) {
      console.error("Delete album failed", error);
    }
  };

  return (
    <div className="artist-list-page">
      <section className="artist-page-shell p-6 sm:p-8">
        <div className="artist-list-header">
          <div className="artist-list-heading">
            <p className="artist-label">Albums</p>
            <h1 className="artist-list-title">Quản lý album</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums/new")}
            className="artist-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <FiPlus />
            Tạo album mới
          </button>
        </div>
      </section>

      <section className="artist-stat-grid">
        <article className="artist-stat-card">
          <p className="artist-stat-label">Tổng album</p>
          <p className="artist-stat-value">{stats.total}</p>
        </article>
        <article className="artist-stat-card">
          <p className="artist-stat-label">Đã duyệt</p>
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
              placeholder="Tìm theo tên album..."
              className="artist-input"
            />
          </div>
        </div>
      </section>

      {loading && <ArtistAlbumGridLoading cards={6} />}

      {!loading && !filteredAlbums.length && (
        <div className="artist-empty-state">
          Không tìm thấy album phù hợp. Hãy thử từ khóa khác hoặc tạo album mới.
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredAlbums.map((album) => (
          <ArtistAlbumTile
            key={album.id}
            album={album}
            onView={() => navigate(`/artist/albums/${album.id}`)}
            onEdit={() => navigate(`/artist/albums/${album.id}/edit`)}
            onDelete={() => handleDelete(album.id)}
          />
        ))}
      </section>
    </div>
  );
}
