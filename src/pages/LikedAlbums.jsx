import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlbumCard from "../components/album/AlbumCard";
import FilterToolbar from "../components/common/FilterToolbar";
import { getLikedAlbums } from "../api/like.api";
import useAuthStore from "../store/auth.store";
import useAlbumLikeStore, { normalizeAlbumId } from "../store/album-like.store";
import { matchesAnyText } from "../utils/searchText";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function LikedAlbums() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setLikedAlbumIds = useAlbumLikeStore((s) => s.setLikedAlbumIds);
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setLikedAlbums((prev) =>
      (prev || []).filter((album) => {
        const id = normalizeAlbumId(album);
        return id && likedAlbumIds.includes(id);
      })
    );
  }, [likedAlbumIds]);

  const loadLikedAlbumsList = useCallback(async () => {
    if (!user?.id) {
      setLikedAlbums([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getLikedAlbums();
      const payload = getData(res);
      const albums = Array.isArray(payload) ? payload : payload?.albums || [];
      setLikedAlbumIds(albums);
      const hydrated = albums.map((album) => ({
        ...album,
        artist_name: album?.artist?.name || album?.artist_name || "",
      }));
      setLikedAlbums(hydrated);
    } catch (err) {
      console.error("Load liked albums failed", err);
      setLikedAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [setLikedAlbumIds, user?.id]);

  useEffect(() => {
    loadLikedAlbumsList();
  }, [loadLikedAlbumsList]);

  const filteredLikedAlbums = likedAlbums.filter((album) =>
    matchesAnyText(
      [album?.title, album?.artist_name, album?.artist?.name],
      keyword
    )
  );

  return (
    <div className="user-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Thư viện
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Album đã thích
          </h1>
          <p className="text-sm text-white/60">
            {likedAlbums.length} album được lưu
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/playlists")}
          className="user-btn-secondary px-4 py-2 text-sm font-semibold"
        >
          ← Quay lại thư viện
        </button>
      </header>

      <FilterToolbar
        value={keyword}
        onChange={setKeyword}
        placeholder="Tìm album đã thích theo tên album hoặc nghệ sĩ"
        actions={
          keyword ? (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="user-btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Xóa lọc
            </button>
          ) : null
        }
        summary={
          keyword
            ? `Có ${filteredLikedAlbums.length} album khớp từ khóa hiện tại.`
            : "Lọc nhanh album yêu thích theo tên hoặc nghệ sĩ."
        }
      />

      <section className="space-y-4">
        {loading ? (
          <div className="user-surface p-6 text-sm text-white/60">
            Đang tải album yêu thích...
          </div>
        ) : filteredLikedAlbums.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {filteredLikedAlbums.map((album) => (
              <AlbumCard
                key={album.id || album.title}
                album={album}
                variant="library"
              />
            ))}
          </div>
        ) : (
          <div className="user-surface p-6 text-sm text-white/60">
            {keyword
              ? "Không có album nào khớp bộ lọc hiện tại."
              : "Chưa có album nào được thích."}
          </div>
        )}
      </section>
    </div>
  );
}
