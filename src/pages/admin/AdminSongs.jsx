import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiCheckCircle, FiInfo, FiRefreshCw, FiSlash, FiX } from "react-icons/fi";
import { approveSong, blockSong } from "../../api/admin.api";
import { getSongs } from "../../api/song.api";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
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

export default function AdminSongs() {
  const location = useLocation();
  const [songs, setSongs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const getSongCover = (song) =>
    song?.cover_url ||
    song?.cover ||
    song?.thumbnail ||
    song?.image ||
    song?.album_cover;
  const getSongAudio = (song) =>
    song?.audio_path ||
    song?.audio_url ||
    song?.audio ||
    song?.source ||
    song?.mp3_url ||
    song?.file_url;

  const loadSongs = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = keyword.trim();
      const params = {
        page: 1,
        limit: 50,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(trimmedKeyword ? { keyword: trimmedKeyword, q: trimmedKeyword } : {}),
      };
      const res = await getSongs(params);
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

  const handleApprove = async (song) => {
    if (!getSongAudio(song)) {
      alert("Bài hát chưa có file audio/mp3. Vui lòng kiểm tra trước khi duyệt.");
      return;
    }
    try {
      const res = await approveSong(song.id);
      const updated = res?.data?.song ?? res?.data?.data ?? res?.data ?? song;
      setSongs((prev) =>
        prev.map((item) => (item.id === song.id ? updated : item))
      );
      await loadSongs();
    } catch (error) {
      console.error("Approve song failed", error);
      alert("Không thể duyệt bài hát.");
    }
  };

  const handleReject = async (song) => {
    const reason = window.prompt("Nhập lý do từ chối bài hát:");
    if (!reason) return;
    try {
      const res = await blockSong(song.id, { reject_reason: reason });
      const updated = res?.data?.song ?? res?.data?.data ?? res?.data ?? song;
      setSongs((prev) =>
        prev.map((item) => (item.id === song.id ? updated : item))
      );
      await loadSongs();
    } catch (error) {
      console.error("Reject song failed", error);
      alert("Không thể từ chối bài hát.");
    }
  };

  const visibleSongs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return songs;
    return songs.filter((song) =>
      [song.title, song.artist_name, song.album_title, `${song.id}`]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [keyword, songs]);

  const selectedSongAudioUrl = useMemo(() => {
    if (!selectedSong) return "";
    const audio = getSongAudio(selectedSong);
    return audio ? resolveAssetUrl(audio) : "";
  }, [selectedSong]);

  const selectedSongCoverUrl = useMemo(() => {
    if (!selectedSong) return "";
    const cover = getSongCover(selectedSong);
    return cover ? resolveAssetUrl(cover) : "";
  }, [selectedSong]);

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Duyệt bài hát
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
           <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo bài hát, nghệ sĩ, album..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition placeholder:text-white/40 focus:border-white/30 focus:outline-none sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
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
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[1.5fr_1fr_0.6fr_0.9fr]">
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
                className="grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 text-sm text-white/80 lg:grid-cols-[1.5fr_1fr_0.6fr_0.9fr]"
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
                    <p className="text-xs text-white/50">
                      {song.album_title || "Single"}
                    </p>
                    {!getSongAudio(song) && (
                      <p className="text-[11px] font-semibold text-rose-300">
                        Thiếu file mp3/audio
                      </p>
                    )}
                  </div>
                </div>
                <span className="hidden lg:block">{song.artist_name || "-"}</span>
                <span className={`hidden text-xs font-semibold lg:block ${statusBadge(song.status)}`}>
                  {song.status || "-"}
                </span>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedSong(song)}
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

      {selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 md:pl-64">
          <div className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-auto rounded-3xl border border-white/10 bg-[#181818] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Chi tiết bài hát chờ duyệt</h2>
              <button
                onClick={() => setSelectedSong(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition md:hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr]">
              <div>
                {selectedSongCoverUrl ? (
                  <OptimizedImage
                    src={selectedSongCoverUrl}
                    alt={selectedSong.title}
                    className="h-[220px] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60">
                    Chưa có ảnh bìa
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-white/80">
                <p><span className="text-white/50">Tên bài hát:</span> {selectedSong.title || "-"}</p>
                <p><span className="text-white/50">Nghệ sĩ:</span> {selectedSong.artist_name || selectedSong.artist?.name || "-"}</p>
                <p><span className="text-white/50">Album:</span> {selectedSong.album_title || "Single"}</p>
                <p><span className="text-white/50">Thể loại:</span> {Array.isArray(selectedSong.genres) ? selectedSong.genres.join(", ") || "-" : selectedSong.genres || "-"}</p>
                <p><span className="text-white/50">Thời lượng:</span> {selectedSong.duration ? `${selectedSong.duration}s` : "Chưa có"}</p>
                <p><span className="text-white/50">Ngày phát hành:</span> {selectedSong.release_date ? new Date(selectedSong.release_date).toLocaleDateString("vi-VN") : "Chưa có"}</p>
                <p><span className="text-white/50">Trạng thái:</span> <span className={statusBadge(selectedSong.status)}>{selectedSong.status || "-"}</span></p>
                <p><span className="text-white/50">ID:</span> {selectedSong.id}</p>
                {selectedSong.reject_reason && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-100">
                    Lý do từ chối trước đó: {selectedSong.reject_reason}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="mb-2 text-sm font-semibold text-white">File nhạc mp3/audio</p>
              {selectedSongAudioUrl ? (
                <>
                  <audio controls className="w-full">
                    <source src={selectedSongAudioUrl} />
                  </audio>
                  <p className="mt-2 text-xs text-emerald-300">Đã có file audio, đủ điều kiện cơ bản để duyệt.</p>
                </>
              ) : (
                <p className="text-sm text-rose-300">Chưa có file audio/mp3. Không nên duyệt bài hát này.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
