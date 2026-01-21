import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiRefreshCw, FiShield, FiUserX, FiX } from "react-icons/fi";
import {
  listUsers,
  toggleUserActive,
  updateUser,
  updateUserRole,
} from "../../api/admin.api";

const ROLE_OPTIONS = ["USER", "ARTIST", "ADMIN"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editPayload, setEditPayload] = useState({
    display_name: "",
    password: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await listUsers();
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

  const filteredUsers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" ? true : user.role === roleFilter;
      if (!matchesRole) return false;
      if (!normalized) return true;
      return [user.email, user.display_name, user.name, `${user.id}`]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [keyword, roleFilter, users]);

  const handleToggleActive = async (user) => {
    try {
      const nextActive = !Boolean(user.is_active);
      const res = await toggleUserActive(user.id, {
        is_active: nextActive,
      });
      const updated = res?.data?.user ?? res?.data?.data ?? res?.data ?? null;
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? updated : item))
      );
    } catch (error) {
      console.error("Toggle user active failed", error);
      alert("Không thể cập nhật trạng thái người dùng.");
    }
  };

  const handleChangeRole = async (user, nextRole) => {
    try {
      const res = await updateUserRole(user.id, { role: nextRole });
      const updated = res?.data?.user ?? res?.data?.data ?? res?.data ?? null;
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? updated : item))
      );
    } catch (error) {
      console.error("Update role failed", error);
      alert("Không thể cập nhật vai trò.");
    }
  };
 const handleEditUser = (user) => {
    setEditingUser(user);
    setEditPayload({
      display_name: user.display_name || user.name || "",
      password: "",
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await updateUser(editingUser.id, {
        display_name: editPayload.display_name || undefined,
        password: editPayload.password || undefined,
      });
      const updated = res?.data?.user ?? res?.data?.data ?? res?.data ?? null;
      setUsers((prev) =>
        prev.map((item) => (item.id === editingUser.id ? updated : item))
      );
      setEditingUser(null);
      setEditPayload({ display_name: "", password: "" });
    } catch (error) {
      console.error("Update user failed", error);
      alert("Không thể cập nhật thông tin người dùng.");
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
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo email, tên hiển thị hoặc ID..."
            className="w-full flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:w-48"
          >
            {ROLE_FILTERS.map((role) => (
              <option key={role} value={role} className="text-black">
                {role === "ALL" ? "Tất cả vai trò" : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
         <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_1fr] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          <span>Người dùng</span>
          <span>Email</span>
          <span>Vai trò</span>
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
                className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_1fr] items-center gap-2 px-4 py-3 text-sm text-white/80"
              >
                <div>
                  <p className="font-semibold text-white">
                    {user.display_name || user.name || "Người dùng"}
                  </p>
                  <p className="text-xs text-white/50">ID: {user.id}</p>
                </div>
                <span>{user.email || "-"}</span>
                <div>
                  <select
                    value={user.role || "USER"}
                    onChange={(event) =>
                      handleChangeRole(user, event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role} className="text-black">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    user.is_active ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {user.is_active ? "Đang hoạt động" : "Bị khóa"}
                </span>
                <div className="flex justify-end">
                   <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
                    >
                      <FiEdit2 /> Sửa
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
                    >
                      {user.is_active ? <FiUserX /> : <FiShield />}
                      {user.is_active ? "Khoá" : "Mở khoá"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
       {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#181818] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cập nhật người dùng</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-white/70">
                Tên hiển thị
                <input
                  value={editPayload.display_name}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      display_name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Mật khẩu mới
                <input
                  type="password"
                  value={editPayload.password}
                  onChange={(event) =>
                    setEditPayload((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Để trống nếu không đổi"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdateUser}
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}