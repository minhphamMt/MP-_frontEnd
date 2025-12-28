import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  addSongToPlaylist,
  deletePlaylist,
  getPlaylistById,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../api/playlist.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  toPlayableSong,
} from "../utils/song";
import PlaylistDetailHeader from "../components/playlists/PlaylistDetailHeader";
import PlaylistSongsTable from "../components/playlists/PlaylistSongsTable";
import PlaylistSuggestions from "../components/playlists/PlaylistSuggestions";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rename, setRename] = useState("");
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const playlistSongs = useMemo(
    () => playlist?.songs || [],
    [playlist?.songs]
  );

  const hydratePlaylist = useCallback(async () => {
    if (!id) return null;

    try {
      const res = await getPlaylistById(id);
      const data = getData(res) || {};
      const normalized = {
        ...data,
        title: data.name || data.title || "Playlist",
        songs: filterPlayableSongs(data.songs || []),
      };
      setPlaylist(normalized);
      setRename(normalized.title || "");
    } catch (err) {
      console.error("Load playlist detail failed", err);
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRecommendations = useCallback(async () => {
    try {
      setRecommendationLoading(true);
      const res = await getRecommendations();
      const ids = res?.data?.data || [];

      const songs = await Promise.all(
        ids.slice(0, 12).map(async (songId) => {
          try {
            const detail = await getSongById(songId);
            return toPlayableSong(detail?.data?.data || detail?.data);
          } catch (error) {
            console.error("Load recommendation detail failed", error);
            return null;
          }
        })
      );

      setRecommendedSongs(songs.filter((s) => s?.id));
    } catch (err) {
      console.error("Load recommendations failed", err);
      setRecommendedSongs([]);
    } finally {
      setRecommendationLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    hydratePlaylist();
    loadRecommendations();
  }, [hydratePlaylist, loadRecommendations]);

  const handlePlaySong = async (song, queue = playlistSongs) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
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

  const updatePlaylistAfterChange = async (res) => {
    const updated = getData(res);
    const normalized = {
      ...updated,
      title: updated?.name || updated?.title || "Playlist",
      songs: filterPlayableSongs(updated?.songs || []),
    };
    setPlaylist(normalized);
  };

  const handleRename = async (newName) => {
    const targetName = newName ?? rename;
    if (!playlist?.id || !targetName?.trim()) return;

    try {
      setSaving(true);
      await updatePlaylist(playlist.id, { name: targetName.trim() });
      setPlaylist((prev) => ({ ...prev, title: targetName.trim() }));
      setRename(targetName.trim());
    } catch (err) {
      console.error("Update playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!playlist?.id) return;

    try {
      await deletePlaylist(playlist.id);
      navigate("/playlists");
    } catch (err) {
      console.error("Delete playlist failed", err);
    }
  };

  const handleAddSuggestedSong = async (song) => {
    if (!playlist?.id || !song) return;

    try {
      setSaving(true);
      const res = await addSongToPlaylist(playlist.id, {
        songId: normalizeSongId(song) || song.id,
      });
      await updatePlaylistAfterChange(res);
    } catch (err) {
      console.error("Add suggested song failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (song) => {
    if (!playlist?.id) return;

    try {
      setSaving(true);
      const res = await removeSongFromPlaylist(
        playlist.id,
        song.id ?? song.song_id
      );
      await updatePlaylistAfterChange(res);
    } catch (err) {
      console.error("Remove song failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 bg-[#0c2144] p-4 sm:p-6 text-white/70">
        <p>Đang tải playlist...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="space-y-8 bg-[#0c2144] p-4 sm:p-6 text-white/70">
        <p>Không tìm thấy playlist. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#0c2144] p-4 sm:p-6">
      <PlaylistDetailHeader
        playlist={playlist}
        onPlay={handlePlaySong}
        onShuffle={() => {
          const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
          if (shuffled.length) handlePlaySong(shuffled[0], shuffled);
        }}
        onRename={() => {
          const newName = prompt("Đổi tên playlist", rename || playlist.title);
          if (newName?.trim()) {
            handleRename(newName.trim());
          }
        }}
        onDelete={handleDelete}
        renaming={saving}
      />

      <PlaylistSongsTable
        songs={playlistSongs}
        currentSong={currentSong}
        isPlaying={isPlaying}
        likedSongIds={likedSongIds}
        onPlay={handlePlaySong}
        onRemove={handleRemoveSong}
        onToggleLike={toggleLike}
      />

      <PlaylistSuggestions
        songs={recommendedSongs}
        loading={recommendationLoading}
        saving={saving}
        onRefresh={loadRecommendations}
        onPlay={(song) => handlePlaySong(song, recommendedSongs)}
        onAdd={handleAddSuggestedSong}
      />
    </div>
  );
}