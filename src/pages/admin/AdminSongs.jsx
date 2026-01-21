import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiCheckCircle, FiRefreshCw, FiSlash } from "react-icons/fi";
import { approveSong, blockSong } from "../../api/admin.api";
import { getSongs } from "../../api/song.api";

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
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadSongs = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
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
  }, [statusFilter]);

   useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  const handleApprove = async (song) => {
    try {
      const res = await approveSong(song.id);
      const updated = res?.data?.song ?? res?.data?.data ?? res?.data ?? song;
      setSongs((prev) =>
        prev.map((item) => (item.id === song.id ? updated : item))
      );
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

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
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
        <div className="grid grid-cols-[1.5fr_1fr_0.6fr_0.9fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Bài hát</span>
          <span>Nghệ sĩ</span>
          <span>Trạng thái</span>
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
                className="grid grid-cols-[1.5fr_1fr_0.6fr_0.9fr] items-center gap-2 px-4 py-3 text-sm text-white/80"
              >
                <div>
                  <p className="font-semibold text-white">{song.title}</p>
                  <p className="text-xs text-white/50">
                    {song.album_title || "Single"}
                  </p>
                </div>
                <span>{song.artist_name || "-"}</span>
                <span className={`text-xs font-semibold ${statusBadge(song.status)}`}>
                  {song.status || "-"}
                </span>
                <div className="flex justify-end gap-2">
                  {song.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(song)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-500/20"
                    >
                      <FiCheckCircle /> Duyệt
                    </button>
                  )}
                  {song.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(song)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <FiSlash /> Từ chối
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}