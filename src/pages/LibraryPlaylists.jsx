import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaylistGrid from "../components/playlists/PlaylistGrid";
import { getPlaylistById, getPlaylists } from "../api/playlist.api";
import { filterPlayableSongs } from "../utils/song";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function LibraryPlaylists() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const hydratePlaylist = useCallback(async (playlist) => {
    const normalized = {
      ...playlist,
      title: playlist.name || playlist.title || "Playlist",
    };

    if (playlist.songs?.length) {
      return { ...normalized, songs: filterPlayableSongs(playlist.songs) };
    }

    if (!playlist.id) return { ...normalized, songs: [] };

    try {
      const res = await getPlaylistById(playlist.id);
      const songs = getData(res)?.songs || [];
      return {
        ...normalized,
        songs: filterPlayableSongs(songs),
      };
    } catch (err) {
      console.error("Load playlist detail failed", err);
      return { ...normalized, songs: [] };
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPlaylists();
      const raw = getData(res) || [];
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
      <div className="user-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Thư viện
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Playlist đã tạo
          </h1>
          <p className="text-sm text-white/60">
            {playlists.length} playlist đã tạo
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

      <section className="space-y-4">
        {loading ? (
          <div className="user-surface p-6 text-sm text-white/60">
            Đang tải playlist...
          </div>
        ) : playlists.length ? (
          <PlaylistGrid
            playlists={playlists}
            onOpen={(pl) => pl?.id && navigate(`/playlists/${pl.id}`)}
            variant="library"
          />
        ) : (
          <div className="user-surface p-6 text-sm text-white/60">
            Bạn chưa tạo playlist nào.
          </div>
        )}
      </section>
    </div>
  );
}
