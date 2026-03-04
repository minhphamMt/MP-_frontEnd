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

const getSongAudio = (song) => (song ? toPlayableSong(song).audio_url : "");

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
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/songs/review")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
        >
          <FiChevronLeft /> Quay lại danh sách duyệt
        </button>
        <button
          onClick={loadSongDetail}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-6 text-sm text-white/60">
          Đang tải dữ liệu...
        </div>
      )}

      {!loading && errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {!loading && song && (
        <>
          <div className="admin-glass rounded-3xl border border-white/10 bg-[#181818] p-5 text-xs shadow-[0_25px_80px_rgba(0,0,0,0.55)] sm:p-6 sm:text-sm">
            <div className="grid gap-5 md:grid-cols-[260px_1fr]">
              <div>
                {songCoverUrl ? (
                  <OptimizedImage
                    src={songCoverUrl}
                    alt={song.title}
                    className="h-[260px] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-[260px] items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60">
                    Chưa có ảnh bìa
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs text-white/80 sm:text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Duyệt bài hát</p>
                <h1 className="text-2xl font-bold text-white">{song.title || "-"}</h1>
                <p>
                  <span className="text-white/50">Nghệ sĩ:</span>{" "}
                  {song.artist_name || song.artist?.name || "-"}
                </p>
                <p>
                  <span className="text-white/50">Album:</span> {song.album_title || "Single"}
                </p>
                <p>
                  <span className="text-white/50">Thể loại:</span>{" "}
                  {Array.isArray(song.genres) ? song.genres.join(", ") || "-" : song.genres || "-"}
                </p>
                <p>
                  <span className="text-white/50">Thời lượng:</span>{" "}
                  {song.duration ? `${song.duration}s` : "Chưa có"}
                </p>
                <p>
                  <span className="text-white/50">Ngày phát hành:</span>{" "}
                  {song.release_date
                    ? new Date(song.release_date).toLocaleDateString("vi-VN")
                    : "Chưa có"}
                </p>
                <p>
                  <span className="text-white/50">Trạng thái:</span>{" "}
                  <span className={statusBadge(song.status)}>{song.status || "-"}</span>
                </p>
                <p>
                  <span className="text-white/50">ID:</span> {song.id}
                </p>
                {song.reject_reason && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-100">
                    Lý do từ chối trước đó: {song.reject_reason}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="mb-2 text-xs font-semibold text-white sm:text-sm">File nhạc mp3/audio</p>
              {songAudioUrl ? (
                <>
                  <audio controls className="w-full">
                    <source src={songAudioUrl} />
                  </audio>
                  <p className="mt-2 text-xs text-emerald-300 sm:text-sm">
                    Đã có file audio, đủ điều kiện cơ bản để duyệt.
                  </p>
                </>
              ) : (
                <p className="text-xs text-rose-300 sm:text-sm">
                  Chưa có file audio/mp3. Không nên duyệt bài hát này.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition md:hover:bg-white/10 sm:text-sm"
            >
              Chỉnh sửa bài hát
            </button>
            {song.status !== "approved" && (
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200 transition md:hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
              >
                <FiCheckCircle /> Duyệt
              </button>
            )}
            {song.status !== "rejected" && (
              <button
                onClick={handleReject}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200 transition md:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
              >
                <FiSlash /> Từ chối
              </button>
            )}
          </div>
        </>
      )}
      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />
    </div>
  );
}

