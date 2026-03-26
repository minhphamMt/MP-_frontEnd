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
    <div className="space-y-6">
      <section className="artist-page-shell artist-glass p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="artist-label">Albums</p>
            <h1 className="mt-2 text-3xl font-black text-white">Quản lý album</h1>
            <p className="mt-2 text-sm text-white/65">
              Theo dõi toàn bộ album, trạng thái phát hành và cập nhật nội dung nhanh.
            </p>
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

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên album..."
              className="artist-input rounded-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              Tổng: {stats.total}
            </span>
            <span className="rounded-full border border-sky-300/30 bg-sky-400/12 px-3 py-1 text-sky-100">
              Đã duyệt: {stats.approved}
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-amber-100">
              Chờ duyệt: {stats.pending}
            </span>
          </div>
        </div>
      </section>

      {loading && <ArtistAlbumGridLoading cards={6} />}

      {!loading && !filteredAlbums.length && (
        <div className="artist-soft-card p-5 text-sm text-white/70">
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
