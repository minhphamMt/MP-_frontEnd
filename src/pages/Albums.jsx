import { useCallback, useEffect, useState } from "react";
import { getAlbumById, getAlbums } from "../api/album.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      {albums.map((album) => (
        <SongTable
          key={album.id || album.title}
          title={album.title || "Album"}
          subtitle={
            album.artist_name
              ? `${album.artist_name} · ${album.songs.length} bài hát`
              : `${album.songs.length} bài hát`
          }
          songs={album.songs || []}
          loading={loading}
          onRefresh={loadAlbums}
        />
      ))}

      {!albums.length && (
        <SongTable
          title="Album nổi bật"
          subtitle="Không có album nào để hiển thị"
          songs={[]}
          loading={loading}
          onRefresh={loadAlbums}
        />
      )}
    </div>
  );
}