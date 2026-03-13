import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiDownload, FiInfo, FiRefreshCw, FiSlash } from "react-icons/fi";
import { approveSong, blockSong, listAdminSongs } from "../../api/admin.api";
import { resolveAssetUrl } from "../../utils/asset";
import { toPlayableSong } from "../../utils/song";
import { promptAdminInput } from "../../utils/adminDialog";
import OptimizedImage from "../../components/common/OptimizedImage";
import Toast from "../../components/common/Toast";
import { getArtistLabel } from "../../utils/artist";

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

  const loadSongs = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = keyword.trim();
      const params = {
        page: 1,
        limit: 100,
        ...(trimmedKeyword ? { keyword: trimmedKeyword, q: trimmedKeyword } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      };
      const res = await listAdminSongs(params);
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.songs || [];
      setSongs(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load songs failed", error);
      setErrorMessage("Không thể tải danh sách bài hát.");
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, [statusFilter, keyword]);

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
      await loadSongs();
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
      await loadSongs();
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

    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
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
      await loadSongs();
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
      await loadSongs();
    } catch (error) {
      console.error("Bulk reject songs failed", error);
      setToast({ title: "Lỗi", message: "Không thể từ chối hàng loạt bài hát." });
    }
  };

  return (
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">Duyệt bài hát</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo bài hát, nghệ sĩ, album..."
            className="ui-search-field w-full rounded-full px-4 py-2 text-xs font-semibold text-white/80 focus:border-white/30 focus:outline-none sm:w-72"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="ui-select rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-black">
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadSongs}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={exportVisibleSongs}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
          >
            <FiDownload /> Xuất CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setStatusFilter("pending");
            setMissingAudioOnly(false);
          }}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            statusFilter === "pending" && !missingAudioOnly
              ? "bg-amber-400/18 text-amber-100"
              : "border border-white/12 bg-white/[0.04] text-white/70 md:hover:bg-white/[0.08]"
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
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            missingAudioOnly
              ? "bg-rose-400/18 text-rose-100"
              : "border border-white/12 bg-white/[0.04] text-white/70 md:hover:bg-white/[0.08]"
          }`}
        >
          Thiếu mp3
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setMissingAudioOnly(false);
          }}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            !statusFilter && !missingAudioOnly
              ? "bg-emerald-400/18 text-emerald-100"
              : "border border-white/12 bg-white/[0.04] text-white/70 md:hover:bg-white/[0.08]"
          }`}
        >
          Toàn bộ
        </button>
      </div>

      {selectedSongs.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="text-sm text-white/78">
            Đã chọn <span className="font-semibold text-white">{selectedSongs.length}</span> bài hát
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBulkApprove}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/12 px-4 py-2 text-xs font-semibold text-emerald-100 transition md:hover:bg-emerald-500/18"
            >
              <FiCheckCircle />
              Duyệt đã chọn
            </button>
            <button
              type="button"
              onClick={handleBulkReject}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/35 bg-rose-500/12 px-4 py-2 text-xs font-semibold text-rose-100 transition md:hover:bg-rose-500/18"
            >
              <FiSlash />
              Từ chối đã chọn
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/75 transition md:hover:bg-white/[0.08]"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      ) : null}

      {errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden admin-glass rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[40px_1fr_auto] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[40px_1.5fr_1fr_0.6fr_0.9fr]">
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
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && visibleSongs.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có bài hát phù hợp.
            </div>
          )}
          {!loading &&
            visibleSongs.map((song) => (
              <div
                key={song.id}
                className="grid grid-cols-[40px_1fr_auto] items-center gap-2 px-4 py-3 text-sm text-white/80 lg:grid-cols-[40px_1.5fr_1fr_0.6fr_0.9fr]"
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
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 transition md:hover:bg-white/10"
                  >
                    <FiInfo />
                    <span className="hidden lg:inline">Chi tiết</span>
                  </button>
                  {song.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(song)}
                      aria-label="Duyệt"
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 transition md:hover:bg-emerald-500/20"
                    >
                      <FiCheckCircle />
                      <span className="hidden lg:inline">Duyệt</span>
                    </button>
                  )}
                  {song.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(song)}
                      aria-label="Từ chối"
                      className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition md:hover:bg-rose-500/20"
                    >
                      <FiSlash />
                      <span className="hidden lg:inline">Từ chối</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />
    </div>
  );
}


