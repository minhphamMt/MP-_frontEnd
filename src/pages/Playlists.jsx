import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  removeSongFromPlaylist,
  reorderSongInPlaylist,
  updatePlaylist,
} from "../api/playlist.api";
import SongTable from "../components/song/SongTable";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { fetchPlayableSong, filterPlayableSongs } from "../utils/song";
import { getSongById } from "../api/song.api";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingName, setCreatingName] = useState("");
  const [rename, setRename] = useState("");
  const [songId, setSongId] = useState("");
  const [songPosition, setSongPosition] = useState("");

  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
  } = usePlayerStore();

  const selectedPlaylist = useMemo(
    () => playlists.find((pl) => pl.id === selectedId),
    [playlists, selectedId]
  );

  const hydratePlaylist = useCallback(async (playlist) => {
    const normalized = {
      ...playlist,
      title: playlist.name || playlist.title || "Playlist",
    };

    if (playlist.songs?.length) {
      return {
        ...normalized,
        songs: filterPlayableSongs(playlist.songs),
      };
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

      if (!selectedId && hydrated.length) {
        setSelectedId(hydrated[0].id);
        setRename(hydrated[0].title || "");
      }
    } catch (err) {
      console.error("Load playlists failed", err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [hydratePlaylist, selectedId]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  useEffect(() => {
    if (selectedPlaylist) {
      setRename(selectedPlaylist.title || "");
    }
  }, [selectedPlaylist]);

  const refreshSelectedPlaylist = useCallback(
    async (id) => {
      const updated = await hydratePlaylist({ id, ...(selectedPlaylist || {}) });

      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === id ? { ...pl, ...updated } : pl))
      );
      setRename(updated.title || "");
    },
    [hydratePlaylist, selectedPlaylist]
  );

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!creatingName.trim()) return;

    try {
      setSaving(true);
      const res = await createPlaylist({ name: creatingName.trim() });
      const playlist = await hydratePlaylist(getData(res));

      setPlaylists((prev) => [playlist, ...prev]);
      setSelectedId(playlist.id);
      setRename(playlist.title || "");
      setCreatingName("");
    } catch (err) {
      console.error("Create playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!selectedPlaylist?.id) return;

    try {
      setSaving(true);
      await updatePlaylist(selectedPlaylist.id, { name: rename.trim() });
      setPlaylists((prev) =>
        prev.map((pl) =>
          pl.id === selectedPlaylist.id ? { ...pl, title: rename.trim() } : pl
        )
      );
    } catch (err) {
      console.error("Update playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlaylist?.id) return;
    try {
      setSaving(true);
      await deletePlaylist(selectedPlaylist.id);
      setPlaylists((prev) => {
        const remaining = prev.filter((pl) => pl.id !== selectedPlaylist.id);
        setSelectedId((current) => {
          if (current !== selectedPlaylist.id) return current;
          return remaining[0]?.id ?? null;
        });
        return remaining;
      });
    } catch (err) {
      console.error("Delete playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePlaySong = async (song) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = (selectedPlaylist?.songs || []).map((item) => {
      const itemId = normalizeSongId(item);
      return itemId && itemId === normalizedId ? { ...item, ...playable } : item;
    });

    if (normalizeSongId(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
      playSong(playable, updatedQueue);
    }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!selectedPlaylist?.id || !songId.trim()) return;

    try {
      setSaving(true);
      const res = await addSongToPlaylist(selectedPlaylist.id, {
        songId: songId.trim(),
        position: songPosition ? Number(songPosition) : undefined,
      });
      const updated = await hydratePlaylist(getData(res));
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === selectedPlaylist.id ? updated : pl))
      );
      setSongId("");
      setSongPosition("");
    } catch (err) {
      console.error("Add song failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (song) => {
    if (!selectedPlaylist?.id) return;

    try {
      setSaving(true);
      const res = await removeSongFromPlaylist(
        selectedPlaylist.id,
        song.id ?? song.song_id
      );
      const updated = await hydratePlaylist(getData(res));
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === selectedPlaylist.id ? updated : pl))
      );
    } catch (err) {
      console.error("Remove song failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (song, direction) => {
    if (!selectedPlaylist?.id || !song?.id) return;
    const currentIndex = selectedPlaylist.songs.findIndex(
      (s) => s.id === song.id
    );
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedPlaylist.songs.length) return;

    try {
      setSaving(true);
      const res = await reorderSongInPlaylist(selectedPlaylist.id, song.id, {
        position: targetIndex + 1,
      });
      const updated = await hydratePlaylist(getData(res));
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === selectedPlaylist.id ? updated : pl))
      );
    } catch (err) {
      console.error("Reorder song failed", err);
    } finally {
      setSaving(false);
    }
  };

  const renderPlaylistList = () => (
    <div className="space-y-4">
      <form
        onSubmit={handleCreatePlaylist}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20"
      >
        <h3 className="text-lg font-semibold text-white">Tạo playlist mới</h3>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={creatingName}
            onChange={(e) => setCreatingName(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Tên playlist"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-green-400/40 hover:bg-green-300 disabled:opacity-50"
          >
            Tạo
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/60 p-4 shadow-xl shadow-black/30">
        <h3 className="text-lg font-semibold text-white">Playlist của bạn</h3>
        <div className="mt-3 space-y-2 max-h-[420px] overflow-auto pr-2">
          {loading && <p className="text-sm text-white/60">Đang tải...</p>}

          {!loading && !playlists.length && (
            <p className="text-sm text-white/60">Chưa có playlist nào.</p>
          )}

          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => {
                setSelectedId(pl.id);
                setRename(pl.title || "");
              }}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                selectedId === pl.id
                  ? "border-green-300 bg-green-300/20 text-green-100"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              <p className="font-semibold">{pl.title || "Playlist"}</p>
              <p className="text-xs text-white/60">
                {pl.songs?.length || 0} bài hát
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSongList = () => {
    if (!selectedPlaylist) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
          Chọn một playlist để xem chi tiết.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/60 via-slate-900/80 to-slate-900/70 p-5 shadow-2xl shadow-purple-900/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Quản lý playlist
              </p>
              <h2 className="text-2xl font-bold text-white">{selectedPlaylist.title}</h2>
              <p className="text-sm text-white/60">
                {selectedPlaylist.songs?.length || 0} bài hát
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => refreshSelectedPlaylist(selectedPlaylist.id)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                Làm mới
              </button>

              <button
                onClick={handleDelete}
                disabled={selectedPlaylist.is_system || saving}
                className="rounded-full border border-rose-300/50 bg-rose-400/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/30 disabled:opacity-50"
              >
                Xóa playlist
              </button>
            </div>
          </div>

          <form
            onSubmit={handleRename}
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <input
              value={rename}
              onChange={(e) => setRename(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Tên playlist"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25 border border-white/20 disabled:opacity-50"
            >
              Cập nhật tên
            </button>
          </form>

          <form
            onSubmit={handleAddSong}
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]"
          >
            <input
              value={songId}
              onChange={(e) => setSongId(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="ID bài hát"
            />
            <input
              value={songPosition}
              onChange={(e) => setSongPosition(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Vị trí (tuỳ chọn)"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-green-400/40 hover:bg-green-300 disabled:opacity-50"
            >
              Thêm bài hát
            </button>
          </form>
        </div>

        <SongTable
          title="Bài hát trong playlist"
          subtitle="Chạm vào một bài để phát hoặc dùng các nút hành động để sắp xếp"
          songs={selectedPlaylist.songs || []}
          loading={loading || saving}
          onRefresh={() => refreshSelectedPlaylist(selectedPlaylist.id)}
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/30">
          <h3 className="text-lg font-semibold text-white">Quản lý bài hát</h3>
          <div className="mt-3 divide-y divide-white/5">
            {(selectedPlaylist.songs || []).map((song, index) => (
              <div
                key={song.id || index}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{song.title}</p>
                  <p className="text-xs text-white/60">{song.artist_name || song.artist}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePlaySong(song)}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    {normalizeSongId(currentSong) === normalizeSongId(song) && isPlaying
                      ? "Tạm dừng"
                      : "Phát"}
                  </button>

                  <button
                    onClick={() => handleReorder(song, "up")}
                    disabled={saving || index === 0}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    ↑ Lên
                  </button>

                  <button
                    onClick={() => handleReorder(song, "down")}
                    disabled={saving || index === (selectedPlaylist.songs || []).length - 1}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    ↓ Xuống
                  </button>

                  <button
                    onClick={() => handleRemoveSong(song)}
                    disabled={saving}
                    className="rounded-full border border-rose-300/40 bg-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/30 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {!selectedPlaylist.songs?.length && (
              <p className="py-3 text-sm text-white/60">
                Chưa có bài hát nào trong playlist này.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {renderPlaylistList()}
      {renderSongList()}
    </div>
  );
}