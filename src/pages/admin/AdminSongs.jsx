import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiDownload, FiInfo, FiRefreshCw, FiSlash } from "react-icons/fi";
import {
  approveSong,
  blockSong,
  listAdminSongs,
  searchAdmin,
} from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import { resolveAssetUrl } from "../../utils/asset";
import { toPlayableSong } from "../../utils/song";
import { promptAdminInput } from "../../utils/adminDialog";
import OptimizedImage from "../../components/common/OptimizedImage";
import Toast from "../../components/common/Toast";
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

const statusBadge = (status) => {
  switch (status) {
    case "approved":
      return "text-emerald-300";
    case "pending":
      return "text-amber-300";
    case "rejected":
      return "text-rose-300";
    default:
      return "text-white/60";
  }
};

const getSongCover = (song) =>
  song?.cover_url ||
  song?.cover ||
  song?.thumbnail ||
  song?.image ||
  song?.album_cover;

const getSongAudio = (song) => toPlayableSong(song).audio_url;

export default function AdminSongs() {
  const location = useLocation();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [missingAudioOnly, setMissingAudioOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 320);
  const pendingSongsCount = songs.filter((song) => song?.status === "pending").length;
  const approvedSongsCount = songs.filter((song) => song?.status === "approved").length;
  const missingAudioCount = songs.filter((song) => !getSongAudio(song)).length;

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

        const params = {
          page: 1,
          limit: 100,
          ...(statusValue ? { status: statusValue } : {}),
        };
        const res = await listAdminSongs(params);
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload)
          ? payload
          : payload.items || payload.songs || [];
      });

      setSongs(list);
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load songs timed out");
      } else {
        console.error("Load songs failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("bài hát", searchTerm));
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs(debouncedKeyword, statusFilter);
  }, [debouncedKeyword, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  useEffect(() => {
    const pendingToast = location.state?.toast;
    if (!pendingToast) return;
    setToast(pendingToast);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  useEffect(() => {
    setSelectedIds([]);
  }, [songs, statusFilter, keyword, missingAudioOnly]);

  const handleApprove = async (song) => {
    if (!getSongAudio(song)) {
      setToast({
        title: "Thiếu dữ liệu",
        message: "Bài hát chưa có file audio/mp3. Vui lòng kiểm tra trước khi duyệt.",
      });
      return;
    }
    try {
      const res = await approveSong(song.id);
      const updated = res?.data?.song ?? res?.data?.data ?? res?.data ?? song;
      setSongs((prev) => prev.map((item) => (item.id === song.id ? updated : item)));
      setToast({ title: "Thành công", message: "Đã duyệt bài hát." });
      await loadSongs(keyword.trim(), statusFilter);
    } catch (error) {
      console.error("Approve song failed", error);
      setToast({ title: "Lỗi", message: "Không thể duyệt bài hát." });
    }
  };

  const handleReject = async (song) => {
    const reason = await promptAdminInput({
      title: "Từ chối bài hát",
      message: "Nhập lý do từ chối bài hát",
      placeholder: "Nhập lý do...",
      confirmText: "Từ chối",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!reason?.trim()) return;
    try {
      const res = await blockSong(song.id, { reject_reason: reason.trim() });
      const updated = res?.data?.song ?? res?.data?.data ?? res?.data ?? song;
      setSongs((prev) => prev.map((item) => (item.id === song.id ? updated : item)));
      setToast({ title: "Thành công", message: "Đã từ chối bài hát." });
      await loadSongs(keyword.trim(), statusFilter);
    } catch (error) {
      console.error("Reject song failed", error);
      setToast({ title: "Lỗi", message: "Không thể từ chối bài hát." });
    }
  };

  const visibleSongs = useMemo(() => {
    if (!missingAudioOnly) return songs;
    return songs.filter((song) => !getSongAudio(song));
  }, [missingAudioOnly, songs]);

  const selectedSongs = useMemo(
    () => visibleSongs.filter((song) => selectedIds.includes(song.id)),
    [selectedIds, visibleSongs]
  );

  const allVisibleSelected = visibleSongs.length > 0 && selectedSongs.length === visibleSongs.length;

  const toggleSongSelection = (songId) => {
    setSelectedIds((prev) =>
      prev.includes(songId) ? prev.filter((item) => item !== songId) : [...prev, songId]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) =>
      allVisibleSelected ? prev.filter((id) => !visibleSongs.some((song) => song.id === id)) : visibleSongs.map((song) => song.id)
    );
  };

  const exportVisibleSongs = () => {
    if (!visibleSongs.length || typeof window === "undefined") return;

    const rows = [
      ["id", "title", "artist", "album", "status", "has_audio"],
      ...visibleSongs.map((song) => [
        song.id,
        `"${(song.title || "").replace(/"/g, '""')}"`,
        `"${(getArtistLabel(song, song.artist_name || "") || "").replace(/"/g, '""')}"`,
        `"${(song.album_title || "Single").replace(/"/g, '""')}"`,
        song.status || "",
        getSongAudio(song) ? "yes" : "no",
      ]),
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-song-review.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkApprove = async () => {
    if (!selectedSongs.length) return;

    try {
      let processedCount = 0;
      for (const song of selectedSongs) {
        if (!getSongAudio(song)) continue;
        await approveSong(song.id);
        processedCount += 1;
      }
      setToast({
        title: "Thành công",
        message: `Đã duyệt ${processedCount} bài hát đã chọn.`,
      });
      await loadSongs(keyword.trim(), statusFilter);
    } catch (error) {
      console.error("Bulk approve songs failed", error);
      setToast({ title: "Lỗi", message: "Không thể duyệt hàng loạt bài hát." });
    }
  };

  const handleBulkReject = async () => {
    if (!selectedSongs.length) return;

    const reason = await promptAdminInput({
      title: "Từ chối nhiều bài hát",
      message: "Nhập lý do chung cho các bài hát đã chọn",
      placeholder: "Nhập lý do...",
      confirmText: "Từ chối",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!reason?.trim()) return;

    try {
      for (const song of selectedSongs) {
        await blockSong(song.id, { reject_reason: reason.trim() });
      }
      setToast({
        title: "Thành công",
        message: `Đã từ chối ${selectedSongs.length} bài hát đã chọn.`,
      });
      await loadSongs(keyword.trim(), statusFilter);
    } catch (error) {
      console.error("Bulk reject songs failed", error);
      setToast({ title: "Lỗi", message: "Không thể từ chối hàng loạt bài hát." });
    }
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="admin-list-header">
        <div>
          <p className="admin-list-kicker">
            Quản trị
          </p>
          <h1 className="admin-list-title">Duyệt bài hát</h1>
          <p className="admin-list-summary">
            Ưu tiên kiểm duyệt, lọc nhanh các bài chờ xử lý và thao tác hàng loạt
            trong một giao diện gọn, rõ, không rối mắt.
          </p>
        </div>
        <div className="admin-toolbar-actions">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo bài hát, nghệ sĩ, album..."
            className="admin-field sm:w-72"
          />
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
          <button
            onClick={() => loadSongs(keyword.trim(), statusFilter)}
            className="admin-button"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={exportVisibleSongs}
            className="admin-button admin-button-ghost"
          >
            <FiDownload /> Xuất CSV
          </button>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Hiển thị</p>
          <p className="admin-stat-value">{visibleSongs.length}</p>
          <p className="admin-stat-note">Bài hát trong danh sách hiện tại</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Chờ duyệt</p>
          <p className="admin-stat-value">{pendingSongsCount}</p>
          <p className="admin-stat-note">Ưu tiên xử lý trước</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Đã duyệt</p>
          <p className="admin-stat-value">{approvedSongsCount}</p>
          <p className="admin-stat-note">Đã thông qua kiểm duyệt</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Thiếu mp3</p>
          <p className="admin-stat-value">{missingAudioCount}</p>
          <p className="admin-stat-note">Cần bổ sung file audio</p>
        </div>
      </div>

      <div className="admin-toolbar-panel">
        <div className="admin-toolbar-actions">
        <button
          type="button"
          onClick={() => {
            setStatusFilter("pending");
            setMissingAudioOnly(false);
          }}
          className={`admin-toggle-chip ${
            statusFilter === "pending" && !missingAudioOnly ? "is-active" : ""
          }`}
        >
          Chờ duyệt
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setMissingAudioOnly(true);
          }}
          className={`admin-toggle-chip ${missingAudioOnly ? "is-active" : ""}`}
        >
          Thiếu mp3
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setMissingAudioOnly(false);
          }}
          className={`admin-toggle-chip ${
            !statusFilter && !missingAudioOnly ? "is-active" : ""
          }`}
        >
          Toàn bộ
        </button>
        </div>
      </div>

      {selectedSongs.length ? (
        <div className="admin-toolbar-panel">
          <div className="text-sm text-white/78">
            Đã chọn <span className="font-semibold text-white">{selectedSongs.length}</span> bài hát
          </div>
          <div className="admin-toolbar-actions">
            <button
              type="button"
              onClick={handleBulkApprove}
              className="admin-button admin-button-success"
            >
              <FiCheckCircle />
              Duyệt đã chọn
            </button>
            <button
              type="button"
              onClick={handleBulkReject}
              className="admin-button admin-button-danger"
            >
              <FiSlash />
              Từ chối đã chọn
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="admin-button admin-button-ghost"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      ) : null}

      <AdminListNotice message={errorMessage} />

      <div className="admin-data-panel">
        <div className="admin-data-head grid grid-cols-[40px_1fr_auto] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[40px_1.5fr_1fr_0.6fr_0.9fr]">
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="h-4 w-4 rounded border-white/20 bg-transparent"
              aria-label="Chọn tất cả bài hát đang hiển thị"
            />
          </label>
          <span>Bài hát</span>
          <span className="hidden lg:block">Nghệ sĩ</span>
          <span className="hidden lg:block">Trạng thái</span>
          <span className="text-right">Hành động</span>
        </div>
        {loading ? (
          <AdminListLoadingState variant="songs" />
        ) : (
          <div className="divide-y divide-white/5">
            {visibleSongs.length === 0 ? (
            <div className="admin-empty-state">
              Không có bài hát phù hợp.
            </div>
            ) : (
              visibleSongs.map((song) => (
              <div
                key={song.id}
                className="admin-row-card grid grid-cols-[40px_1fr_auto] items-center gap-2 px-4 py-3 text-sm text-white/80 lg:grid-cols-[40px_1.5fr_1fr_0.6fr_0.9fr]"
              >
                <label className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(song.id)}
                    onChange={() => toggleSongSelection(song.id)}
                    className="h-4 w-4 rounded border-white/20 bg-transparent"
                    aria-label={`Chọn bài hát ${song.title}`}
                  />
                </label>
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
                    <p className="text-xs text-white/50">{song.album_title || "Single"}</p>
                    {!getSongAudio(song) && (
                      <p className="text-[11px] font-semibold text-rose-300">
                        Thiếu file mp3/audio
                      </p>
                    )}
                  </div>
                </div>
                <span className="hidden lg:block">
                  {getArtistLabel(song, song.artist_name || "") || "-"}
                </span>
                <span className={`hidden text-xs font-semibold lg:block ${statusBadge(song.status)}`}>
                  {song.status || "-"}
                </span>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => navigate(`/admin/songs/review/${song.id}`)}
                    aria-label="Xem chi tiết"
                    className="admin-button admin-button-ghost"
                  >
                    <FiInfo />
                    <span className="hidden lg:inline">Chi tiết</span>
                  </button>
                  {song.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(song)}
                      aria-label="Duyệt"
                      className="admin-button admin-button-success"
                    >
                      <FiCheckCircle />
                      <span className="hidden lg:inline">Duyệt</span>
                    </button>
                  )}
                  {song.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(song)}
                      aria-label="Từ chối"
                      className="admin-button admin-button-danger"
                    >
                      <FiSlash />
                      <span className="hidden lg:inline">Từ chối</span>
                    </button>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </div>

      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />
    </div>
  );
}


