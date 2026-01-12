import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlbumCard from "../components/album/AlbumCard";
import { getLikedAlbums } from "../api/like.api";
import useAuthStore from "../store/auth.store";
import useAlbumLikeStore, { normalizeAlbumId } from "../store/album-like.store";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function LikedAlbums() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [user?.id]);

  useEffect(() => {
    loadLikedAlbumsList();
  }, [loadLikedAlbumsList]);

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thư viện
            </p>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Album đã thích
            </h1>
            <p className="text-sm text-white/60">
              {likedAlbums.length} album được lưu
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/playlists")}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            ← Quay lại thư viện
          </button>
        </div>
      </div>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Đang tải album yêu thích...
          </div>
        ) : likedAlbums.length ? (
          <div className="flex flex-wrap gap-4 sm:gap-5">
            {likedAlbums.map((album) => (
              <AlbumCard key={album.id || album.title} album={album} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Chưa có album nào được thích.
          </div>
        )}
      </section>
    </div>
  );
}