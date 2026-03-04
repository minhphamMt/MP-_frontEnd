import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { deleteAlbum, getAlbums } from "../../api/album.api";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
import Toast from "../../components/common/Toast";
import { confirmAdminAction } from "../../utils/adminDialog";

export default function AdminAlbums() {
  const navigate = useNavigate();
  const location = useLocation();

  const [albums, setAlbums] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = keyword.trim();
      const res = await getAlbums({
        page: 1,
        limit: 100,
        sort: "release_date",
        ...(trimmedKeyword ? { keyword: trimmedKeyword, q: trimmedKeyword } : {}),
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.albums || [];
      setAlbums(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load albums failed", error);
      setErrorMessage("Không thể tải danh sách album.");
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, [keyword]);

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

  const filteredAlbums = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return albums;
    return albums.filter((album) =>
      [album.title, album.artist_name, `${album.id}`]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [albums, keyword]);

  const handleDelete = async (albumId) => {
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm album",
      message: "Bạn có chắc muốn xóa mềm album này? Album sẽ nằm trong thùng rác.",
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteAlbum(albumId);
      await loadAlbums();
      setToast({ title: "Thành công", message: "Đã xóa mềm album." });
    } catch (error) {
      console.error("Delete album failed", error);
      setToast({ title: "Lỗi", message: "Không thể xóa mềm album." });
    }
  };

  return (
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">Quản lý album</h1>
        </div>
        <button
          onClick={loadAlbums}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="admin-glass rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            <FiSearch className="text-white/50" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên album hoặc nghệ sĩ..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-6 text-sm text-white/60">
          Đang tải dữ liệu...
        </div>
      )}

      {!loading && filteredAlbums.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-6 text-sm text-white/60">
          Không có album phù hợp.
        </div>
      )}

      {!loading && filteredAlbums.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredAlbums.map((album) => (
            <ArtistAlbumTile
              key={album.id}
              album={album}
              onView={() => navigate(`/admin/albums/${album.id}`)}
              onEdit={() => navigate(`/admin/albums/${album.id}/edit`)}
              onDelete={() => handleDelete(album.id)}
            />
          ))}
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

