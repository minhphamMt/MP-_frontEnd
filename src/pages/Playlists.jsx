import { useCallback, useEffect, useState } from "react";
import { getPlaylistById, getPlaylists } from "../api/playlist.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const hydratePlaylist = useCallback(async (playlist) => {
    if (playlist.songs?.length) {
      return {
        ...playlist,
        songs: filterPlayableSongs(playlist.songs),
      };
    }

    if (!playlist.id) return { ...playlist, songs: [] };

    try {
      const res = await getPlaylistById(playlist.id);
      const songs = res?.data?.data?.songs || res?.data?.songs || [];
      return {
        ...playlist,
        songs: filterPlayableSongs(songs),
      };
    } catch (err) {
      console.error("Load playlist detail failed", err);
      return { ...playlist, songs: [] };
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPlaylists({ limit: 3 });
      const raw = res?.data?.data || [];

      const hydrated = await Promise.all(
        raw.map((playlist) => hydratePlaylist(playlist))
      );

      setPlaylists(hydrated);
    } catch (err) {
      console.error("Load playlists failed", err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [hydratePlaylist]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  return (
    <div className="space-y-6">
      {playlists.map((playlist) => (
        <SongTable
          key={playlist.id || playlist.title}
          title={playlist.title || "Playlist"}
          subtitle={playlist.description || `${playlist.songs.length} bài hát`}
          songs={playlist.songs || []}
          loading={loading}
          onRefresh={loadPlaylists}
        />
      ))}

      {!playlists.length && (
        <SongTable
          title="Playlist nổi bật"
          subtitle="Không có playlist nào để hiển thị"
          songs={[]}
          loading={loading}
          onRefresh={loadPlaylists}
        />
      )}
    </div>
  );
}