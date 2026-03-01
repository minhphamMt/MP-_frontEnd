import { useCallback, useEffect, useState } from "react";
import { getAlbumById, getAlbums } from "../api/album.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";
import useAlbumLikeStore, {
  normalizeAlbumId,
} from "../store/album-like.store";
import { FiHeart } from "react-icons/fi";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((s) => s.toggleAlbumLike);
  /* =======================
     HYDRATE ALBUM (GIỮ NGUYÊN)
     ======================= */
  const hydrateAlbum = useCallback(async (album) => {
    if (album.songs?.length) {
      return { ...album, songs: filterPlayableSongs(album.songs) };
    }

    if (!album.id) return { ...album, songs: [] };

    try {
      const res = await getAlbumById(album.id);
      const data = res?.data?.data || res?.data;
      const songs = data?.songs || [];
      return {
        ...album,
        songs: filterPlayableSongs(songs),
        title: album.title || data?.title,
        artist_name: album.artist_name || data?.artist_name,
      };
    } catch (err) {
      console.error("Load album detail failed", err);
      return { ...album, songs: [] };
    }
  }, []);

  /* =======================
     LOAD ALBUMS (GIỮ NGUYÊN)
     ======================= */
  const loadAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAlbums({ limit: 20 });
      const raw = res?.data?.data || [];

      const hydrated = await Promise.all(
        raw.map((album) => hydrateAlbum(album))
      );
      setAlbums(hydrated);
    } catch (err) {
      console.error("Load albums failed", err);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [hydrateAlbum]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  /* =======================
     UI
     ======================= */
  return (
     <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      {/* PAGE HEADER */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Thư viện
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          Album
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Tuyển tập album nổi bật từ nghệ sĩ yêu thích
        </p>
      </div>

      {/* ALBUM LIST */}
      <div className="space-y-10">
         {albums.map((album) => {
          const albumId = normalizeAlbumId(album);
          const isLiked = albumId && likedAlbumIds.includes(albumId);

          return (
            <div
              key={album.id || album.title}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            >
              <SongTable
                title={album.title || "Album"}
                subtitle={
                  album.artist_name
                    ? `${album.artist_name} · ${album.songs.length} bài hát`
                    : `${album.songs.length} bài hát`
                }
                songs={album.songs || []}
                loading={loading}
                onRefresh={loadAlbums}
                headerActions={
                  <button
                    onClick={() => toggleAlbumLike(albumId)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
                      isLiked
                        ? "border-rose-400/40 text-rose-300"
                        : "border-white/10 text-white/70 md:hover:bg-white/15"
                    }`}
                    aria-label={isLiked ? "Bỏ thích album" : "Thích album"}
                  >
                    <FiHeart />
                  </button>
                }
              />
            </div>
          );
        })}

        {!albums.length && (
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <SongTable
              title="Album nổi bật"
              subtitle="Không có album nào để hiển thị"
              songs={[]}
              loading={loading}
              onRefresh={loadAlbums}
            />
          </div>
        )}
      </div>
    </div>
  );
}
