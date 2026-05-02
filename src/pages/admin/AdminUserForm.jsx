import { useEffect, useMemo, useState } from "react";
import { FiCamera, FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  createUser,
  getUserById,
  normalizeUserDetailPayload,
  updateUser,
  updateUserRole,
  uploadUserAvatarByAdmin,
} from "../../api/admin.api";
import Toast from "../../components/common/Toast";
import OptimizedImage from "../../components/common/OptimizedImage";
import SourceFileCard from "../../components/common/SourceFileCard";
import { extractApiErrorMessage } from "../../utils/apiError";
import { resolveAssetUrl } from "../../utils/asset";
import {
  getPasswordValidationError,
  PASSWORD_REQUIREMENTS_TEXT,
} from "../../utils/passwordValidation";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [roleRejectReason, setRoleRejectReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });

  useEffect(() => {
    if (!isEdit) return;

    const loadUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(id);
        const payload = res?.data?.data ?? res?.data ?? null;
        const detail = normalizeUserDetailPayload(payload);
        const profile = detail.profile;

        if (!profile) {
          setErrorMessage("Không tìm thấy người dùng.");
          return;
        }

        setUser(profile);
        setFormValues({
          display_name: profile.display_name || profile.name || "",
          email: profile.email || "",
          password: "",
          role: profile.role || "USER",
          is_active: Boolean(profile.is_active),
          avatar_url: profile.avatar_url || profile.avatar || "",
        });
        setRoleRejectReason("");
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
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "role") {
      setRoleRejectReason("");
    }
  };

  const currentRole = user?.role || "USER";
  const isRoleChanged = isEdit && formValues.role !== currentRole;
  const requiresRoleRejectReason =
    isEdit && currentRole === "ARTIST" && formValues.role === "USER";

  const handleSubmit = async () => {
    if (!formValues.display_name.trim()) {
      setErrorMessage("Vui lòng nhập tên hiển thị.");
      return;
    }
    if (!formValues.email.trim()) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }
    if (!isEdit) {
      const passwordError = getPasswordValidationError(formValues.password);

      if (passwordError) {
        setFieldErrors((prev) => ({ ...prev, password: passwordError }));
        setErrorMessage(passwordError);
        return;
      }
    }
    if (requiresRoleRejectReason && !roleRejectReason.trim()) {
      const message = "Vui lòng nhập lý do hạ quyền nghệ sĩ.";
      setFieldErrors((prev) => ({ ...prev, roleRejectReason: message }));
      setErrorMessage(message);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setFieldErrors({});

      const payload = normalizePayload({
        display_name: formValues.display_name,
        email: formValues.email,
        role: isEdit ? undefined : formValues.role,
        is_active: formValues.is_active ? 1 : 0,
        avatar_url: avatarFile ? undefined : formValues.avatar_url,
        password: isEdit ? undefined : formValues.password,
      });

      if (isEdit) {
        await updateUser(id, payload);
        if (isRoleChanged) {
          await updateUserRole(id, {
            role: formValues.role,
            ...(requiresRoleRejectReason
              ? { reject_reason: roleRejectReason.trim() }
              : {}),
          });
        }
        if (avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          await uploadUserAvatarByAdmin(id, formData);
        }
        setToast({ title: "Thành công", message: "Lưu thành công." });
        const refreshed = await getUserById(id);
        const refreshedPayload = refreshed?.data?.data ?? refreshed?.data ?? null;
        const refreshedProfile = normalizeUserDetailPayload(refreshedPayload).profile;
        if (refreshedProfile) {
          setUser(refreshedProfile);
          setFormValues({
            display_name: refreshedProfile.display_name || refreshedProfile.name || "",
            email: refreshedProfile.email || "",
            password: "",
            role: refreshedProfile.role || "USER",
            is_active: Boolean(refreshedProfile.is_active),
            avatar_url: refreshedProfile.avatar_url || refreshedProfile.avatar || "",
          });
        }
        setAvatarFile(null);
        setRoleRejectReason("");
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
        extractApiErrorMessage(
          error,
          isEdit
            ? "Không thể cập nhật người dùng."
            : "Không thể tạo người dùng."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button
        onClick={() => navigate("/admin/users")}
        className="admin-button admin-button-ghost"
      >
        <FiChevronLeft /> Quay lại danh sách
      </button>

      <div className="admin-detail-shell">
        <div className="admin-detail-header">
          <div className="admin-detail-heading">
            <p className="admin-list-kicker">Quản trị</p>
            <h1 className="admin-list-title">
              {isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="admin-button admin-button-primary"
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu cập nhật" : "Tạo người dùng"}
          </button>
        </div>

        {errorMessage && (
          <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
        ) : (
          <div className="admin-detail-grid is-two-column">
            <div className="admin-detail-panel">
              <p className="admin-detail-panel-title">Hồ sơ hiện tại</p>
              <div className="mt-4 flex flex-col gap-4">
                {avatarPreview ? (
                  <div className="admin-detail-media is-square">
                    <OptimizedImage
                      src={avatarPreview}
                      alt={formValues.display_name || "User avatar"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="admin-detail-placeholder">
                    Chưa có ảnh đại diện
                  </div>
                )}
                <label className="admin-button admin-button-ghost cursor-pointer">
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
                <SourceFileCard
                  variant="admin"
                  type="avatar"
                  file={avatarFile}
                  url={formValues.avatar_url}
                  emptyLabel="Chưa có avatar"
                  helperText="Avatar hiện tại của người dùng"
                  existingText="AVATAR • Đang dùng avatar hiện tại"
                  pendingText="AVATAR • Avatar mới sẽ được áp dụng sau khi lưu"
                />

                <div className="admin-detail-meta-grid">
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Tên hiển thị</p>
                    <p className="admin-detail-meta-value">
                      {user?.display_name || user?.name || formValues.display_name || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Email</p>
                    <p className="admin-detail-meta-value">{user?.email || formValues.email || "-"}</p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Vai trò</p>
                    <p className="admin-detail-meta-value">{user?.role || formValues.role}</p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Trạng thái</p>
                    <p className="admin-detail-meta-value">
                      {formValues.is_active ? "Đang hoạt động" : "Tạm khóa"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-detail-panel">
              <p className="admin-detail-panel-title">
                {isEdit ? "Cập nhật người dùng" : "Thông tin người dùng"}
              </p>
              <div className="mt-4 admin-detail-form-grid">
                <input
                  value={formValues.display_name}
                  onChange={handleChange("display_name")}
                  placeholder="Tên hiển thị"
                  className="admin-field"
                />
                <input
                  value={formValues.email}
                  onChange={handleChange("email")}
                  placeholder="Email"
                  className="admin-field"
                />
                {!isEdit && (
                  <div className="space-y-1.5">
                    <input
                      type="password"
                      value={formValues.password}
                      onChange={handleChange("password")}
                      placeholder="Mật khẩu"
                      className="admin-field"
                    />
                    {fieldErrors.password ? (
                      <p className="px-1 text-xs text-rose-300">
                        {fieldErrors.password}
                      </p>
                    ) : (
                      <p className="px-1 text-xs text-white/45">
                        {PASSWORD_REQUIREMENTS_TEXT}
                      </p>
                    )}
                  </div>
                )}
                <select
                  value={formValues.role}
                  onChange={handleChange("role")}
                  className="admin-select-field"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {requiresRoleRejectReason && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <textarea
                      value={roleRejectReason}
                      onChange={(event) => {
                        setRoleRejectReason(event.target.value);
                        setFieldErrors((prev) => ({
                          ...prev,
                          roleRejectReason: "",
                        }));
                      }}
                      placeholder="Lý do hạ quyền nghệ sĩ"
                      className="admin-field admin-detail-textarea"
                      rows={3}
                    />
                    {fieldErrors.roleRejectReason ? (
                      <p className="px-1 text-xs text-rose-300">
                        {fieldErrors.roleRejectReason}
                      </p>
                    ) : (
                      <p className="px-1 text-xs text-white/45">
                        Lý do này sẽ được gửi kèm khi đổi role từ ARTIST về USER.
                      </p>
                    )}
                  </div>
                )}
                <label className="admin-detail-label is-full flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151617] px-4 py-3 text-white/72">
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
                  className="admin-button admin-button-primary"
                >
                  {saving ? "Đang lưu..." : isEdit ? "Lưu cập nhật" : "Tạo người dùng"}
                </button>
              </div>
            </div>
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
