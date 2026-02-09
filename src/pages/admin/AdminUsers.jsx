import { useEffect, useMemo, useState } from "react";
import {
  FiCamera,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
  uploadUserAvatarByAdmin,
} from "../../api/admin.api";
import Toast from "../../components/common/Toast";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const getUserAvatar = (user) =>
  user?.avatar_url ||
  user?.avatar ||
  user?.photo ||
  user?.photo_url ||
  user?.image ||
  user?.image_url ||
  user?.profile_image ||
  user?.profile_photo;

const ROLE_OPTIONS = ["USER", "ARTIST", "ADMIN"];

const normalizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ])
  );

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [editPayload, setEditPayload] = useState({
    display_name: "",
    email: "",
    role: "USER",
    is_active: true,
    avatar_url: "",
  });

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

  const handleEdit = async (user) => {
    try {
      setSaving(true);
      const res = await getUserById(user.id);
      const payload = res?.data?.data ?? res?.data ?? user;
      setEditingUser(payload);
      setEditPayload({
        display_name: payload.display_name || payload.name || "",
        email: payload.email || "",
        role: payload.role || "USER",
        is_active: Boolean(payload.is_active),
        avatar_url: getUserAvatar(payload) || "",
      });
      setAvatarFile(null);
    } catch (error) {
      console.error("Load user detail failed", error);
      setToast({ title: "Lỗi", message: "Không thể tải người dùng." });
    } finally {
      setSaving(false);
    }
  };

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    if (editPayload.avatar_url) {
      return resolveAssetUrl(editPayload.avatar_url);
    }
    if (editingUser && getUserAvatar(editingUser)) {
      return resolveAssetUrl(getUserAvatar(editingUser));
    }
    return null;
  }, [avatarFile, editPayload.avatar_url, editingUser]);

  useEffect(() => {
    if (!avatarFile || !avatarPreview) return undefined;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarFile, avatarPreview]);

  const handleUpdate = async () => {
    if (!editingUser) return;
    if (!editPayload.display_name.trim()) {
      setToast({ title: "Thiếu dữ liệu", message: "Vui lòng nhập tên hiển thị." });
      return;
    }
    if (!editPayload.email.trim()) {
      setToast({ title: "Thiếu dữ liệu", message: "Vui lòng nhập email." });
      return;
    }
    try {
      setSaving(true);
      const payload = normalizePayload({
        display_name: editPayload.display_name,
        email: editPayload.email,
        role: editPayload.role,
        is_active: editPayload.is_active ? 1 : 0,
        avatar_url: avatarFile ? undefined : editPayload.avatar_url,
      });
      await updateUser(editingUser.id, payload);
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await uploadUserAvatarByAdmin(editingUser.id, formData);
      }
      await loadUsers();
      setEditingUser(null);
      setAvatarFile(null);
      setToast({ title: "Thành công", message: "Đã cập nhật người dùng." });
    } catch (error) {
      console.error("Update user failed", error);
      setToast({ title: "Lỗi", message: "Không thể cập nhật người dùng." });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
        <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[1.2fr_1fr_0.7fr_0.6fr]">
          <span>Người dùng</span>
          <span className="hidden lg:block">Thông tin</span>
          <span className="hidden lg:block">Trạng thái</span>
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
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 text-sm text-white/80 lg:grid-cols-[1.2fr_1fr_0.7fr_0.6fr]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
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
                  <div>
                    <p className="text-white">
                      {user.display_name || user.name || "Người dùng"}
                    </p>
                    <p className="text-xs text-white/50">ID: {user.id}</p>
                  </div>
                </div>
                <div className="hidden text-xs text-white/60 lg:block">
                  <p>Email: {user.email || "-"}</p>
                  <p>Vai trò: {user.role || "-"}</p>
                </div>
                <span
                  className={`hidden text-xs font-semibold lg:block ${
                    user.is_active ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {user.is_active ? "Đang hoạt động" : "Bị khóa"}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    aria-label="Sửa"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    <FiEdit2 />
                    <span className="hidden lg:inline">Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    aria-label="Xoá"
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <FiTrash2 />
                    <span className="hidden lg:inline">Xoá</span>
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
    {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 md:pl-64">
          <div className="flex w-full max-w-3xl max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#181818] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Quản lý người dùng
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Chỉnh sửa người dùng
                </h2>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1 sm:pr-2">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Ảnh đại diện</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {avatarPreview ? (
                      <OptimizedImage
                        src={avatarPreview}
                        alt={editPayload.display_name || "User avatar"}
                        className="h-56 w-full rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-sm text-white/60">
                        Chưa có ảnh đại diện
                      </div>
                    )}
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10">
                      <FiCamera /> Tải avatar mới
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setAvatarFile(event.target.files?.[0] || null)
                        }
                      />
                    </label>
                    <input
                      value={editPayload.avatar_url}
                      onChange={(event) => {
                        setAvatarFile(null);
                        setEditPayload((prev) => ({
                          ...prev,
                          avatar_url: event.target.value,
                        }));
                      }}
                      placeholder="Avatar URL (nếu không upload)"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                    />
                    <div className="space-y-2 text-sm text-white/70">
                      <p>
                        <span className="text-white/60">ID:</span>{" "}
                        <span className="text-white">{editingUser.id}</span>
                      </p>
                      <p>
                        <span className="text-white/60">Email:</span>{" "}
                        <span className="text-white">{editingUser.email || "-"}</span>
                      </p>
                      <p>
                        <span className="text-white/60">Vai trò:</span>{" "}
                        <span className="text-white">{editingUser.role || "-"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Cập nhật người dùng</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input
                      value={editPayload.display_name}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          display_name: event.target.value,
                        }))
                      }
                      placeholder="Tên hiển thị"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                    />
                    <input
                      value={editPayload.email}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="Email"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                    />
                    <select
                      value={editPayload.role}
                      onChange={(event) =>
                        setEditPayload((prev) => ({
                          ...prev,
                          role: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((roleOption) => (
                        <option key={roleOption} value={roleOption} className="text-black">
                          {roleOption}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-3 text-sm text-white/70 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={editPayload.is_active}
                        onChange={(event) =>
                          setEditPayload((prev) => ({
                            ...prev,
                            is_active: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400"
                      />
                      Kích hoạt tài khoản
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
