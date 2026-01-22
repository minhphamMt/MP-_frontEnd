import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteArtist, getArtists } from "../../api/artist.api";
import Toast from "../../components/common/Toast";
import { resolveAssetUrl } from "../../utils/asset";

export default function AdminArtistList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [artists, setArtists] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  const loadArtists = async () => {
    try {
      setLoading(true);
      const res = await getArtists({ page: 1, limit: 100 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.artists || [];
      setArtists(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load artists failed", error);
      setErrorMessage("Không thể tải danh sách nghệ sĩ.");
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    const pendingToast = location.state?.toast;
    if (!pendingToast) return;
    setToast(pendingToast);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  const filteredArtists = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return artists;
    return artists.filter((artist) =>
      [
        artist.name,
        artist.alias,
        artist.realname,
        artist.zing_artist_id,
        `${artist.id}`,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [artists, keyword]);

  const handleDelete = async (artist) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá nghệ sĩ "${artist.name}"?`
    );
    if (!confirmed) return;
    try {
      await deleteArtist(artist.id);
      await loadArtists();
      setToast({ title: "Thành công", message: "Đã xoá nghệ sĩ." });
    } catch (error) {
      console.error("Delete artist failed", error);
      setToast({ title: "Lỗi", message: "Không thể xoá nghệ sĩ." });
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Quản lý nghệ sĩ
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadArtists}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={() => navigate("/admin/artists/new")}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
          >
            <FiPlus /> Thêm nghệ sĩ
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm kiếm nghệ sĩ theo tên, alias, mã..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
        />
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Nghệ sĩ</span>
          <span>Thông tin</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredArtists.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có nghệ sĩ phù hợp.
            </div>
          )}
          {!loading &&
            filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="grid grid-cols-[1.4fr_0.8fr_0.6fr] gap-4 px-4 py-4 text-sm text-white/80"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                    {artist.avatar_url ? (
                      <img
                        src={resolveAssetUrl(artist.avatar_url)}
                        alt={artist.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/50">
                        <FiUser />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white">{artist.name}</p>
                    <p className="text-xs text-white/50">
                      {artist.alias || artist.realname || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  <p>Mã: {artist.zing_artist_id || "-"}</p>
                  <p>Quốc gia: {artist.national || "-"}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/artists/${artist.id}/edit`)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    <FiEdit2 /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(artist)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <FiTrash2 /> Xoá
                  </button>
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