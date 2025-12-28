import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createPlaylist, getPlaylistById, getPlaylists } from "../api/playlist.api";
import { getArtistCollections } from "../api/artist.api";
import { getLikedSongs } from "../api/like.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import useAuthStore from "../store/auth.store";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  toPlayableSong,
} from "../utils/song";
import { getSongById } from "../api/song.api";
import ArtistFollowSection from "../components/playlists/ArtistFollowSection";
import PlaylistGrid from "../components/playlists/PlaylistGrid";
import LikedSongsSection from "../components/playlists/LikedSongsSection";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;
const extractSongsFromResponse = (payload) => {
  const sources = [
    payload?.data,
    payload?.data?.data,
    payload?.data?.songs,
    payload?.data?.data?.songs,
    payload?.songs,
    payload?.likedSongs,
    payload,
  ];

  return sources.find(Array.isArray) || [];
};

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [creatingName, setCreatingName] = useState("");
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingLikedSongs, setLoadingLikedSongs] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { playSong, pause, resume, currentSong, isPlaying, likedSongIds, toggleLike } =
    usePlayerStore();

  const likedQueue = useMemo(() => likedSongs || [], [likedSongs]);

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
      setLoadingPlaylists(true);
      const res = await getPlaylists();
      const raw = getData(res) || [];

      const hydrated = await Promise.all(raw.map((playlist) => hydratePlaylist(playlist)));
      setPlaylists(hydrated);
    } catch (err) {
      console.error("Load playlists failed", err);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [hydratePlaylist]);

  const loadArtists = useCallback(async () => {
    try {
      const res = await getArtistCollections({ limit: 12 });
      setArtists(res?.data?.data || []);
    } catch (err) {
      console.error("Load followed artists failed", err);
      setArtists([]);
    }
  }, []);

  const loadLikedSongsList = useCallback(async () => {
    try {
      setLoadingLikedSongs(true);
      const res = await getLikedSongs();
      const payload = getData(res);
      const songs = extractSongsFromResponse(payload);
      const playable = filterPlayableSongs(songs.map((song) => toPlayableSong(song)));
      setLikedSongs(playable);
    } catch (err) {
      console.error("Load liked songs failed", err);
      setLikedSongs([]);
    } finally {
      setLoadingLikedSongs(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
    loadArtists();
    loadLikedSongsList();
  }, [loadPlaylists, loadArtists, loadLikedSongsList]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!creatingName.trim()) return;

    try {
      setSaving(true);
      const res = await createPlaylist({ name: creatingName.trim() });
      const playlist = await hydratePlaylist(getData(res));

      setPlaylists((prev) => [playlist, ...prev]);
      setCreatingName("");
      if (playlist?.id) navigate(`/playlists/${playlist.id}`);
    } catch (err) {
      console.error("Create playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePlaySong = async (song, queue = likedQueue) => {
    const prepared = toPlayableSong(song);
    const playable = (await fetchPlayableSong(prepared, getSongById)) || prepared;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = (queue || []).map((item) => {
      const itemId = normalizeSongId(item);
      return itemId && itemId === normalizedId ? { ...item, ...playable } : item;
    });

    if (normalizeSongId(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
      playSong(playable, updatedQueue);
    }
  };

  return (
    <div className="space-y-8 bg-[#0c2144] p-4 sm:p-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-purple-900 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl text-white">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="h-full w-full object-cover" />
              ) : (
                <span>{user?.display_name?.[0]?.toUpperCase() || "♪"}</span>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Thư viện</p>
              <h1 className="text-3xl font-bold text-white">Playlist của bạn</h1>
              <p className="text-sm text-white/70">Danh sách nghệ sĩ theo dõi và playlist tự tạo</p>
            </div>
          </div>

          <form onSubmit={handleCreatePlaylist} className="flex flex-wrap items-center gap-2">
            <input
              value={creatingName}
              onChange={(e) => setCreatingName(e.target.value)}
              className="w-60 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Tên playlist mới"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-green-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-green-400/40 hover:bg-green-300 disabled:opacity-50"
            >
              Tạo playlist
            </button>
          </form>
        </div>
      </div>

      <ArtistFollowSection artists={artists} />

      <PlaylistGrid
        playlists={playlists}
        loading={loadingPlaylists}
        onOpen={(pl) => pl?.id && navigate(`/playlists/${pl.id}`)}
      />

      {loadingLikedSongs ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          Đang tải bài hát yêu thích...
        </div>
      ) : (
        <LikedSongsSection
          songs={likedSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          likedSongIds={likedSongIds}
          onPlay={(song) => handlePlaySong(song, likedQueue)}
          onToggleLike={toggleLike}
        />
      )}
    </div>
  );
}