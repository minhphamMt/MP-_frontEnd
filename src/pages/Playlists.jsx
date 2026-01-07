import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAlbumLikeStore, { normalizeAlbumId } from "../store/album-like.store";

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "../api/playlist.api";
import { getLikedAlbums, getLikedSongs } from "../api/like.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import useAuthStore from "../store/auth.store";
import useArtistFollowStore from "../store/artist-follow.store";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  toPlayableSong,
} from "../utils/song";
import { getSongById } from "../api/song.api";

import ArtistFollowSection from "../components/playlists/ArtistFollowSection";
import PlaylistGrid from "../components/playlists/PlaylistGrid";
import LikedSongsSection from "../components/playlists/LikedSongsSection";
import AlbumCard from "../components/album/AlbumCard";
import PlaylistCard from "../components/playlists/PlaylistCard";
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
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [creatingName, setCreatingName] = useState("");
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingLikedSongs, setLoadingLikedSongs] = useState(true);
  const [loadingLikedAlbums, setLoadingLikedAlbums] = useState(true);
  const [saving, setSaving] = useState(false);
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);

  const user = useAuthStore((s) => s.user);
  useEffect(() => {
  setLikedAlbums((prev) =>
    (prev || []).filter((a) => {
      const id = normalizeAlbumId(a);
      return id && likedAlbumIds.includes(id);
    })
  );
}, [likedAlbumIds]);

  const navigate = useNavigate();
  const followedArtists = useArtistFollowStore((s) => s.followedArtists);
  const loadFollowedArtists = useArtistFollowStore(
    (s) => s.loadFollowedArtists
  );
  const clearFollowedArtists = useArtistFollowStore(
    (s) => s.clearFollowedArtists
  );
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const likedQueue = useMemo(() => likedSongs || [], [likedSongs]);
  const artistPreviewCount = 6;
  const albumPreviewCount = 6;
  const playlistPreviewCount = 6;
  const visibleArtists = followedArtists.slice(0, artistPreviewCount);
  const visibleAlbums = likedAlbums.slice(0, albumPreviewCount);
  const visiblePlaylists = playlists.slice(0, playlistPreviewCount);
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
      const hydrated = await Promise.all(
        raw.map((playlist) => hydratePlaylist(playlist))
      );
      setPlaylists(hydrated);
    } catch (err) {
      console.error("Load playlists failed", err);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [hydratePlaylist]);

  const loadArtists = useCallback(async () => {
    if (!user?.id) {
      clearFollowedArtists();
      return;
    }
   await loadFollowedArtists();
  }, [clearFollowedArtists, loadFollowedArtists, user?.id]);

  const loadLikedSongsList = useCallback(async () => {
    try {
      setLoadingLikedSongs(true);
      const res = await getLikedSongs();
      const payload = getData(res);
      const songs = extractSongsFromResponse(payload);
      const playable = filterPlayableSongs(
        songs.map((song) => toPlayableSong(song))
      );
      setLikedSongs(playable);
    } catch (err) {
      console.error("Load liked songs failed", err);
      setLikedSongs([]);
    } finally {
      setLoadingLikedSongs(false);
    }
  }, []);
 const loadLikedAlbumsList = useCallback(async () => {
    if (!user?.id) {
      setLikedAlbums([]);
      return;
    }

    try {
      setLoadingLikedAlbums(true);
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
      setLoadingLikedAlbums(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPlaylists();
    loadArtists();
    loadLikedSongsList();
    loadLikedAlbumsList();
  }, [loadPlaylists, loadArtists, loadLikedSongsList, loadLikedAlbumsList]);

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
    const playable =
      (await fetchPlayableSong(prepared, getSongById)) || prepared;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = (queue || []).map((item) => {
      const itemId = normalizeSongId(item);
      return itemId && itemId === normalizedId
        ? { ...item, ...playable }
        : item;
    });

    if (normalizeSongId(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
      playSong(playable, updatedQueue);
    }
  };

  return (
    <div className="min-h-screen space-y-10 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      {/* HEADER */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-2xl font-bold text-slate-900 shadow-lg">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user?.display_name?.[0]?.toUpperCase() || "♪"}</span>
              )}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                Thư viện
              </p>
              <h1 className="text-3xl font-extrabold text-white">
                Playlist của bạn
              </h1>
              <p className="text-sm text-white/60">
                Nghệ sĩ theo dõi & playlist tự tạo
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreatePlaylist}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              value={creatingName}
              onChange={(e) => setCreatingName(e.target.value)}
              className="w-64 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/60"
              placeholder="Tên playlist mới"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-green-400/30 transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              Tạo playlist
            </button>
          </form>
        </div>
      </div>

      {/* ARTISTS */}
      <section className="space-y-4">
         <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Nghệ sĩ theo dõi</h2>
          {followedArtists.length > artistPreviewCount && (
            <button
              type="button"
              onClick={() => navigate("/library/followed-artists")}
              className="text-sm font-semibold text-white/70 transition hover:text-white"
            >
                Xem tất cả
            </button>
          )}
        </div>
        <ArtistFollowSection artists={visibleArtists} />
      </section>
 {/* LIKED ALBUMS */}
      <section className="space-y-4">
         <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Album đã thích</h2>
          {likedAlbums.length > albumPreviewCount && (
            <button
              type="button"
              onClick={() => navigate("/library/liked-albums")}
              className="text-sm font-semibold text-white/70 transition hover:text-white"
            >
               Xem tất cả
            </button>
          )}
        </div>

        {loadingLikedAlbums ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Đang tải album yêu thích...
          </div>
        ) : likedAlbums.length ? (
          <div className="flex flex-wrap gap-5">
            {visibleAlbums.map((album) => (
              <AlbumCard key={album.id || album.title} album={album}  />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Chưa có album nào được thích.
          </div>
        )}
      </section>
        {/* PLAYLIST GRID */}
      <section className="space-y-4">
         <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Playlist</h2>
          {playlists.length > playlistPreviewCount && (
            <button
              type="button"
              onClick={() => navigate("/library/playlists")}
              className="text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Xem tất cả
            </button>
          )}
        </div>
        {loadingPlaylists ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Đang tải playlist...
          </div>
        ) : visiblePlaylists.length ? (
          <div className="flex gap-5 overflow-x-auto pb-2">
            {visiblePlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id || playlist.title}
                playlist={playlist}
                onOpen={(pl) => pl?.id && navigate(`/playlists/${pl.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Bạn chưa tạo playlist nào.
          </div>
        )}
      </section>
 
      {/* LIKED SONGS */}
     <section>
  <LikedSongsSection
    songs={likedSongs}
    currentSong={currentSong}
    isPlaying={isPlaying}
    likedSongIds={likedSongIds}
    onPlay={(song) => handlePlaySong(song, likedQueue)}
    onToggleLike={toggleLike}
  />
</section>

    </div>
  );
}
