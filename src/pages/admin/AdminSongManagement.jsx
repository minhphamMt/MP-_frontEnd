import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit2, FiRefreshCw, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import {
  listAdminSongs,
  listGenres,
  searchAdmin,
  updateAdminSong,
  listUsers,
} from "../../api/admin.api";
import { getAlbums } from "../../api/album.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import { resolveAssetUrl } from "../../utils/asset";
import { deleteSong } from "../../api/song.api";
import useAuthStore from "../../store/auth.store";
import OptimizedImage from "../../components/common/OptimizedImage";
import Toast from "../../components/common/Toast";
import { confirmAdminAction } from "../../utils/adminDialog";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../../utils/adminListRequest";
import {
  extractAdminSearchItems,
  filterAdminSearchItemsByType,
} from "../../utils/adminSearch";
import { getArtistLabel } from "../../utils/artist";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const getStatusLabel = (status) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return "Không rõ";
  }
};

const getStatusChipClassName = (status) => {
  switch (status) {
    case "approved":
      return "admin-status-chip is-success";
    case "pending":
      return "admin-status-chip is-warning";
    case "rejected":
      return "admin-status-chip is-danger";
    default:
      return "admin-status-chip";
  }
};

const normalizeGenreValue = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) return genres.filter(Boolean);
  if (typeof genres === "string") {
    return genres.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getSongCover = (song) =>
  song?.cover_url ||
  song?.cover ||
  song?.thumbnail ||
  song?.image ||
  song?.album_cover;

export default function AdminSongManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const [editingSong, setEditingSong] = useState(null);
  const [autoOpenedId, setAutoOpenedId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const role = useAuthStore((state) => state.role);
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 320);
  const [editPayload, setEditPayload] = useState({
    title: "",
    artist_id: "",
    album_id: "",
    status: "",
    release_date: "",
    genres: [],
    cover_url: "",
  });

  const loadGenres = async () => {
    try {
      const res = await listGenres({ page: 1, limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.genres || [];
      setGenres(list);
    } catch (error) {
      console.error("Load genres failed", error);
      setGenres([]);
    }
  };

  const loadSongs = async (searchTerm = "", statusValue = statusFilter) => {
    try {
      setLoading(true);
      const list = await withAdminListTimeout(async () => {
        if (searchTerm) {
          const res = await searchAdmin({
            q: searchTerm,
            keyword: searchTerm,
            page: 1,
            limit: 100,
          });
          const payload = res?.data?.data ?? res?.data ?? [];
          const filtered = filterAdminSearchItemsByType(
            extractAdminSearchItems(payload),
            "song"
          );
          return statusValue
            ? filtered.filter((song) => song?.status === statusValue)
            : filtered;
        }

        const res = await listAdminSongs({
          page: 1,
          limit: 200,
          ...(statusValue ? { status: statusValue } : {}),
        });
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload)
          ? payload
          : payload.items || payload.songs || [];
      });

      setSongs(list);
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load admin songs timed out");
      } else {
        console.error("Load admin songs failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("bài hát", searchTerm));
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadArtists = async () => {
    try {
      const res = await listUsers({ role: "ARTIST", limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.users || [];
      setArtists(list);
    } catch (error) {
      console.error("Load artists failed", error);
      setArtists([]);
    }
  };

  const loadAlbums = async () => {
    try {
      const res = await getAlbums({ page: 1, limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.albums || [];
      setAlbums(list);
    } catch (error) {
      console.error("Load albums failed", error);
      setAlbums([]);
    }
  };

  useEffect(() => {
    loadGenres();
    loadArtists();
    loadAlbums();
  }, []);

  useEffect(() => {
    const pendingToast = location.state?.toast;
    if (!pendingToast) return;
    setToast(pendingToast);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  useEffect(() => {
    loadSongs(debouncedKeyword, statusFilter);
  }, [debouncedKeyword, statusFilter]);

  const handleEdit = (song) => {
    if (!song?.id) return;
    navigate(`/admin/songs/${song.id}/edit`);
  };

  const handleToggleGenre = (name) => {
    setEditPayload((prev) => {
      const exists = prev.genres.includes(name);
      return {
        ...prev,
        genres: exists
          ? prev.genres.filter((genre) => genre !== name)
          : [...prev.genres, name],
      };
    });
  };

  const handleUpdate = async () => {
    if (!editingSong) return;
    try {
      let payload = {
        title: editPayload.title || undefined,
        artist_id: editPayload.artist_id || null,
        album_id: editPayload.album_id || null,
        status: editPayload.status || undefined,
        release_date: editPayload.release_date || null,
        genres: editPayload.genres,
        cover_url: editPayload.cover_url || null,
      };

      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        Object.entries(payload).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") {
            return;
          }
          if (Array.isArray(value)) {
            value.filter(Boolean).forEach((item) => {
              formData.append(key, item);
            });
            return;
          }
          formData.append(key, value);
        });
        payload = formData;
      }

      await updateAdminSong(editingSong.id, payload);
      setEditingSong(null);
      setCoverFile(null);
      await loadSongs(keyword.trim(), statusFilter);
    } catch (error) {
      console.error("Update song failed", error);
      setToast({ title: "Lỗi", message: "Không thể cập nhật bài hát." });
    }
  };

  const handleSoftDelete = async () => {
    if (!editingSong) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm bài hát",
      message: `Bạn có chắc muốn xóa mềm bài hát "${editingSong.title}"?`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteSong(editingSong.id);
      setEditingSong(null);
      await loadSongs(keyword.trim(), statusFilter);
    } catch (error) {
      console.error("Soft delete song failed", error);
      setToast({ title: "Lỗi", message: "Không thể xóa mềm bài hát." });
    }
  };

  const filteredSongs = useMemo(() => {
    return songs.filter((song) =>
      statusFilter ? song?.status === statusFilter : true
    );
  }, [songs, statusFilter]);
  const approvedSongsCount = songs.filter((song) => song?.status === "approved").length;
  const pendingSongsCount = songs.filter((song) => song?.status === "pending").length;
  const linkedAlbumCount = songs.filter((song) => song?.album_id || song?.album_title).length;
  const artistOptions = useMemo(() => {
    const mapped = artists.map((artist) => ({
      id: `${artist.id}`,
      label: `${artist.id} - ${
        artist.display_name || artist.name || artist.email || "Nghệ sĩ"
      }`,
    }));
    if (
      editPayload.artist_id &&
      !mapped.some((item) => item.id === editPayload.artist_id)
    ) {
      mapped.unshift({
        id: editPayload.artist_id,
        label: `${editPayload.artist_id} - Nghệ sĩ hiện tại`,
      });
    }
    return mapped;
  }, [artists, editPayload.artist_id]);

  const albumOptions = useMemo(() => {
    const mapped = albums.map((album) => ({
      id: `${album.id}`,
      label: `${album.id} - ${album.title || "Album"}${
        getArtistLabel(album, album.artist?.name || album.artist_name || "")
          ? ` · ${getArtistLabel(album, album.artist?.name || album.artist_name || "")}`
          : ""
      }`,
    }));
    if (
      editPayload.album_id &&
      !mapped.some((item) => item.id === editPayload.album_id)
    ) {
      mapped.unshift({
        id: editPayload.album_id,
        label: `${editPayload.album_id} - Album hiện tại`,
      });
    }
    return mapped;
  }, [albums, editPayload.album_id]);

  const { visibleGenres, canToggleGenres } = useMemo(() => {
    const maxVisibleGenres = 8;
    if (showAllGenres) {
      return { visibleGenres: genres, canToggleGenres: genres.length > maxVisibleGenres };
    }
    const activeSet = new Set(editPayload.genres);
    const activeGenres = genres.filter((genre) => activeSet.has(genre.name));
    const inactiveGenres = genres.filter((genre) => !activeSet.has(genre.name));
    return {
      visibleGenres: [...activeGenres, ...inactiveGenres].slice(0, maxVisibleGenres),
      canToggleGenres: genres.length > maxVisibleGenres,
    };
  }, [editPayload.genres, genres, showAllGenres]);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    if (editPayload.cover_url) {
      return resolveAssetUrl(editPayload.cover_url);
    }
    if (editingSong && getSongCover(editingSong)) {
      return resolveAssetUrl(getSongCover(editingSong));
    }
    return null;
  }, [coverFile, editPayload.cover_url, editingSong]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get("targetId") || params.get("id");
    if (!targetId || targetId === autoOpenedId) return;
    const match = songs.find(
      (song) => `${song.id}` === `${targetId}` || `${song._id}` === `${targetId}`
    );
    if (match) {
      handleEdit(match);
      setAutoOpenedId(`${targetId}`);
    }
  }, [autoOpenedId, location.search, songs]);

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="admin-list-header">
        <div>
          <p className="admin-list-kicker">Quản trị</p>
          <h1 className="admin-list-title">Quản lý bài hát</h1>
          <p className="admin-list-summary">
            Theo dõi thư viện bài hát với danh sách gọn, rõ trạng thái và thao tác
            chỉnh sửa ngay trên một mặt phẳng dữ liệu thống nhất.
          </p>
        </div>
        <button
          onClick={() => loadSongs(keyword.trim(), statusFilter)}
          className="admin-button"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Hiển thị</p>
          <p className="admin-stat-value">{filteredSongs.length}</p>
          <p className="admin-stat-note">Bài hát trong danh sách hiện tại</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Chờ duyệt</p>
          <p className="admin-stat-value">{pendingSongsCount}</p>
          <p className="admin-stat-note">Cần xử lý trong hệ thống</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Đã duyệt</p>
          <p className="admin-stat-value">{approvedSongsCount}</p>
          <p className="admin-stat-note">Đã sẵn sàng hiển thị</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Có album</p>
          <p className="admin-stat-value">{linkedAlbumCount}</p>
          <p className="admin-stat-note">Đã liên kết album hoặc single</p>
        </div>
      </div>

      <div className="admin-toolbar-panel">
        <div className="admin-toolbar-group">
          <label className="admin-search-shell">
            <FiSearch className="admin-search-icon" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên bài hát, nghệ sĩ, album..."
              className="admin-field"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="admin-select-field"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AdminListNotice message={errorMessage} />

      <div className="admin-data-panel">
        <div className="admin-data-head grid grid-cols-[1fr_auto] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[1.35fr_0.8fr_0.75fr_0.55fr_0.72fr]">
          <span>Bài hát</span>
          <span className="hidden lg:block">Nghệ sĩ</span>
          <span className="hidden lg:block">Thể loại</span>
          <span className="hidden lg:block">Trạng thái</span>
          <span className="text-right">Hành động</span>
        </div>
        {loading ? (
          <AdminListLoadingState variant="song-management" />
        ) : (
          <div className="divide-y divide-white/5">
            {filteredSongs.length === 0 ? (
            <div className="admin-empty-state">
              Không có bài hát phù hợp.
            </div>
            ) : (
              filteredSongs.map((song) => (
              <div
                key={song.id}
                className="admin-row-card grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-sm text-white/80 lg:grid-cols-[1.35fr_0.8fr_0.75fr_0.55fr_0.72fr]"
              >
                <div className="flex items-center gap-3">
                  {getSongCover(song) ? (
                    <OptimizedImage
                      src={resolveAssetUrl(getSongCover(song))}
                      alt={song.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-[10px] text-white/60">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="admin-row-muted">
                      {song.album_title || "Single"}
                    </p>
                  </div>
                </div>
                <span className="hidden lg:block">
                  {getArtistLabel(song, song.artist_name || "") || "-"}
                </span>
                <span className="hidden text-xs text-white/60 lg:block">
                  {normalizeGenreValue(song.genres).join(", ") || "-"}
                </span>
                <div className="hidden lg:block">
                  <span className={getStatusChipClassName(song.status)}>
                    {getStatusLabel(song.status)}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleEdit(song)}
                    aria-label="Chỉnh sửa"
                    className="admin-button admin-button-ghost"
                  >
                    <FiEdit2 />
                    <span className="hidden lg:inline">Chỉnh sửa</span>
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </div>

      {editingSong && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24 pb-10 md:items-center md:py-10 lg:pl-64">
          <div className="flex w-full max-w-3xl max-h-[calc(100vh-6rem)] flex-col overflow-hidden admin-glass rounded-3xl border border-white/10 bg-[#181818] p-4 text-xs text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6 sm:text-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold sm:text-xl">Chỉnh sửa bài hát</h2>
              <button
                onClick={() => setEditingSong(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition md:hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1 sm:pr-2">
              <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">Ảnh đại diện</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {coverPreview ? (
                      <OptimizedImage
                        src={coverPreview}
                        alt={editPayload.title || "Song cover"}
                        className="h-56 w-full rounded-2xl bg-black/40 object-contain shadow-lg"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60 sm:text-sm">
                        Chưa có ảnh bài hát
                      </div>
                    )}
                    <input
                      value={editPayload.cover_url}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          cover_url: event.target.value,
                        }))
                      }
                      placeholder="Cover URL (nếu không upload)"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setCoverFile(event.target.files?.[0] || null)
                      }
                      className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 md:hover:border-white/20"
                    />
                  </div>
                </div>

                <div className="grid self-start content-start gap-4 sm:grid-cols-2">
                  <label className="block text-xs text-white/70 sm:col-span-2 sm:text-sm">
                    Tên bài hát
                    <input
                      value={editPayload.title}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                  </label>
                  <label className="block text-xs text-white/70 sm:text-sm">
                    Trạng thái
                    <select
                      value={editPayload.status}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                      className="ui-select mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white sm:text-sm"
                    >
                      <option value="" className="text-black">
                        Không đổi
                      </option>
                      <option value="pending" className="text-black">
                        pending
                      </option>
                      <option value="approved" className="text-black">
                        approved
                      </option>
                      <option value="rejected" className="text-black">
                        rejected
                      </option>
                    </select>
                  </label>
                {/* <label className="block text-sm text-white/70">
                Artist ID
                <select
                  value={editPayload.artist_id}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      artist_id: event.target.value,
                    }))
                  }
                   className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  <option value="" className="text-black">
                    Chọn nghệ sĩ
                  </option>
                  {artistOptions.map((artist) => (
                    <option key={artist.id} value={artist.id} className="text-black">
                      {artist.label}
                    </option>
                  ))}
                </select>
              </label> */}
                {/* <label className="block text-sm text-white/70">
                Album ID
                 <select
                  value={editPayload.album_id}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      album_id: event.target.value,
                    }))
                  }
                 className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  <option value="" className="text-black">
                    Chọn album
                  </option>
                  {albumOptions.map((album) => (
                    <option key={album.id} value={album.id} className="text-black">
                      {album.label}
                    </option>
                  ))}
                </select>
              </label> */}
                  <label className="block text-xs text-white/70 sm:text-sm">
                    Ngày phát hành
                    <input
                      type="date"
                      value={editPayload.release_date}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          release_date: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-white/70 sm:text-sm">Thể loại</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleGenres.map((genre) => {
                    const isActive = editPayload.genres.includes(genre.name);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => handleToggleGenre(genre.name)}
                        className={`rounded-full border px-4 py-1 text-xs transition ${
                          isActive
                            ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
                            : "border-white/10 bg-white/5 text-white/70 md:hover:border-white/30"
                        }`}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
                {canToggleGenres && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowAllGenres((prev) => !prev)}
                      className="text-xs font-semibold text-white/70 transition md:hover:text-white sm:text-sm"
                    >
                      {showAllGenres ? "Thu gọn" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
              {role === "ADMIN" && (
                <button
                  onClick={handleSoftDelete}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200 transition md:hover:bg-rose-500/20 sm:text-sm"
                >
                  <FiTrash2 /> Xoá mềm
                </button>
              )}
              <button
                onClick={() => setEditingSong(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition md:hover:bg-white/10 sm:text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300 sm:text-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />
    </div>
  );
}
