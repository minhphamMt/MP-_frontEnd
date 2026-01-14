import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { deleteAlbum, getAlbums } from "../../api/album.api";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
import { getMyArtistProfile } from "../../api/artist.api";

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
    return albums.filter((album) =>
      (album?.title || "").toLowerCase().includes(lowerKeyword)
    );
  }, [albums, keyword]);

  const handleDelete = async (albumId) => {
    if (!albumId) return;
    const confirmed = window.confirm("Bạn chắc chắn muốn xoá album này?");
    if (!confirmed) return;

    try {
      await deleteAlbum(albumId);
      await loadAlbums();
    } catch (error) {
      console.error("Delete album failed", error);
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Nghệ sĩ
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              Quản lý album
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Cập nhật thông tin album, theo dõi phát hành và thêm nội dung mới.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums/new")}
            className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-[#1db954]/40 transition hover:translate-y-[-1px]"
          >
            <FiPlus />
            Tạo album mới
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên album"
              className="w-full rounded-full border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white/80 outline-none transition focus:border-white/30 focus:bg-black/40"
            />
          </div>
          <span className="text-sm text-white/50">
            {filteredAlbums.length} album
          </span>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          Đang tải danh sách album...
        </div>
      )}

      {!loading && !filteredAlbums.length && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          Chưa có album nào. Hãy tạo album đầu tiên của bạn.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredAlbums.map((album) => (
          <ArtistAlbumTile
            key={album.id}
            album={album}
            onView={() => navigate(`/album/${album.id}`)}
            onEdit={() => navigate(`/artist/albums/${album.id}/edit`)}
            onDelete={() => handleDelete(album.id)}
          />
        ))}
      </div>
    </div>
  );
}