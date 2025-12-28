import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../api/playlist.api";
import { getArtistCollections } from "../api/artist.api";
import { getRecommendations } from "../api/recommendation.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import useAuthStore from "../store/auth.store";
import { fetchPlayableSong, filterPlayableSongs, toPlayableSong } from "../utils/song";
import { getSongById } from "../api/song.api";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingName, setCreatingName] = useState("");
  const [rename, setRename] = useState("");
  const [artists, setArtists] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const user = useAuthStore((s) => s.user);

  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
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
    } catch (err) {
      console.error("Load playlists failed", err);
      setPlaylists([]);
    } finally {
      setLoading(false);
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

  const loadRecommendations = useCallback(async () => {
    try {
      setRecommendationLoading(true);
      const res = await getRecommendations();
      const ids = res?.data?.data || [];

      const songs = await Promise.all(
        ids.slice(0, 12).map(async (id) => {
          try {
            const detail = await getSongById(id);
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
    loadPlaylists();
    loadArtists();
    loadRecommendations();
  }, [loadPlaylists, loadArtists, loadRecommendations]);

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

  const renamePlaylist = useCallback(
    async (id, name) => {
      if (!id || !name?.trim()) return;

      try {
        setSaving(true);
        await updatePlaylist(id, { name });
        setPlaylists((prev) =>
          prev.map((pl) => (pl.id === id ? { ...pl, title: name } : pl))
        );
        if (selectedId === id) setRename(name);
      } catch (err) {
        console.error("Update playlist failed", err);
      } finally {
        setSaving(false);
      }
    },
    [selectedId]
  );

  const handleRename = async (e) => {
    e.preventDefault();
    if (!selectedPlaylist?.id) return;

    await renamePlaylist(selectedPlaylist.id, rename.trim());
  };

  const handleDelete = async (id) => {
    const targetId = id ?? selectedPlaylist?.id;
    if (!targetId) return;
    try {
      setSaving(true);
      await deletePlaylist(targetId);
      setPlaylists((prev) => {
        const remaining = prev.filter((pl) => pl.id !== targetId);
        setSelectedId((current) => {
          if (current !== targetId) return current;
          return null;
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

  const updatePlaylistAfterChange = async (res) => {
    const updated = await hydratePlaylist(getData(res));
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id === selectedPlaylist.id ? updated : pl))
    );
  };

  const handleAddSuggestedSong = async (song) => {
    if (!selectedPlaylist?.id || !song) return;

    try {
      setSaving(true);
      const res = await addSongToPlaylist(selectedPlaylist.id, {
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
    if (!selectedPlaylist?.id) return;

    try {
      setSaving(true);
      const res = await removeSongFromPlaylist(
        selectedPlaylist.id,
        song.id ?? song.song_id
      );
      await updatePlaylistAfterChange(res);
    } catch (err) {
      console.error("Remove song failed", err);
    } finally {
      setSaving(false);
    }
  };

  const renderArtistSection = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Nghệ sĩ theo dõi</p>
          <h3 className="text-xl font-bold text-white">Bạn đang quan tâm</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {artists.length} nghệ sĩ
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {artists.slice(0, 6).map((artist) => (
          <div
            key={artist.artist_id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <img
              src={artist.cover_url}
              alt={artist.artist_name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {artist.artist_name}
              </p>
              <p className="text-xs text-white/60">{artist.song_count} bài hát</p>
            </div>
          </div>
        ))}

        {!artists.length && (
          <p className="col-span-2 text-sm text-white/60">
            Chưa có nghệ sĩ nào được theo dõi. Hãy khám phá trang chủ để tìm nghệ sĩ yêu thích.
          </p>
        )}
      </div>
    </div>
  );

  const renderPlaylistShelf = () => (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Playlist</p>
          <h3 className="text-xl font-bold text-white">Playlist của bạn</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {playlists.length} playlist
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {loading && <p className="text-sm text-white/60">Đang tải...</p>}

        {!loading && !playlists.length && (
          <p className="text-sm text-white/60">Chưa có playlist nào.</p>
        )}

        {playlists.map((pl) => {
          const cover = pl.songs?.[0]?.cover_url;
          return (
            <div
              key={pl.id}
              className={`group relative overflow-hidden rounded-2xl border shadow-lg transition ${
                selectedId === pl.id
                  ? "border-green-400/60 shadow-green-900/50"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => {
                  setSelectedId(pl.id);
                  setRename(pl.title || "");
                }}
                className="relative block w-full"
              >
                <div className="aspect-square w-full bg-white/5">
                  {cover ? (
                    <img
                      src={cover}
                      alt={pl.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-white/40">🎵</div>
                  )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const firstSong = pl.songs?.[0];
                      if (firstSong) handlePlaySong(firstSong);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow"
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newName = prompt("Đổi tên playlist", pl.title || "Playlist");
                      if (newName?.trim()) {
                        renamePlaylist(pl.id, newName.trim());
                      }
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pl.id);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white shadow"
                  >
                    ✕
                  </button>
                </div>
              </button>

              <div className="p-3">
                <p className="truncate text-sm font-semibold text-white">{pl.title || "Playlist"}</p>
                <p className="text-xs text-white/60">{pl.songs?.length || 0} bài hát</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSuggestedSongs = () => {
    if (!selectedPlaylist) return null;

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Gợi ý</p>
            <h3 className="text-xl font-bold text-white">Bài hát gợi ý</h3>
            <p className="text-sm text-white/60">Thêm nhanh sau khi tạo playlist</p>
          </div>
          <button
            onClick={loadRecommendations}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            Làm mới
          </button>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {recommendationLoading && (
            <p className="py-3 text-sm text-white/60">Đang tải gợi ý...</p>
          )}

          {!recommendationLoading && !recommendedSongs.length && (
            <p className="py-3 text-sm text-white/60">Chưa có gợi ý khả dụng.</p>
          )}

          {recommendedSongs.map((song) => (
            <div
              key={song.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                  <p className="truncate text-xs text-white/60">{song.artist_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySong(song)}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  ▶ Nghe thử
                </button>
                <button
                  onClick={() => handleAddSuggestedSong(song)}
                  disabled={saving}
                  className="rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-green-400/40 hover:bg-green-300 disabled:opacity-60"
                >
                  Thêm vào playlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSongList = () => {
    if (!selectedPlaylist) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          Chọn một playlist để xem chi tiết.
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-purple-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="relative h-40 w-40 overflow-hidden rounded-2xl shadow-lg shadow-black/40">
              {selectedPlaylist.songs?.[0]?.cover_url ? (
                <img
                  src={selectedPlaylist.songs[0].cover_url}
                  alt={selectedPlaylist.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl text-white/30">🎵</div>
              )}
              <button
                onClick={() => {
                  const firstSong = selectedPlaylist.songs?.[0];
                  if (firstSong) handlePlaySong(firstSong);
                }}
                className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
              >
                ▶
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Playlist</p>
              <h2 className="text-3xl font-bold text-white">{selectedPlaylist.title}</h2>
              <p className="text-sm text-white/70">{selectedPlaylist.songs?.length || 0} bài hát</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => refreshSelectedPlaylist(selectedPlaylist.id)}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Làm mới
                </button>
                <form onSubmit={handleRename} className="flex flex-wrap items-center gap-2">
                  <input
                    value={rename}
                    onChange={(e) => setRename(e.target.value)}
                    className="w-52 rounded-full bg-white/10 px-4 py-2 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                    placeholder="Tên playlist"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-900 shadow hover:bg-white"
                  >
                    Lưu tên
                  </button>
                </form>
                <button
                  onClick={() => handleDelete(selectedPlaylist.id)}
                  disabled={saving}
                  className="rounded-full border border-rose-300/40 bg-rose-400/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/30 disabled:opacity-50"
                >
                  Xóa playlist
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Danh sách</p>
              <h3 className="text-lg font-semibold text-white">Bài hát trong playlist</h3>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {(selectedPlaylist.songs || []).map((song, index) => {
              const songId = normalizeSongId(song);
              const isPlayingCurrent = normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);
              return (
                <div
                  key={song.id || index}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{song.title}</p>
                      <p className="truncate text-xs text-white/60">{song.artist_name || song.artist}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-white/60">{song.album_title || song.album || ""}</span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/60">{song.duration}</span>
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15"
                    >
                      {isPlayingCurrent && isPlaying ? "⏸" : "▶"}
                    </button>
                    <button
                      onClick={() => handleRemoveSong(song)}
                      disabled={saving}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 disabled:opacity-50"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => songId && toggleLike(songId)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                        isLiked
                          ? "border-rose-300/60 bg-rose-500/20 text-rose-200"
                          : "border-white/15 bg-white/10 text-white"
                      } hover:bg-white/15`}
                    >
                      ♥
                    </button>
                  </div>
                </div>
              );
            })}

            {!selectedPlaylist.songs?.length && (
              <p className="py-3 text-sm text-white/60">
                Chưa có bài hát nào trong playlist này.
              </p>
            )}
          </div>
        </div>

        {renderSuggestedSongs()}
      </div>
    );
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
              <p className="text-sm text-white/70">Nơi tổng hợp nghệ sĩ theo dõi và playlist tự tạo</p>
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

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          {renderArtistSection()}
          {renderPlaylistShelf()}
        </div>
        {renderSongList()}
      </div>
    </div>
  );
}