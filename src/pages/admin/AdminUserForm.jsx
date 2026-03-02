import { useEffect, useMemo, useState } from "react";
import { FiCamera, FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  createUser,
  getUserById,
  updateUser,
  uploadUserAvatarByAdmin,
} from "../../api/admin.api";
import Toast from "../../components/common/Toast";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../../components/common/OptimizedImage";

const ROLE_OPTIONS = ["USER", "ARTIST", "ADMIN"];
const emptyUserPayload = {
  display_name: "",
  email: "",
  password: "",
  role: "USER",
  is_active: true,
  avatar_url: "",
};

const normalizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ])
  );

export default function AdminUserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({ ...emptyUserPayload });
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  useEffect(() => {
    if (!isEdit) return;
    const loadUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(id);
        const payload = res?.data?.data ?? res?.data ?? null;
        if (!payload) {
          setErrorMessage("Không tìm thấy người dùng.");
          return;
        }
        setUser(payload);
        setFormValues({
          display_name: payload.display_name || payload.name || "",
          email: payload.email || "",
          password: "",
          role: payload.role || "USER",
          is_active: Boolean(payload.is_active),
          avatar_url: payload.avatar_url || payload.avatar || "",
        });
        setErrorMessage("");
      } catch (error) {
        console.error("Load user failed", error);
        setErrorMessage("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id, isEdit]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    if (formValues.avatar_url) {
      return resolveAssetUrl(formValues.avatar_url);
    }
    if (user?.avatar_url) {
      return resolveAssetUrl(user.avatar_url);
    }
    return null;
  }, [avatarFile, formValues.avatar_url, user]);

  useEffect(() => {
    if (!avatarFile || !avatarPreview) return undefined;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarFile, avatarPreview]);

  const handleChange = (field) => (event) => {
    const { value, checked, type } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [field]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.display_name.trim()) {
      setErrorMessage("Vui lòng nhập tên hiển thị.");
      return;
    }
    if (!formValues.email.trim()) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }
    if (!isEdit && !formValues.password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      const payload = normalizePayload({
        display_name: formValues.display_name,
        email: formValues.email,
        role: formValues.role,
        is_active: formValues.is_active ? 1 : 0,
        avatar_url: avatarFile ? undefined : formValues.avatar_url,
        password: isEdit ? undefined : formValues.password,
      });

      if (isEdit) {
        await updateUser(id, payload);
        if (avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          await uploadUserAvatarByAdmin(id, formData);
        }
        setToast({ title: "Thành công", message: "Lưu thành công." });
      } else {
        const res = await createUser(payload);
        const createdUser = res?.data?.data ?? res?.data ?? null;
        if (createdUser?.id && avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          await uploadUserAvatarByAdmin(createdUser.id, formData);
        }
        navigate("/admin/users", {
          replace: true,
          state: { toast: { title: "Thành công", message: "Lưu thành công." } },
        });
      }
    } catch (error) {
      console.error("Save user failed", error);
      setErrorMessage(
        isEdit ? "Không thể cập nhật người dùng." : "Không thể tạo người dùng."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 bg-[#121212] px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/users")}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-[#181818] p-5 text-xs shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:p-6 sm:text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Quản trị
            </p>
            <h1 className="text-base font-semibold text-white sm:text-2xl">
              {isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu cập nhật" : "Tạo người dùng"}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="text-xs text-white/60 sm:text-sm">Đang tải dữ liệu...</div>
          ) : (
            <div className="h-full overflow-y-auto pr-1">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">
                    {isEdit ? "Ảnh đại diện" : "Ảnh đại diện"}
                  </p>
                  <div className="mt-4 flex flex-col gap-4">
                    {avatarPreview ? (
                      <OptimizedImage
                        src={avatarPreview}
                        alt={formValues.display_name || "User avatar"}
                        className="h-56 w-full rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60 sm:text-sm">
                        Chưa có ảnh đại diện
                      </div>
                    )}
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition md:hover:bg-white/10">
                      <FiCamera /> {isEdit ? "Tải avatar mới" : "Chọn avatar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setAvatarFile(file);
                        }}
                      />
                    </label>
                    <input
                      value={formValues.avatar_url}
                      onChange={(event) => {
                        setAvatarFile(null);
                        setFormValues((prev) => ({
                          ...prev,
                          avatar_url: event.target.value,
                        }));
                      }}
                      placeholder="Avatar URL (nếu không upload)"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
                    />
                    {isEdit && user && (
                      <div className="space-y-2 text-xs text-white/70 sm:text-sm">
                        <p>
                          <span className="text-white/60">Tên hiển thị:</span>{" "}
                          <span className="text-white">
                            {user.display_name || user.name || "Chưa cập nhật"}
                          </span>
                        </p>
                        <p>
                          <span className="text-white/60">Email:</span>{" "}
                          <span className="text-white">{user.email || "-"}</span>
                        </p>
                        <p>
                          <span className="text-white/60">Vai trò:</span>{" "}
                          <span className="text-white">{user.role || "-"}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold text-white sm:text-sm">
                    {isEdit ? "Cập nhật người dùng" : "Thông tin người dùng"}
                  </p>
                  <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <input
                      value={formValues.display_name}
                      onChange={handleChange("display_name")}
                      placeholder="Tên hiển thị"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    <input
                      value={formValues.email}
                      onChange={handleChange("email")}
                      placeholder="Email"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    />
                    {!isEdit && (
                      <input
                        type="password"
                        value={formValues.password}
                        onChange={handleChange("password")}
                        placeholder="Mật khẩu"
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                      />
                    )}
                    <select
                      value={formValues.role}
                      onChange={handleChange("role")}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white focus:border-emerald-400/60 focus:outline-none sm:text-sm"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role} className="text-black">
                          {role}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-3 text-xs text-white/70 sm:col-span-2 sm:text-sm">
                      <input
                        type="checkbox"
                        checked={formValues.is_active}
                        onChange={handleChange("is_active")}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400"
                      />
                      Kích hoạt tài khoản
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving
                        ? "Đang lưu..."
                        : isEdit
                          ? "Lưu cập nhật"
                          : "Tạo người dùng"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
