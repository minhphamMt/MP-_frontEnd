import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteUser, listUsers } from "../../api/admin.api";
import Toast from "../../components/common/Toast";
import { resolveAssetUrl } from "../../utils/asset";

const getUserAvatar = (user) =>
  user?.avatar_url ||
  user?.avatar ||
  user?.photo ||
  user?.photo_url ||
  user?.image ||
  user?.image_url ||
  user?.profile_image ||
  user?.profile_photo;

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await listUsers({ page: 1, limit: 100 });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.users || [];
      setUsers(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load users failed", error);
      setErrorMessage("Không thể tải danh sách người dùng.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const pendingToast = location.state?.toast;
    if (!pendingToast) return;
    setToast(pendingToast);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  const filteredUsers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [user.display_name, user.name, user.email, `${user.id}`]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [keyword, users]);

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá người dùng "${user.display_name || user.email}"?`
    );
    if (!confirmed) return;
    try {
      await deleteUser(user.id);
      await loadUsers();
      setToast({ title: "Thành công", message: "Đã xoá người dùng." });
    } catch (error) {
      console.error("Delete user failed", error);
      setToast({ title: "Lỗi", message: "Không thể xoá người dùng." });
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
            Quản lý người dùng
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadUsers}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiRefreshCw /> Làm mới
          </button>
          <button
            onClick={() => navigate("/admin/users/new")}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
          >
            <FiPlus /> Thêm người dùng
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm kiếm người dùng theo tên, email, ID..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
        />
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.6fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Người dùng</span>
          <span>Thông tin</span>
          <span>Trạng thái</span>
          <span className="text-right">Hành động</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && filteredUsers.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có người dùng phù hợp.
            </div>
          )}
          {!loading &&
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.2fr_1fr_0.7fr_0.6fr] items-center gap-4 px-4 py-4 text-sm text-white/80"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                    {getUserAvatar(user) ? (
                      <img
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
                  <div>
                    <p className="text-white">
                      {user.display_name || user.name || "Người dùng"}
                    </p>
                    <p className="text-xs text-white/50">ID: {user.id}</p>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  <p>Email: {user.email || "-"}</p>
                  <p>Vai trò: {user.role || "-"}</p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    user.is_active ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {user.is_active ? "Đang hoạt động" : "Bị khóa"}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    <FiEdit2 /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
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