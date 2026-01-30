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
import Toast from "../components/common/Toast";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

// Chuẩn hoá key id để so sánh / filter (tránh khác shape: id, song_id, _id, ...)
const getSongKey = (song) => {
  const id = normalizeSongId(song) ?? song?.id ?? song?.song_id ?? song?._id;
  return id === undefined || id === null ? "" : String(id);
};

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rename, setRename] = useState("");
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");

  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();
  const playlistSongs = useMemo(() => playlist?.songs || [], [playlist?.songs]);

  // Set ids ổn định để loại trùng recommendations
  const playlistSongIds = useMemo(() => {
    return (playlist?.songs || [])
      .map((s) => getSongKey(s))
      .filter(Boolean);
  }, [playlist?.songs?.length]);

  // ========== Load playlist detail (return normalized để dùng ngay) ==========
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
      return normalized;
    } catch (err) {
      console.error("Load playlist detail failed", err);
      setPlaylist(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);
  // ========== Load recommendations (nhận excludeIds để luôn lọc đúng) ==========
  const loadRecommendations = useCallback(
    async (seedSongId, excludeSongIds = []) => {
      try {
        setRecommendationLoading(true);
        if (!seedSongId) {
          setRecommendedSongs([]);
          return;
        }
        const res = await getRecommendations(seedSongId);
        const items = res?.data?.data || res?.data || [];
        const ids = items
          .map((item) => item?.songId ?? item?.song_id ?? item?.id ?? item)
          .filter(Boolean);
        const excludeSet = new Set(
          (excludeSongIds || []).map(String).filter(Boolean)
        );
        const desiredCount = 12;
        const maxCandidates = Math.max(desiredCount * 2, desiredCount);
        const songs = await Promise.all(
          ids.slice(0, maxCandidates).map(async (songId) => {
            try {
              const detail = await getSongById(songId);
              return toPlayableSong(detail?.data?.data || detail?.data);
            } catch (error) {
              console.error("Load recommendation detail failed", error);
              return null;
            }
          })
        );
        // Loại null + loại trùng playlist + unique
        const unique = [];
        const seen = new Set();
        for (const song of songs) {
          if (!song) continue;
          const key = getSongKey(song);
          if (!key) continue;
          if (excludeSet.has(key)) continue;
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(song);

          if (unique.length >= desiredCount) break;
        }
        setRecommendedSongs(unique);
      } catch (err) {
        console.error("Load recommendations failed", err);
        setRecommendedSongs([]);
      } finally {
        setRecommendationLoading(false);
      }
    },
    [getRecommendations, getSongById]
  );
  // ========== Effect load tuần tự: playlist xong -> recommendations ==========
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const pl = await hydratePlaylist(); // ✅ chờ playlist về
      if (!mounted) return;
      const excludeIds = (pl?.songs || [])
        .map((s) => getSongKey(s))
        .filter(Boolean);
      const seedId =
        normalizeSongId(currentSong) || getSongKey(pl?.songs?.[0]);
      await loadRecommendations(seedId, excludeIds);
    })();
    return () => {
      mounted = false;
    };
  }, [id, hydratePlaylist, loadRecommendations, currentSong]);
  // ========== Play song ==========
  const handlePlaySong = async (song, queue = playlistSongs) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;
    const normalizedId = getSongKey(playable);
    const updatedQueue = (queue || []).map((item) => {
      const itemId = getSongKey(item);
      return itemId && itemId === normalizedId ? { ...item, ...playable } : item;
    });
    if (getSongKey(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
      playSong(playable, updatedQueue);
    }
  };
  // ========== Update playlist after add/remove ==========
  const updatePlaylistAfterChange = async (res) => {
    const updated = getData(res);
    const normalized = {
      ...updated,
      title: updated?.name || updated?.title || "Playlist",
      songs: filterPlayableSongs(updated?.songs || []),
    };
    setPlaylist(normalized);
  };

  // ========== Rename ==========
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

  // ========== Delete ==========
  const handleDelete = async () => {
    if (!playlist?.id) return;

    try {
      await deletePlaylist(playlist.id);

      setToastTitle("Thành công");
      setToastMessage(
        `Đã xóa playlist "${playlist?.title || playlist?.name || "Playlist"}"`
      );

      setTimeout(() => navigate("/playlists"), 800);
    } catch (err) {
      console.error("Delete playlist failed", err);
    }
  };

  // ========== Add suggested song ==========
  const handleAddSuggestedSong = async (song) => {
    if (!playlist?.id || !song) return;
    try {
      setSaving(true);
      const songId = getSongKey(song);
      if (!songId) return;
      const res = await addSongToPlaylist(playlist.id, { songId });
      await updatePlaylistAfterChange(res);
      setRecommendedSongs((prev) =>
        (prev || []).filter((item) => getSongKey(item) !== songId)
      );
      setToastTitle("Thành công");
      setToastMessage(`Đã thêm "${song?.title || "bài hát"}" vào playlist.`);
    } catch (err) {
      console.error("Add suggested song failed", err);
    } finally {
      setSaving(false);
    }
  };

  // ========== Remove song from playlist ==========
  const handleRemoveSong = async (song) => {
    if (!playlist?.id) return;

    try {
      setSaving(true);
      const songId = getSongKey(song);
      if (!songId) return;

      const res = await removeSongFromPlaylist(playlist.id, songId);
      await updatePlaylistAfterChange(res);
    } catch (err) {
      console.error("Remove song failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-[#121212] p-6 text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Đang tải playlist...
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#121212] p-6 text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Không tìm thấy playlist. Vui lòng thử lại.
        </div>
      </div>
    );
  }

  // ========== MAIN ==========
  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <Toast
        title={toastTitle}
        message={toastMessage}
        onClose={() => {
          setToastTitle("");
          setToastMessage("");
        }}
      />

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
        onRefresh={() =>
          loadRecommendations(
            normalizeSongId(currentSong) || getSongKey(playlistSongs?.[0]),
            playlistSongIds
          )
        } // ✅ refresh vẫn lọc đúng
        onPlay={(song) => handlePlaySong(song, recommendedSongs)}
        onAdd={handleAddSuggestedSong}
      />
    </div>
  );
}
