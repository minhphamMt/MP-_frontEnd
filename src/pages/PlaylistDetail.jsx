import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiClock,
  FiEdit2,
  FiHeart,
  FiMusic,
  FiPause,
  FiPlay,
  FiShuffle,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

import {
  addSongToPlaylist,
  deletePlaylist,
  getPlaylistById,
  removeSongFromPlaylist,
  reorderSongInPlaylist,
  updatePlaylist,
} from "../api/playlist.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import OptimizedImage from "../components/common/OptimizedImage";
import ShareLinkButton from "../components/common/ShareLinkButton";
import Toast from "../components/common/Toast";
import PlaylistSongsTable from "../components/playlists/PlaylistSongsTable";
import PlaylistSuggestions from "../components/playlists/PlaylistSuggestions";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePageMetadata from "../hooks/usePageMetadata";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  formatDuration,
  hydrateSongArtists,
  toPlayableSong,
} from "../utils/song";

const getData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

const normalizePlaylist = (payload = {}) => ({
  ...payload,
  title: payload?.name || payload?.title || "Playlist",
  songs: filterPlayableSongs(payload?.songs || []),
});

const getSongKey = (song) => {
  const id = normalizeSongId(song) ?? song?.id ?? song?.song_id ?? song?._id;
  return id === undefined || id === null ? "" : String(id);
};

const moveListItem = (list = [], fromIndex, toIndex) => {
  const nextList = [...list];
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= nextList.length ||
    toIndex >= nextList.length
  ) {
    return nextList;
  }

  const [movedItem] = nextList.splice(fromIndex, 1);
  nextList.splice(toIndex, 0, movedItem);
  return nextList;
};

const formatPlaylistDuration = (songs = []) => {
  const totalSeconds = songs.reduce(
    (sum, item) => sum + Number(item?.duration || 0),
    0
  );

  if (!totalSeconds) return "0:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return formatDuration(totalSeconds);
};

function SectionHeader({ label, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="user-heading-label">{label}</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-white/65">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="user-soft-card px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
        <Icon className="text-white/60" />
        <span>{label}</span>
      </div>
      <p className="mt-3 text-lg font-bold text-white sm:text-xl">{value}</p>
      {helper ? <p className="mt-1 text-xs text-white/45">{helper}</p> : null}
    </article>
  );
}

export default function PlaylistDetail() {
  useEnsureLikedSongsLoaded();

  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [renameValue, setRenameValue] = useState("");
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
  const playlistSongIds = useMemo(
    () => playlistSongs.map((song) => getSongKey(song)).filter(Boolean),
    [playlistSongs]
  );

  const loadRecommendations = useCallback(async (seedSongId, excludeSongIds = []) => {
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

      const excludeSet = new Set((excludeSongIds || []).map(String).filter(Boolean));
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

      const unique = [];
      const seen = new Set();

      for (const song of songs) {
        if (!song) continue;
        const key = getSongKey(song);
        if (!key || excludeSet.has(key) || seen.has(key)) continue;
        seen.add(key);
        unique.push(song);
        if (unique.length >= desiredCount) break;
      }

      setRecommendedSongs(unique);
    } catch (error) {
      console.error("Load recommendations failed", error);
      setRecommendedSongs([]);
    } finally {
      setRecommendationLoading(false);
    }
  }, []);

  const loadPlaylist = useCallback(async () => {
    if (!id) {
      setPlaylist(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getPlaylistById(id);
      const normalized = normalizePlaylist(getData(res) || {});
      setPlaylist(normalized);
      setRenameValue(normalized.title || "");
      setErrorMessage("");
    } catch (error) {
      console.error("Load playlist detail failed", error);
      setPlaylist(null);
      setErrorMessage("Không thể tải playlist.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  useEffect(() => {
    const needsArtistHydration = playlistSongs.some((song) => {
      const hasArtists =
        Array.isArray(song?.artists) &&
        song.artists.some((artist) => artist?.name || artist?.alias);

      return !hasArtists && !song?.artist_name;
    });

    if (!needsArtistHydration) return;

    let mounted = true;

    (async () => {
      const hydratedSongs = await hydrateSongArtists(playlistSongs, getSongById);
      if (!mounted) return;

      setPlaylist((prev) => {
        if (!prev) return prev;
        return { ...prev, songs: hydratedSongs };
      });
    })();

    return () => {
      mounted = false;
    };
  }, [playlistSongs]);

  useEffect(() => {
    if (!playlist) return;

    const seedId = normalizeSongId(currentSong) || getSongKey(playlistSongs?.[0]);
    loadRecommendations(seedId, playlistSongIds);
  }, [currentSong, loadRecommendations, playlist, playlistSongIds, playlistSongs]);

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
      return;
    }

    playSong(playable, updatedQueue);
  };

  const handleShuffle = () => {
    const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
    if (shuffled.length) {
      handlePlaySong(shuffled[0], shuffled);
    }
  };

  const updatePlaylistAfterChange = (payload) => {
    const normalized = normalizePlaylist(getData(payload) || {});
    setPlaylist(normalized);
    setRenameValue(normalized.title || "");
    return normalized;
  };

  const handleRename = async (event) => {
    event.preventDefault();

    const nextName = renameValue.trim();
    if (!playlist?.id || !nextName) return;

    try {
      setSaving(true);
      const res = await updatePlaylist(playlist.id, { name: nextName });
      updatePlaylistAfterChange(res);
      setIsEditingName(false);
      setToastTitle("Thành công");
      setToastMessage(`Đã cập nhật playlist thành "${nextName}".`);
    } catch (error) {
      console.error("Update playlist failed", error);
      setToastTitle("Không thể cập nhật");
      setToastMessage("Hãy thử đổi tên lại sau ít phút.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!playlist?.id) return;

    const accepted = window.confirm(
      `Bạn có chắc muốn xóa playlist "${playlist?.title || "Playlist"}" không?`
    );
    if (!accepted) return;

    try {
      await deletePlaylist(playlist.id);
      setToastTitle("Thành công");
      setToastMessage(
        `Đã xóa playlist "${playlist?.title || playlist?.name || "Playlist"}".`
      );
      setTimeout(() => navigate("/playlists"), 700);
    } catch (error) {
      console.error("Delete playlist failed", error);
      setToastTitle("Không thể xóa playlist");
      setToastMessage("Hãy thử lại sau ít phút.");
    }
  };

  const handleAddSuggestedSong = async (song) => {
    if (!playlist?.id || !song) return;

    try {
      setSaving(true);
      const songId = getSongKey(song);
      if (!songId) return;

      const res = await addSongToPlaylist(playlist.id, { songId });
      updatePlaylistAfterChange(res);
      setRecommendedSongs((prev) =>
        (prev || []).filter((item) => getSongKey(item) !== songId)
      );
      setToastTitle("Thành công");
      setToastMessage(`Đã thêm "${song?.title || "bài hát"}" vào playlist.`);
    } catch (error) {
      console.error("Add suggested song failed", error);
      setToastTitle("Không thể thêm bài hát");
      setToastMessage("Bài hát chưa được thêm vào playlist. Hãy thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSong = async (song) => {
    if (!playlist?.id) return;

    try {
      setSaving(true);
      const songId = getSongKey(song);
      if (!songId) return;

      const res = await removeSongFromPlaylist(playlist.id, songId);
      updatePlaylistAfterChange(res);
      setToastTitle("Thành công");
      setToastMessage(`Đã gỡ "${song?.title || "bài hát"}" khỏi playlist.`);
    } catch (error) {
      console.error("Remove song failed", error);
      setToastTitle("Không thể gỡ bài hát");
      setToastMessage("Hãy thử lại sau ít phút.");
    } finally {
      setSaving(false);
    }
  };

  const handleReorderSong = async (fromIndex, toIndex) => {
    if (!playlist?.id) return;
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= playlistSongs.length ||
      toIndex >= playlistSongs.length
    ) {
      return;
    }

    const targetSong = playlistSongs[fromIndex];
    const songId = getSongKey(targetSong);
    if (!songId) return;

    const optimisticSongs = moveListItem(playlistSongs, fromIndex, toIndex);
    setPlaylist((prev) => (prev ? { ...prev, songs: optimisticSongs } : prev));

    try {
      setSaving(true);
      const res = await reorderSongInPlaylist(playlist.id, songId, {
        from_index: fromIndex,
        to_index: toIndex,
        fromIndex: fromIndex,
        toIndex: toIndex,
        target_index: toIndex,
        targetIndex: toIndex,
        new_index: toIndex,
        newIndex: toIndex,
        position: toIndex,
      });

      const payload = getData(res);
      if (payload?.songs || payload?.items || payload?.data) {
        updatePlaylistAfterChange(res);
      }
    } catch (error) {
      console.error("Reorder playlist song failed", error);
      setPlaylist((prev) => (prev ? { ...prev, songs: playlistSongs } : prev));
      setToastTitle("Không thể đổi thứ tự");
      setToastMessage("Bài hát chưa được sắp lại. Hãy thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const playlistCover = resolveAssetUrl(playlistSongs?.[0]?.cover_url);
  const uniqueArtistCount = useMemo(() => {
    const artistKeys = playlistSongs
      .flatMap((song) => {
        if (Array.isArray(song?.artists) && song.artists.length) {
          return song.artists.map(
            (artist) => artist?.id || artist?.artist_id || artist?.name || artist?.alias
          );
        }

        return [song?.artist_id || song?.artist_name];
      })
      .filter(Boolean);

    return new Set(artistKeys.map(String)).size;
  }, [playlistSongs]);

  const likedSongsInPlaylistCount = useMemo(() => {
    return playlistSongs.filter((song) => {
      const songId = getSongKey(song);
      return songId && likedSongIds.includes(songId);
    }).length;
  }, [likedSongIds, playlistSongs]);

  const summaryCards = useMemo(
    () => [
      {
        icon: FiMusic,
        label: "Bài hát",
        value: `${playlistSongs.length}`,
        helper: "Tổng số track hiện có",
      },
      {
        icon: FiClock,
        label: "Thời lượng",
        value: formatPlaylistDuration(playlistSongs),
        helper: "Tổng thời lượng phát liên tục",
      },
      {
        icon: FiUsers,
        label: "Nghệ sĩ",
        value: `${uniqueArtistCount}`,
        helper: "Số nghệ sĩ xuất hiện trong playlist",
      },
      {
        icon: FiHeart,
        label: "Bài đã thích",
        value: `${likedSongsInPlaylistCount}`,
        helper: "Track trong playlist đã được thả tim",
      },
    ],
    [likedSongsInPlaylistCount, playlistSongs, uniqueArtistCount]
  );
  const playlistPath = playlist?.id ? `/playlists/${playlist.id}` : id ? `/playlists/${id}` : "";
  const playlistMetaDescription = useMemo(() => {
    const parts = [
      `${playlistSongs.length} bài hát`,
      formatPlaylistDuration(playlistSongs),
      `${uniqueArtistCount} nghệ sĩ`,
    ].filter(Boolean);

    return parts.length
      ? `${parts.join(" • ")} trên Khoaluan Music.`
      : "Khám phá playlist trên Khoaluan Music.";
  }, [playlistSongs, uniqueArtistCount]);

  usePageMetadata({
    title: playlist?.title || "Playlist",
    description: playlistMetaDescription,
    image: playlistCover,
    url: playlistPath,
    type: "music.playlist",
  });

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="user-surface ui-skeleton h-[320px] bg-white/5" />
          <div className="user-surface ui-skeleton h-[320px] bg-white/5" />
        </div>
        <div className="user-surface ui-skeleton h-[360px] bg-white/5" />
        <div className="user-surface ui-skeleton h-[260px] bg-white/5" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full px-4 py-6 sm:px-8">
        <div className="user-surface flex min-h-[260px] items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="user-heading-label">Playlist</p>
            <h1 className="text-2xl font-black text-white">
              Không tìm thấy playlist
            </h1>
            <p className="text-sm text-white/60">
              {errorMessage || "Playlist này hiện chưa sẵn sàng để mở."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page-shell min-h-screen w-full max-w-full space-y-8 px-4 py-6 sm:px-8">
      <Toast
        title={toastTitle}
        message={toastMessage}
        onClose={() => {
          setToastTitle("");
          setToastMessage("");
        }}
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : null}

      <section className="user-surface relative overflow-hidden p-5 sm:p-6 lg:p-8">
        {playlistCover ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${playlistCover})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,185,84,0.22),_transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_35%)]" />
        <div className="pointer-events-none absolute -top-24 right-0 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[300px] xl:mx-0">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#171717] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              {playlistCover ? (
                <OptimizedImage
                  src={playlistCover}
                  alt={playlist?.title}
                  className="aspect-square h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-white/5 text-6xl text-white/35">
                  <FiMusic />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <p className="user-heading-label">Playlist cá nhân</p>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                {playlist?.title || "Playlist"}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-white/75 sm:text-[15px]">
                Nơi bạn gom lại những bài hát hợp mood để mở lên bất cứ lúc nào,
                từ những lúc cần nghe liền mạch đến khi chỉ muốn chọn đúng một bài.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {playlistSongs.length} bài hát
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {formatPlaylistDuration(playlistSongs)}
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {recommendedSongs.length} gợi ý thêm
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handlePlaySong(playlistSongs?.[0], playlistSongs)}
                disabled={!playlistSongs.length}
                className="user-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {getSongKey(currentSong) === getSongKey(playlistSongs?.[0]) &&
                isPlaying ? (
                  <FiPause className="text-base" />
                ) : (
                  <FiPlay className="text-base" />
                )}
                Phát tất cả
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                disabled={!playlistSongs.length}
                className="user-btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiShuffle />
                Phát ngẫu nhiên
              </button>

              <button
                type="button"
                onClick={() => setIsEditingName((prev) => !prev)}
                className="user-btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
              >
                <FiEdit2 />
                {isEditingName ? "Đóng chỉnh sửa" : "Đổi tên"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/15 px-5 py-3 text-sm font-semibold text-rose-100 transition md:hover:border-rose-200/60 md:hover:bg-rose-500/24"
              >
                <FiTrash2 />
                Xóa playlist
              </button>

              {false && <ShareLinkButton
                path={playlistPath}
                title="Chia sẻ playlist"
                shareTitle={playlist?.title || "Playlist"}
                shareText={`Nghe playlist ${playlist?.title || "này"} trên Khoaluan Music.`}
                preview={{
                  eyebrow: "Playlist",
                  title: playlist?.title || "Playlist",
                  subtitle: `${playlistSongs.length} bài hát • ${uniqueArtistCount} nghệ sĩ`,
                  description: `${formatPlaylistDuration(
                    playlistSongs
                  )} • ${likedSongsInPlaylistCount} bài đã thích`,
                  image: playlistCover,
                }}
                className="px-5 py-3"
              />}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((item) => (
                <StatCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  helper={item.helper}
                />
              ))}
            </div>
          </div>
        </div>

        {isEditingName ? (
          <div className="relative mt-6 rounded-[24px] border border-white/10 bg-[#121212]/90 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="user-heading-label">Chỉnh sửa</p>
                <h2 className="mt-2 text-xl font-black text-white">
                  Đổi tên playlist
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Chỉ cần một cái tên đúng mood là playlist đã mang cảm giác khác hẳn.
                </p>
              </div>

              <form
                onSubmit={handleRename}
                className="flex w-full flex-col gap-3 lg:max-w-[520px] lg:flex-row"
              >
                <input
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  className="user-input px-4 py-3 text-sm"
                  placeholder="Nhập tên playlist"
                />
                <button
                  type="submit"
                  disabled={saving || !renameValue.trim()}
                  className="user-btn-primary px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu tên mới"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      <section className="user-surface p-5 sm:p-6">
        <SectionHeader
          label="Tracklist"
          title="Bài hát trong playlist"
          description="Những bài hát đang nằm trong playlist, sẵn sàng để bạn nghe lại theo đúng mạch cảm xúc đã chọn."
          action={
            <span className="user-chip rounded-full px-3 py-1 text-xs font-medium">
              {playlistSongs.length} bài hát
            </span>
          }
        />

        <div className="mt-5">
          <PlaylistSongsTable
            songs={playlistSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            likedSongIds={likedSongIds}
            onPlay={handlePlaySong}
            onRemove={handleRemoveSong}
            onToggleLike={toggleLike}
          />
        </div>
      </section>

      <section className="user-surface p-5 sm:p-6">
        <SectionHeader
          label="Gợi ý"
          title="Bài hát có thể hợp với playlist này"
          description="Một vài bài hát có thể nối tiếp đúng không khí của playlist này."
          action={
            <button
              type="button"
              onClick={() =>
                loadRecommendations(
                  normalizeSongId(currentSong) || getSongKey(playlistSongs?.[0]),
                  playlistSongIds
                )
              }
              className="user-btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Làm mới gợi ý
            </button>
          }
        />

        <div className="mt-5">
          <PlaylistSuggestions
            songs={recommendedSongs}
            loading={recommendationLoading}
            saving={saving}
            onRefresh={() =>
              loadRecommendations(
                normalizeSongId(currentSong) || getSongKey(playlistSongs?.[0]),
                playlistSongIds
              )
            }
            onPlay={(song) => handlePlaySong(song, recommendedSongs)}
            onAdd={handleAddSuggestedSong}
          />
        </div>
      </section>
    </div>
  );
}
