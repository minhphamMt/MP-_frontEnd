import { useEffect, useState } from "react";
import {
  createGenre,
  deleteGenre,
  listGenres,
  updateGenre,
} from "../../api/admin.api";
import { FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import Toast from "../../components/common/Toast";
import { confirmAdminAction, promptAdminInput } from "../../utils/adminDialog";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../../utils/adminListRequest";

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const matchingGenresCount = genres.filter((genre) =>
    keyword.trim() ? genre?.name?.toLowerCase().includes(keyword.trim().toLowerCase()) : true
  ).length;

  const loadGenres = async () => {
    try {
      setLoading(true);
      const list = await withAdminListTimeout(async () => {
        const res = await listGenres({ page: 1, limit: 50, keyword });
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload)
          ? payload
          : payload.items || payload.genres || [];
      });
      setGenres(list);
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load genres timed out");
      } else {
        console.error("Load genres failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("thể loại", keyword));
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleCreate = async () => {
    if (!newGenre.trim()) return;
    try {
      await createGenre({ name: newGenre.trim() });
      setNewGenre("");
      loadGenres();
    } catch (error) {
      console.error("Create genre failed", error);
      setToast({ title: "Lỗi", message: "Không thể tạo thể loại." });
    }
  };

    const handleRename = async (genre) => {
    const nextName = await promptAdminInput({
      title: "Cập nhật thể loại",
      message: "Nhập tên thể loại mới",
      placeholder: "Tên thể loại",
      initialValue: genre.name,
      confirmText: "Cập nhật",
      cancelText: "Hủy",
    });
    if (!nextName?.trim() || nextName.trim() === genre.name) return;
    try {
      await updateGenre(genre.id, { name: nextName.trim() });
      loadGenres();
    } catch (error) {
      console.error("Update genre failed", error);
      setToast({ title: "Lỗi", message: "Không thể cập nhật thể loại." });
    }
  };

    const handleDelete = async (genre) => {
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm thể loại",
      message: `Bạn có chắc muốn xóa mềm thể loại "${genre.name}"? Thể loại sẽ nằm trong thùng rác.`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteGenre(genre.id);
      loadGenres();
    } catch (error) {
      console.error("Delete genre failed", error);
      setToast({ title: "Lỗi", message: "Không thể xóa mềm thể loại." });
    }
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="admin-list-header">
        <div>
          <p className="admin-list-kicker">
            Quản trị
          </p>
          <h1 className="admin-list-title">
            Quản lý thể loại
          </h1>
          <p className="admin-list-summary">
            Chuyển danh sách thể loại sang một surface gọn và sáng sủa hơn để thêm,
            đổi tên hay xóa nhanh mà không bị nặng mắt.
          </p>
        </div>
        <button
          onClick={loadGenres}
          className="admin-button"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Thể loại</p>
          <p className="admin-stat-value">{genres.length}</p>
          <p className="admin-stat-note">Tổng thể loại đang hiển thị</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Khớp tìm kiếm</p>
          <p className="admin-stat-value">{matchingGenresCount}</p>
          <p className="admin-stat-note">Theo từ khóa hiện tại</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="admin-toolbar-panel">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") loadGenres();
            }}
            placeholder="Tìm kiếm thể loại..."
            className="admin-field"
          />
        </div>

        <div className="admin-toolbar-panel">
          <div className="admin-toolbar-group">
            <input
              value={newGenre}
              onChange={(event) => setNewGenre(event.target.value)}
              placeholder="Thêm thể loại mới..."
              className="admin-field"
            />
            <button
              onClick={handleCreate}
              className="admin-button admin-button-primary"
            >
              <FiPlus /> Thêm
            </button>
          </div>
        </div>
      </div>

      <AdminListNotice message={errorMessage} />

      <div className="admin-data-panel">
        <div className="admin-data-head grid grid-cols-[1fr_0.4fr] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Thể loại</span>
          <span className="text-right">Hành động</span>
        </div>
        {loading ? (
          <AdminListLoadingState variant="genres" />
        ) : (
          <div className="divide-y divide-white/5">
            {genres.length === 0 ? (
            <div className="admin-empty-state">
              Không có thể loại phù hợp.
            </div>
            ) : (
              genres.map((genre) => (
              <div
                key={genre.id}
                className="admin-row-card flex items-center justify-between px-4 py-3 text-sm text-white/80"
              >
                <span
                  className="cursor-pointer text-white md:hover:text-emerald-300"
                  onClick={() => handleRename(genre)}
                >
                  {genre.name}
                </span>
                <button
                  onClick={() => handleDelete(genre)}
                  className="admin-button admin-button-danger"
                >
                  <FiTrash2 /> Xoá mềm
                </button>
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
