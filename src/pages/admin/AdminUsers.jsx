import { useCallback, useEffect, useState } from "react";
import {
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteUser, listUsers, searchAdmin } from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import Toast from "../../components/common/Toast";
import OptimizedImage from "../../components/common/OptimizedImage";
import { resolveAssetUrl } from "../../utils/asset";
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

const getUserAvatar = (user) =>
  user?.avatar_url ||
  user?.avatar ||
  user?.photo ||
  user?.photo_url ||
  user?.image ||
  user?.image_url ||
  user?.profile_image ||
  user?.profile_photo;

const getRoleTone = (role) => {
  if (role === "ADMIN") return "admin-chip admin-chip-info";
  if (role === "ARTIST") return "admin-chip admin-chip-warning";
  return "admin-chip";
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 320);
  const activeUsersCount = users.filter((item) => item?.is_active).length;
  const adminUsersCount = users.filter((item) => item?.role === "ADMIN").length;
  const artistUsersCount = users.filter((item) => item?.role === "ARTIST").length;

  const loadUsers = useCallback(async (searchTerm = "") => {
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
            "user"
          );
        }

        const res = await listUsers({ page: 1, limit: 200 });
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload)
          ? payload
          : payload.items || payload.users || [];
      });
      setUsers(list);
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load users timed out");
      } else {
        console.error("Load users failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("người dùng", searchTerm));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(debouncedKeyword);
  }, [debouncedKeyword, loadUsers]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("keyword") || "");
  }, [location.search]);

  useEffect(() => {
    const pendingToast = location.state?.toast;
    if (!pendingToast) return;
    setToast(pendingToast);
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: {} }
    );
  }, [location, navigate]);

  const handleDelete = async (user) => {
    const confirmed = await confirmAdminAction({
      title: "Xóa người dùng",
      message: `Bạn có chắc muốn xóa người dùng "${user.display_name || user.email}"?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteUser(user.id);
      await loadUsers(keyword.trim());
      setToast({ title: "Thành công", message: "Đã xóa người dùng." });
    } catch (error) {
      console.error("Delete user failed", error);
      setToast({ title: "Lỗi", message: "Không thể xóa người dùng." });
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
            Quản lý người dùng
          </h1>
        </div>
        <div className="admin-toolbar-actions">
          <button
            onClick={() => loadUsers(keyword.trim())}
            className="admin-button"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={() => navigate("/admin/users/new")}
            className="admin-button admin-button-primary"
          >
            <FiPlus /> Thêm người dùng
          </button>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Người dùng</p>
          <p className="admin-stat-value">{users.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Đang hoạt động</p>
          <p className="admin-stat-value">{activeUsersCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Admin</p>
          <p className="admin-stat-value">{adminUsersCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Nghệ sĩ</p>
          <p className="admin-stat-value">{artistUsersCount}</p>
        </div>
      </div>

      <div className="admin-toolbar-panel">
        <div className="admin-toolbar-group">
          <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm kiếm người dùng theo tên, email, ID..."
          className="admin-field"
        />
        </div>
      </div>

      <AdminListNotice message={errorMessage} />

      <div className="admin-data-panel">
        <div className="admin-data-head grid grid-cols-[1fr_auto] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[1.2fr_1fr_0.7fr_0.8fr]">
          <span>Người dùng</span>
          <span className="hidden lg:block">Thông tin</span>
          <span className="hidden lg:block">Trạng thái</span>
          <span className="text-right">Hành động</span>
        </div>

        {loading ? (
          <AdminListLoadingState variant="users" />
        ) : (
          <div className="divide-y divide-white/5">
            {users.length === 0 ? (
            <div className="admin-empty-state">
              Không có người dùng phù hợp.
            </div>
            ) : (
              users.map((user) => (
              <div
                key={user.id}
                className="admin-row-card grid grid-cols-1 gap-4 px-4 py-4 text-sm text-white/80 lg:grid-cols-[1.2fr_1fr_0.7fr_0.8fr] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10">
                    {getUserAvatar(user) ? (
                      <OptimizedImage
                        src={resolveAssetUrl(getUserAvatar(user))}
                        alt={user.display_name || user.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/50">
                        <FiUser />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-white">
                      {user.display_name || user.name || "Người dùng"}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      ID: {user.id}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 lg:hidden">
                      <span
                        className={getRoleTone(user.role)}
                      >
                        {user.role || "USER"}
                      </span>
                      <span
                        className={`admin-status-chip ${user.is_active ? "is-success" : "is-danger"}`}
                      >
                        {user.is_active ? "Đang hoạt động" : "Bị khóa"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-1 text-xs text-white/60 lg:block">
                  <p className="truncate">Email: {user.email || "-"}</p>
                  <p>Vai trò: {user.role || "-"}</p>
                </div>

                <div className="hidden lg:block">
                  <span
                    className={`admin-status-chip ${user.is_active ? "is-success" : "is-danger"}`}
                  >
                    {user.is_active ? "Đang hoạt động" : "Bị khóa"}
                  </span>
                </div>

                <div className="admin-inline-actions">
                  <button
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    aria-label="Xem chi tiết"
                    className="admin-button admin-button-success"
                  >
                    <FiEye />
                    <span className="hidden sm:inline">Xem</span>
                  </button>
                  <button
                    onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    aria-label="Sửa"
                    className="admin-button admin-button-ghost"
                  >
                    <FiEdit2 />
                    <span className="hidden sm:inline">Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    aria-label="Xóa"
                    className="admin-button admin-button-danger"
                  >
                    <FiTrash2 />
                    <span className="hidden sm:inline">Xóa</span>
                  </button>
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
