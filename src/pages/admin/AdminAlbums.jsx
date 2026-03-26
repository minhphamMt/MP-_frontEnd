import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { deleteAlbum, getAlbums } from "../../api/album.api";
import { searchAdmin } from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
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
import useDebouncedValue from "../../hooks/useDebouncedValue";

export default function AdminAlbums() {
  const navigate = useNavigate();
  const location = useLocation();

  const [albums, setAlbums] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 320);
  const albumsWithCoverCount = albums.filter((album) => album?.cover_url || album?.cover).length;
  const releasedThisYearCount = albums.filter((album) => {
    if (!album?.release_date) return false;
    const parsed = new Date(album.release_date);
    return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === new Date().getFullYear();
  }).length;

  const loadAlbums = async (searchTerm = "") => {
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
          return filterAdminSearchItemsByType(
            extractAdminSearchItems(payload),
            "album"
          );
        }

        const res = await getAlbums({
          page: 1,
          limit: 200,
          sort: "release_date",
        });
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload)
          ? payload
          : payload.items || payload.albums || [];
      });

      setAlbums(list);
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load albums timed out");
      } else {
        console.error("Load albums failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("album", searchTerm));
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums(debouncedKeyword);
  }, [debouncedKeyword]);

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
      await loadAlbums(keyword.trim());
      setToast({ title: "Thành công", message: "Đã xóa mềm album." });
    } catch (error) {
      console.error("Delete album failed", error);
      setToast({ title: "Lỗi", message: "Không thể xóa mềm album." });
    }
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="admin-list-header">
        <div>
          <p className="admin-list-kicker">
            Quản trị
          </p>
          <h1 className="admin-list-title">Quản lý album</h1>
          <p className="admin-list-summary">
            Giữ danh sách album rõ nhịp hơn với card phẳng, khoảng thở tốt và các
            điểm dữ liệu quan trọng được đẩy lên phía trước.
          </p>
        </div>
        <button
          onClick={() => loadAlbums(keyword.trim())}
          className="admin-button"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Album</p>
          <p className="admin-stat-value">{albums.length}</p>
          <p className="admin-stat-note">Tổng album đang hiển thị</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Có cover</p>
          <p className="admin-stat-value">{albumsWithCoverCount}</p>
          <p className="admin-stat-note">Sẵn sàng hiển thị tốt</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Năm nay</p>
          <p className="admin-stat-value">{releasedThisYearCount}</p>
          <p className="admin-stat-note">Album phát hành trong năm hiện tại</p>
        </div>
      </div>

      <div className="admin-toolbar-panel">
        <div className="admin-toolbar-group">
          <label className="admin-search-shell">
            <FiSearch className="admin-search-icon" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên album hoặc nghệ sĩ..."
              className="admin-field"
            />
          </label>
        </div>
      </div>

      <AdminListNotice message={errorMessage} />

      {loading ? (
        <AdminListLoadingState variant="albums" />
      ) : albums.length === 0 ? (
        <div className="admin-empty-state admin-data-panel">
          Không có album phù hợp.
        </div>
      ) : (
        <div className="admin-collection-grid">
          {albums.map((album) => (
            <ArtistAlbumTile
              key={album.id}
              album={album}
              theme="admin"
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

