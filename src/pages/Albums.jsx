import { useCallback, useEffect, useMemo, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { getAlbumById, getAlbums } from "../api/album.api";
import SongTable from "../components/song/SongTable";
import { useEnsureLikedAlbumsLoaded } from "../hooks/useEnsureLibraryState";
import usePageMetadata from "../hooks/usePageMetadata";
import useAlbumLikeStore, {
  normalizeAlbumId,
} from "../store/album-like.store";
import { resolveAssetUrl } from "../utils/asset";
import { getArtistLabel } from "../utils/artist";
import { buildCollectionPageJsonLd } from "../utils/seo";
import { filterPlayableSongs } from "../utils/song";

export default function Albums() {
  useEnsureLikedAlbumsLoaded();
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
        artist_name: getArtistLabel(
          album,
          album.artist_name || data?.artist_name || data?.artist?.name || ""
        ),
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

      const hydrated = await Promise.all(raw.map((album) => hydrateAlbum(album)));
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

  const albumsMetaDescription = useMemo(() => {
    return albums.length
      ? `${albums.length} album nổi bật đang có trên Khoaluan Music, sẵn sàng để bạn khám phá theo nghệ sĩ và tracklist.`
      : "Khám phá album nổi bật từ nghệ sĩ yêu thích trên Khoaluan Music.";
  }, [albums.length]);
  const albumsJsonLd = useMemo(
    () =>
      buildCollectionPageJsonLd({
        name: "Album trên Khoaluan Music",
        description: albumsMetaDescription,
        url: "/albums",
        image: resolveAssetUrl(albums[0]?.cover_url) || "/logo-brand.png",
      }),
    [albums, albumsMetaDescription]
  );

  usePageMetadata({
    title: "Album nổi bật",
    description: albumsMetaDescription,
    image: resolveAssetUrl(albums[0]?.cover_url) || "/logo-brand.png",
    url: "/albums",
    jsonLd: albumsJsonLd,
  });

  return (
    <div className="user-page-shell min-h-screen space-y-8 px-4 py-6 sm:px-8">
      <div className="user-surface p-6">
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

      <div className="space-y-10">
        {albums.map((album) => {
          const albumId = normalizeAlbumId(album);
          const isLiked = albumId && likedAlbumIds.includes(albumId);

          return (
            <div key={album.id || album.title} className="user-surface">
              <SongTable
                title={album.title || "Album"}
                subtitle={
                  album.artist_name
                    ? `${getArtistLabel(album, album.artist_name)} · ${album.songs.length} bài hát`
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
          <div className="user-surface">
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
