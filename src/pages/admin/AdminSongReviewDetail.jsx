import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiChevronLeft, FiRefreshCw, FiSlash } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { approveSong, blockSong, listAdminSongs } from "../../api/admin.api";
import { getSongById } from "../../api/song.api";
import { resolveAssetUrl } from "../../utils/asset";
import { toPlayableSong } from "../../utils/song";
import { promptAdminInput } from "../../utils/adminDialog";
import OptimizedImage from "../../components/common/OptimizedImage";
import Toast from "../../components/common/Toast";
import { getArtistLabel } from "../../utils/artist";

const getSongCover = (song) =>
  song?.cover_url ||
  song?.cover ||
  song?.thumbnail ||
  song?.image ||
  song?.album_cover;

const getSongAudio = (song) => (song ? toPlayableSong(song).audio_url : "");

const getStatusLabel = (status) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return "Chưa rõ";
  }
};

const getStatusChipClass = (status) => {
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

export default function AdminSongReviewDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  const loadSongDetail = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy bài hát.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      let detail = null;
      try {
        const detailRes = await getSongById(id);
        const payload = detailRes?.data?.data ?? detailRes?.data ?? null;
        detail = payload?.song || payload;
      } catch (error) {
        console.error("Load song detail by id failed", error);
      }

      let adminDetail = null;
      try {
        const reviewRes = await listAdminSongs({
          page: 1,
          limit: 100,
          keyword: id,
          q: id,
        });
        const payload = reviewRes?.data?.data ?? reviewRes?.data ?? [];
        const list = Array.isArray(payload)
          ? payload
          : payload.items || payload.songs || [];
        adminDetail = list.find((item) => `${item.id}` === `${id}` || `${item._id}` === `${id}`);
      } catch (error) {
        console.error("Load admin songs failed", error);
      }

      const merged = {
        ...(detail || {}),
        ...(adminDetail || {}),
        id: adminDetail?.id || detail?.id || id,
      };

      if (!merged?.id) {
        setSong(null);
        setErrorMessage("Không thể tải thông tin bài hát.");
        return;
      }

      setSong(merged);
    } catch (error) {
      console.error("Load review song detail failed", error);
      setSong(null);
      setErrorMessage("Không thể tải thông tin bài hát.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongDetail();
  }, [id]);

  const songAudioUrl = useMemo(() => {
    const audio = getSongAudio(song);
    return audio ? resolveAssetUrl(audio) : "";
  }, [song]);

  const songCoverUrl = useMemo(() => {
    const cover = getSongCover(song);
    return cover ? resolveAssetUrl(cover) : "";
  }, [song]);

  const handleApprove = async () => {
    if (!song?.id) return;
    if (!songAudioUrl) {
      setToast({
        title: "Thiếu dữ liệu",
        message: "Bài hát chưa có file audio/mp3. Vui lòng kiểm tra trước khi duyệt.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await approveSong(song.id);
      setToast({ title: "Thành công", message: "Đã duyệt bài hát." });
      await loadSongDetail();
    } catch (error) {
      console.error("Approve song failed", error);
      setToast({ title: "Lỗi", message: "Không thể duyệt bài hát." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!song?.id) return;

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
      setSubmitting(true);
      await blockSong(song.id, { reject_reason: reason.trim() });
      setToast({ title: "Thành công", message: "Đã từ chối bài hát." });
      await loadSongDetail();
    } catch (error) {
      console.error("Reject song failed", error);
      setToast({ title: "Lỗi", message: "Không thể từ chối bài hát." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/songs/review")}
          className="admin-button admin-button-ghost"
        >
          <FiChevronLeft /> Quay lại danh sách duyệt
        </button>
        <button
          onClick={loadSongDetail}
          className="admin-button"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {loading && (
        <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
      )}

      {!loading && errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {!loading && song && (
        <>
          <div className="admin-detail-shell">
            <div className="admin-detail-header">
              <div className="admin-detail-heading">
                <p className="admin-list-kicker">Duyệt bài hát</p>
                <h1 className="admin-list-title">{song.title || "Bài hát"}</h1>
              </div>
              <div className="admin-toolbar-actions">
                <span className={getStatusChipClass(song.status)}>
                  {getStatusLabel(song.status)}
                </span>
              </div>
            </div>

            <div className="admin-detail-grid is-two-column">
              <section className="admin-detail-panel">
                <p className="admin-detail-panel-title">Ảnh bìa</p>
                <div className="mt-4">
                  {songCoverUrl ? (
                    <div className="admin-detail-media is-square">
                      <OptimizedImage
                        src={songCoverUrl}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="admin-detail-placeholder">Chưa có ảnh bìa</div>
                  )}
                </div>
              </section>

              <section className="admin-detail-panel">
                <p className="admin-detail-panel-title">Thông tin kiểm duyệt</p>
                <div className="mt-4 admin-detail-meta-grid">
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Nghệ sĩ</p>
                    <p className="admin-detail-meta-value">
                      {getArtistLabel(song, song.artist_name || song.artist?.name || "") || "-"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Album</p>
                    <p className="admin-detail-meta-value">{song.album_title || "Single"}</p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Thể loại</p>
                    <p className="admin-detail-meta-value">
                      {Array.isArray(song.genres)
                        ? song.genres.join(", ") || "-"
                        : song.genres || "-"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Thời lượng</p>
                    <p className="admin-detail-meta-value">
                      {song.duration ? `${song.duration}s` : "Chưa có"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Ngày phát hành</p>
                    <p className="admin-detail-meta-value">
                      {song.release_date
                        ? new Date(song.release_date).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">ID</p>
                    <p className="admin-detail-meta-value">{song.id}</p>
                  </div>
                </div>
                {song.reject_reason && (
                  <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    Lý do từ chối trước đó: {song.reject_reason}
                  </div>
                )}
              </section>
            </div>

            <section className="admin-detail-panel">
              <p className="admin-detail-panel-title">File nhạc mp3/audio</p>
              {songAudioUrl ? (
                <div className="mt-4">
                  <audio controls className="w-full">
                    <source src={songAudioUrl} />
                  </audio>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
                  Chưa có file audio/mp3. Không nên duyệt bài hát này.
                </div>
              )}
            </section>

            <div className="admin-detail-actions">
              <button
                onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                className="admin-button admin-button-ghost"
              >
                Chỉnh sửa bài hát
              </button>
              {song.status !== "approved" && (
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="admin-button admin-button-success"
                >
                  <FiCheckCircle /> Duyệt
                </button>
              )}
              {song.status !== "rejected" && (
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="admin-button admin-button-danger"
                >
                  <FiSlash /> Từ chối
                </button>
              )}
            </div>
          </div>
          <Toast
            title={toast.title}
            message={toast.message}
            onClose={() => setToast({ title: "", message: "" })}
          />
        </>
      )}
    </div>
  );
}
