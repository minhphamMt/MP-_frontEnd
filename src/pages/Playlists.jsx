import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiDisc,
  FiHeart,
  FiList,
  FiMusic,
  FiPlus,
  FiUsers,
} from "react-icons/fi";

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "../api/playlist.api";
import { getLikedAlbums, getLikedSongs } from "../api/like.api";
import { getSongById } from "../api/song.api";
import AlbumCard from "../components/album/AlbumCard";
import FilterToolbar from "../components/common/FilterToolbar";
import OptimizedImage from "../components/common/OptimizedImage";
import Toast from "../components/common/Toast";
import { UserSurfaceRowsLoading } from "../components/common/UserLoadingState";
import ArtistFollowSection from "../components/playlists/ArtistFollowSection";
import LikedSongsSection from "../components/playlists/LikedSongsSection";
import PlaylistGrid from "../components/playlists/PlaylistGrid";
import useArtistFollowStore from "../store/artist-follow.store";
import useAuthStore from "../store/auth.store";
import useAlbumLikeStore, { normalizeAlbumId } from "../store/album-like.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  toPlayableSong,
} from "../utils/song";
import { matchesAnyText, normalizeSearchText } from "../utils/searchText";

const ALBUM_PREVIEW_LIMIT = 6;
const ARTIST_PREVIEW_LIMIT = 6;
const LIKED_SONGS_PREVIEW_LIMIT = 10;
const LIBRARY_SCOPES = [
  { value: "all", label: "Tất cả" },
  { value: "playlists", label: "Playlist" },
  { value: "songs", label: "Bài hát" },
  { value: "albums", label: "Album" },
  { value: "artists", label: "Nghệ sĩ" },
];

const getPlaylistPreviewCount = () => {
  if (typeof window === "undefined") return 1;

  const width = window.innerWidth;
  if (width >= 1536) return 5;
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
};

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

const formatCount = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number.isFinite(Number(value)) ? Number(value) : 0);

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

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/60">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="user-btn-secondary mt-5 px-4 py-2 text-sm font-semibold"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function Playlists() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const followedArtists = useArtistFollowStore((state) => state.followedArtists);
  const loadFollowedArtists = useArtistFollowStore(
    (state) => state.loadFollowedArtists
  );
  const clearFollowedArtists = useArtistFollowStore(
    (state) => state.clearFollowedArtists
  );

  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [creatingName, setCreatingName] = useState("");
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingLikedSongs, setLoadingLikedSongs] = useState(true);
  const [loadingLikedAlbums, setLoadingLikedAlbums] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [playlistPreviewCount, setPlaylistPreviewCount] = useState(() =>
    getPlaylistPreviewCount()
  );
  const [libraryKeyword, setLibraryKeyword] = useState("");
  const [libraryScope, setLibraryScope] = useState("all");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");

  const likedAlbumIds = useAlbumLikeStore((state) => state.likedAlbumIds);
  const setLikedAlbumIds = useAlbumLikeStore((state) => state.setLikedAlbumIds);

  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    setLikedSongIds,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  useEffect(() => {
    setLikedAlbums((prev) =>
      (prev || []).filter((album) => {
        const id = normalizeAlbumId(album);
        return id && likedAlbumIds.includes(id);
      })
    );
  }, [likedAlbumIds]);

  useEffect(() => {
    setLikedSongs((prev) =>
      (prev || []).filter((song) => {
        const id = normalizeSongId(song);
        return id && likedSongIds.includes(id);
      })
    );
  }, [likedSongIds]);

  const hydratePlaylist = useCallback(async (playlist) => {
    const normalized = {
      ...playlist,
      title: playlist?.name || playlist?.title || "Playlist",
    };

    if (playlist?.songs?.length) {
      return { ...normalized, songs: filterPlayableSongs(playlist.songs) };
    }

    if (!playlist?.id) return { ...normalized, songs: [] };

    try {
      const res = await getPlaylistById(playlist.id);
      const songs = getData(res)?.songs || [];

      return {
        ...normalized,
        songs: filterPlayableSongs(songs),
      };
    } catch (error) {
      console.error("Load playlist detail failed", error);
      return { ...normalized, songs: [] };
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      setLoadingPlaylists(true);
      const res = await getPlaylists();
      const raw = getData(res) || [];
      const hydrated = await Promise.all(raw.map(hydratePlaylist));
      setPlaylists(hydrated);
    } catch (error) {
      console.error("Load playlists failed", error);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [hydratePlaylist]);

  const loadArtists = useCallback(async () => {
    if (!user?.id) {
      clearFollowedArtists();
      setLoadingArtists(false);
      return;
    }

    try {
      setLoadingArtists(true);
      await loadFollowedArtists();
    } finally {
      setLoadingArtists(false);
    }
  }, [clearFollowedArtists, loadFollowedArtists, user?.id]);

  const loadLikedSongsList = useCallback(async () => {
    try {
      setLoadingLikedSongs(true);
      const res = await getLikedSongs();
      const payload = getData(res);
      const songs = extractSongsFromResponse(payload);
      const playable = filterPlayableSongs(songs.map((song) => toPlayableSong(song)));
      setLikedSongIds(playable);
      setLikedSongs(playable);
    } catch (error) {
      console.error("Load liked songs failed", error);
      setLikedSongs([]);
    } finally {
      setLoadingLikedSongs(false);
    }
  }, [setLikedSongIds]);

  const loadLikedAlbumsList = useCallback(async () => {
    if (!user?.id) {
      setLikedAlbums([]);
      setLoadingLikedAlbums(false);
      return;
    }

    try {
      setLoadingLikedAlbums(true);
      const res = await getLikedAlbums();
      const payload = getData(res);
      const albums = Array.isArray(payload) ? payload : payload?.albums || [];
      setLikedAlbumIds(albums);
      setLikedAlbums(
        albums.map((album) => ({
          ...album,
          artist_name: album?.artist?.name || album?.artist_name || "",
        }))
      );
    } catch (error) {
      console.error("Load liked albums failed", error);
      setLikedAlbums([]);
    } finally {
      setLoadingLikedAlbums(false);
    }
  }, [setLikedAlbumIds, user?.id]);

  useEffect(() => {
    loadPlaylists();
    loadArtists();
    loadLikedSongsList();
    loadLikedAlbumsList();
  }, [loadArtists, loadLikedAlbumsList, loadLikedSongsList, loadPlaylists]);

  useEffect(() => {
    const handleResize = () => {
      setPlaylistPreviewCount(getPlaylistPreviewCount());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();

    const trimmedName = creatingName.trim();
    if (!trimmedName) return;

    const normalizedName = trimmedName.toLowerCase();
    const duplicate = playlists.some(
      (playlist) =>
        (playlist?.name || playlist?.title || "").trim().toLowerCase() ===
        normalizedName
    );

    if (duplicate) {
      setToastTitle("Thông báo");
      setToastMessage(`Playlist "${trimmedName}" đã tồn tại.`);
      return;
    }

    try {
      setSaving(true);
      const res = await createPlaylist({ name: trimmedName });
      const playlist = await hydratePlaylist(getData(res));
      setPlaylists((prev) => [playlist, ...prev]);
      setCreatingName("");
      setToastTitle("Thành công");
      setToastMessage(
        `Đã tạo playlist "${playlist?.title || playlist?.name || trimmedName}".`
      );

      if (playlist?.id) {
        setTimeout(() => navigate(`/playlists/${playlist.id}`), 600);
      }
    } catch (error) {
      console.error("Create playlist failed", error);
      setToastTitle("Không thể tạo playlist");
      setToastMessage("Hãy thử lại sau ít phút.");
    } finally {
      setSaving(false);
    }
  };

  const likedQueue = useMemo(() => likedSongs || [], [likedSongs]);

  const handlePlaySong = async (song, queue = likedQueue) => {
    const prepared = toPlayableSong(song);
    const playable = (await fetchPlayableSong(prepared, getSongById)) || prepared;
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
      return;
    }

    playSong(playable, updatedQueue);
  };

  const displayName =
    user?.display_name || user?.name || user?.username || "bạn";

  const heroImage = useMemo(() => {
    return resolveAssetUrl(
      user?.avatar_url ||
        playlists?.[0]?.songs?.[0]?.cover_url ||
        likedSongs?.[0]?.cover_url ||
        likedAlbums?.[0]?.cover_url ||
        followedArtists?.[0]?.cover_url
    );
  }, [followedArtists, likedAlbums, likedSongs, playlists, user?.avatar_url]);

  const summaryCards = useMemo(
    () => [
      {
        icon: FiList,
        label: "Playlist tự tạo",
        value: formatCount(playlists.length),
        helper: "Danh sách bạn tự tay sắp xếp",
      },
      {
        icon: FiHeart,
        label: "Bài hát đã thích",
        value: formatCount(likedSongs.length),
        helper: "Những bài hát lưu để nghe lại",
      },
      {
        icon: FiDisc,
        label: "Album yêu thích",
        value: formatCount(likedAlbums.length),
        helper: "Các album bạn đã thả tim",
      },
      {
        icon: FiUsers,
        label: "Nghệ sĩ theo dõi",
        value: formatCount(followedArtists.length),
        helper: "Các nghệ sĩ bạn đang quan tâm",
      },
    ],
    [followedArtists.length, likedAlbums.length, likedSongs.length, playlists.length]
  );

  const normalizedLibraryKeyword = useMemo(
    () => normalizeSearchText(libraryKeyword),
    [libraryKeyword]
  );

  const filteredPlaylists = useMemo(() => {
    if (!normalizedLibraryKeyword) return playlists;

    return playlists.filter((playlist) =>
      matchesAnyText(
        [
          playlist?.title,
          playlist?.name,
          ...(playlist?.songs || []).flatMap((song) => [
            song?.title,
            song?.artist_name,
            song?.album_title,
          ]),
        ],
        normalizedLibraryKeyword
      )
    );
  }, [normalizedLibraryKeyword, playlists]);

  const filteredLikedSongs = useMemo(() => {
    if (!normalizedLibraryKeyword) return likedSongs;

    return likedSongs.filter((song) =>
      matchesAnyText(
        [song?.title, song?.artist_name, song?.album_title, song?.album],
        normalizedLibraryKeyword
      )
    );
  }, [likedSongs, normalizedLibraryKeyword]);

  const filteredLikedAlbums = useMemo(() => {
    if (!normalizedLibraryKeyword) return likedAlbums;

    return likedAlbums.filter((album) =>
      matchesAnyText(
        [album?.title, album?.artist_name, album?.artist?.name],
        normalizedLibraryKeyword
      )
    );
  }, [likedAlbums, normalizedLibraryKeyword]);

  const filteredArtists = useMemo(() => {
    if (!normalizedLibraryKeyword) return followedArtists;

    return followedArtists.filter((artist) =>
      matchesAnyText(
        [artist?.artist_name, artist?.name, artist?.alias],
        normalizedLibraryKeyword
      )
    );
  }, [followedArtists, normalizedLibraryKeyword]);

  const visiblePlaylists = useMemo(
    () => filteredPlaylists.slice(0, playlistPreviewCount),
    [filteredPlaylists, playlistPreviewCount]
  );
  const visibleAlbums = useMemo(
    () => filteredLikedAlbums.slice(0, ALBUM_PREVIEW_LIMIT),
    [filteredLikedAlbums]
  );
  const visibleArtists = useMemo(
    () => filteredArtists.slice(0, ARTIST_PREVIEW_LIMIT),
    [filteredArtists]
  );

  const hasMorePlaylists = filteredPlaylists.length > playlistPreviewCount;
  const hasMoreAlbums = filteredLikedAlbums.length > ALBUM_PREVIEW_LIMIT;
  const hasMoreArtists = filteredArtists.length > ARTIST_PREVIEW_LIMIT;
  const hasMoreLikedSongs =
    filteredLikedSongs.length > LIKED_SONGS_PREVIEW_LIMIT;
  const hasLibraryFilter =
    normalizedLibraryKeyword.length > 0 || libraryScope !== "all";
  const visibleSection = (scope) =>
    libraryScope === "all" || libraryScope === scope;
  const hasFilteredResults =
    filteredPlaylists.length ||
    filteredLikedSongs.length ||
    filteredLikedAlbums.length ||
    filteredArtists.length;
  const librarySummaryText = hasLibraryFilter
    ? `Đang hiển thị ${filteredPlaylists.length} playlist, ${filteredLikedSongs.length} bài hát, ${filteredLikedAlbums.length} album và ${filteredArtists.length} nghệ sĩ khớp bộ lọc hiện tại.`
    : "Lọc nhanh playlist, bài hát, album và nghệ sĩ ngay trong thư viện mà không cần rời trang.";

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

      <section className="user-surface relative overflow-hidden p-5 sm:p-6 lg:p-8">
        {heroImage ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,185,84,0.24),_transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_34%)]" />
        <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="min-w-0 space-y-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#161616] shadow-[0_18px_50px_rgba(0,0,0,0.36)] sm:h-28 sm:w-28">
                {user?.avatar_url ? (
                  <OptimizedImage
                    src={resolveAssetUrl(user.avatar_url)}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-white/45">
                    {displayName?.[0]?.toUpperCase() || "M"}
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-3">
                <p className="user-heading-label">Thư viện cá nhân</p>
                <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                  Playlist của {displayName}
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-white/72 sm:text-[15px]">
                  Góc nghe nhạc riêng để giữ lại playlist, bài hát, album và
                  những nghệ sĩ bạn muốn quay lại bất cứ lúc nào.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {formatCount(playlists.length)} playlist
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {formatCount(likedSongs.length)} bài hát đã thích
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {formatCount(likedAlbums.length)} album yêu thích
              </span>
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

          <aside className="user-soft-card self-start p-4 sm:p-5">
            <p className="user-heading-label">Tạo nhanh</p>
            <h2 className="mt-3 text-xl font-black text-white">
              Tạo playlist mới
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Đặt tên playlist mới để lưu mood, thể loại hoặc danh sách nghe
              riêng của bạn.
            </p>

            <form onSubmit={handleCreatePlaylist} className="mt-5 space-y-3">
              <input
                value={creatingName}
                onChange={(event) => setCreatingName(event.target.value)}
                className="user-input px-4 py-3 text-sm"
                placeholder="Ví dụ: Chill cuối tuần"
              />
              <button
                type="submit"
                disabled={saving}
                className="user-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiPlus />
                {saving ? "Đang tạo..." : "Tạo playlist"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {playlists?.[0]?.id ? (
                <button
                  type="button"
                  onClick={() => navigate(`/playlists/${playlists[0].id}`)}
                  className="user-btn-secondary px-4 py-2 text-xs font-semibold"
                >
                  Mở playlist gần nhất
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => navigate("/library/liked-songs")}
                className="user-btn-secondary px-4 py-2 text-xs font-semibold"
              >
                Xem bài hát đã thích
              </button>
            </div>
          </aside>
        </div>
      </section>

      <FilterToolbar
        value={libraryKeyword}
        onChange={setLibraryKeyword}
        placeholder="Tìm playlist, bài hát, album hoặc nghệ sĩ trong thư viện"
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              <FiClock />
              Nghe gần đây
            </button>
            {hasLibraryFilter ? (
              <button
                type="button"
                onClick={() => {
                  setLibraryKeyword("");
                  setLibraryScope("all");
                }}
                className="user-btn-secondary px-4 py-2 text-sm font-semibold"
              >
                Xóa bộ lọc
              </button>
            ) : null}
          </>
        }
        summary={librarySummaryText}
      >
        <div className="flex flex-wrap gap-2">
          {LIBRARY_SCOPES.map((scope) => {
            const isActive = libraryScope === scope.value;
            return (
              <button
                key={scope.value}
                type="button"
                onClick={() => setLibraryScope(scope.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-emerald-400/16 text-emerald-100 ring-1 ring-inset ring-emerald-300/30"
                    : "bg-white/[0.05] text-white/65 ring-1 ring-inset ring-white/10 md:hover:bg-white/[0.08] md:hover:text-white"
                }`}
              >
                {scope.label}
              </button>
            );
          })}
        </div>
      </FilterToolbar>

      {!loadingPlaylists &&
      !loadingLikedSongs &&
      !loadingLikedAlbums &&
      !loadingArtists &&
      !hasFilteredResults ? (
        <EmptyState
          title="Không có mục nào khớp bộ lọc"
          description="Thử đổi từ khóa hoặc chuyển lại phạm vi hiển thị để xem thêm nội dung trong thư viện của bạn."
          actionLabel="Xóa bộ lọc"
          onAction={() => {
            setLibraryKeyword("");
            setLibraryScope("all");
          }}
        />
      ) : null}

      {visibleSection("playlists") ? (
        <section className="user-surface p-5 sm:p-6">
          <SectionHeader
            label="Playlist"
            title="Playlist tự tạo"
            description="Những playlist bạn tạo gần đây để mở lại nhanh mỗi khi cần một mood quen thuộc."
            action={
              hasMorePlaylists ? (
                <button
                  type="button"
                  onClick={() => navigate("/library/playlists")}
                  className="user-btn-secondary px-4 py-2 text-sm font-semibold"
                >
                  Xem tất cả
                </button>
              ) : null
            }
          />

          {loadingPlaylists ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: playlistPreviewCount }).map((_, index) => (
                <div
                  key={`playlist-skeleton-${index}`}
                  className="ui-skeleton h-[228px] rounded-[20px] border border-white/10"
                />
              ))}
            </div>
          ) : filteredPlaylists.length ? (
            <div className="mt-5">
              <PlaylistGrid
                playlists={visiblePlaylists}
                onOpen={(playlist) =>
                  playlist?.id && navigate(`/playlists/${playlist.id}`)
                }
                variant="library"
              />
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title={
                  hasLibraryFilter
                    ? "Không có playlist khớp"
                    : "Bạn chưa có playlist nào"
                }
                description={
                  hasLibraryFilter
                    ? "Thử đổi từ khóa tìm kiếm hoặc chuyển về phạm vi khác để xem thêm playlist."
                    : "Tạo playlist đầu tiên để bắt đầu gom lại những bài hát hợp gu nghe của riêng bạn."
                }
              />
            </div>
          )}
        </section>
      ) : null}

      {visibleSection("songs") ? (
        <section className="user-surface p-5 sm:p-6">
          {loadingLikedSongs ? (
            <UserSurfaceRowsLoading rows={4} />
          ) : (
            <LikedSongsSection
              songs={filteredLikedSongs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              likedSongIds={likedSongIds}
              onPlay={(song) => handlePlaySong(song, filteredLikedSongs)}
              onToggleLike={toggleLike}
              limit={LIKED_SONGS_PREVIEW_LIMIT}
              showViewAll={hasMoreLikedSongs}
              onViewAll={() => navigate("/library/liked-songs")}
            />
          )}
        </section>
      ) : null}

      {(visibleSection("albums") || visibleSection("artists")) && (
        <div className="grid gap-8 xl:grid-cols-2">
          {visibleSection("albums") ? (
            <section className="user-surface p-5 sm:p-6">
              <SectionHeader
                label="Album"
                title="Album yêu thích"
                description="Những album bạn muốn giữ lại để mở nghe trọn vẹn bất cứ lúc nào."
                action={
                  hasMoreAlbums ? (
                    <button
                      type="button"
                      onClick={() => navigate("/library/liked-albums")}
                      className="user-btn-secondary px-4 py-2 text-sm font-semibold"
                    >
                      Xem tất cả
                    </button>
                  ) : null
                }
              />

              {loadingLikedAlbums ? (
                <div className="mt-5 grid gap-4 min-[540px]:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={`album-skeleton-${index}`}
                      className="ui-skeleton h-[280px] rounded-[24px] border border-white/10"
                    />
                  ))}
                </div>
              ) : filteredLikedAlbums.length ? (
                <div className="mt-5 grid gap-4 min-[540px]:grid-cols-2">
                  {visibleAlbums.map((album) => (
                    <AlbumCard
                      key={album.id || album.title}
                      album={album}
                      variant="library"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    title={
                      hasLibraryFilter
                        ? "Không có album khớp"
                        : "Chưa có album yêu thích"
                    }
                    description={
                      hasLibraryFilter
                        ? "Thử đổi từ khóa hoặc xóa bộ lọc để xem lại các album bạn đã lưu."
                        : "Khi bạn thả tim một album, nó sẽ nằm lại ở đây để bạn mở nghe bất cứ lúc nào."
                    }
                    actionLabel={hasLibraryFilter ? "" : "Khám phá thêm album"}
                    onAction={
                      hasLibraryFilter ? undefined : () => navigate("/albums")
                    }
                  />
                </div>
              )}
            </section>
          ) : null}

          {visibleSection("artists") ? (
            <section className="user-surface p-5 sm:p-6">
              <SectionHeader
                label="Nghệ sĩ"
                title="Nghệ sĩ theo dõi"
                description="Những nghệ sĩ bạn yêu thích được giữ lại ở đây để bạn ghé lại nhanh hơn."
                action={
                  hasMoreArtists ? (
                    <button
                      type="button"
                      onClick={() => navigate("/library/followed-artists")}
                      className="user-btn-secondary px-4 py-2 text-sm font-semibold"
                    >
                      Xem tất cả
                    </button>
                  ) : null
                }
              />

              {loadingArtists ? (
                <div className="mt-5 grid gap-4 min-[540px]:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={`artist-skeleton-${index}`}
                      className="ui-skeleton h-[280px] rounded-[24px] border border-white/10"
                    />
                  ))}
                </div>
              ) : filteredArtists.length ? (
                <div className="mt-5">
                  <ArtistFollowSection
                    artists={visibleArtists}
                    cardVariant="library"
                    gridClassName="grid gap-4 min-[540px]:grid-cols-2"
                  />
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    title={
                      hasLibraryFilter
                        ? "Không có nghệ sĩ khớp"
                        : "Bạn chưa theo dõi nghệ sĩ nào"
                    }
                    description={
                      hasLibraryFilter
                        ? "Thử đổi từ khóa hoặc quay lại phạm vi tất cả để xem thêm nghệ sĩ đã theo dõi."
                        : "Theo dõi nghệ sĩ bạn yêu thích để giữ họ lại trong thư viện riêng."
                    }
                    actionLabel={hasLibraryFilter ? "" : "Mở trang khám phá"}
                    onAction={hasLibraryFilter ? undefined : () => navigate("/")}
                  />
                </div>
              )}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
