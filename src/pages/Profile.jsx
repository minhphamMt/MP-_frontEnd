import { useEffect, useMemo, useState } from "react";
import {
  FiCamera,
  FiCheckCircle,
  FiKey,
  FiMail,
  FiUser,
} from "react-icons/fi";
import Toast from "../components/common/Toast";
import {
  getCurrentUser,
  updateUserPassword,
  updateUserProfile,
  uploadUserAvatar,
} from "../api/user.api";
import useAuthStore from "../store/auth.store";
import { resolveAssetUrl } from "../utils/asset";
import OptimizedImage from "../components/common/OptimizedImage";

const emptyProfile = {
  display_name: "",
  email: "",
  avatar_url: "",
};

export default function Profile() {
  const authUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [profile, setProfile] = useState(emptyProfile);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [toast, setToast] = useState({ title: "", message: "" });
  const isGoogleAccount = useMemo(() => {
    const provider =
      authUser?.provider ||
      authUser?.auth_provider ||
      authUser?.login_provider;
    return (
      String(provider || "").toLowerCase() === "google" ||
      Boolean(authUser?.firebase_uid || authUser?.google_id)
    );
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setProfile({
        display_name: authUser.display_name || "",
        email: authUser.email || "",
        avatar_url: authUser.avatar_url || "",
      });
    }
  }, [authUser]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        const data = res.data?.data || res.data;
        if (data) {
          updateUser(data);
        }
      } catch (error) {
        setToast({
          title: "Không thể tải hồ sơ",
          message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
        });
      }
    };

    if (!authUser?.id) {
      loadUser();
    }
  }, [authUser?.id, updateUser]);

  const hasProfileChanges = useMemo(() => {
    if (!authUser) return false;
    if (isGoogleAccount) {
      return (
        profile.display_name !== (authUser.display_name || "") ||
        profile.avatar_url !== (authUser.avatar_url || "")
      );
    }
    return (
      profile.display_name !== (authUser.display_name || "") ||
      profile.email !== (authUser.email || "") ||
      profile.avatar_url !== (authUser.avatar_url || "")
    );
  }, [authUser, profile]);

  const handleProfileChange = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswords((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const maxAvatarLength = 480;


  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        title: "Tệp không hợp lệ",
        message: "Vui lòng chọn một tệp hình ảnh.",
      });
      return;
    }
    setLoadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await uploadUserAvatar(formData);
      const payload = res.data?.data || res.data;
      const avatarUrl = payload?.avatar_url;
      const updatedUser = payload?.user;

      if (avatarUrl) {
        setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      }
      if (updatedUser) {
        updateUser(updatedUser);
      }

      setToast({
        title: "Tải ảnh thành công",
        message: "Ảnh đại diện đã được cập nhật.",
      });
    } catch (error) {
      setToast({
        title: "Tải ảnh thất bại",
        message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
       } finally {
      setLoadingAvatar(false);
      event.target.value = "";
    }
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    if (!hasProfileChanges) return;
    if (profile.avatar_url && profile.avatar_url.length > maxAvatarLength) {
      setToast({
        title: "Link avatar quá dài",
        message: "Vui lòng chọn ảnh nhỏ hơn hoặc dán URL ngắn hơn.",
      });
      return;
    }

    setLoadingProfile(true);
    try {
      const payload = {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      ...(isGoogleAccount ? {} : { email: profile.email }),
      };
      const res = await updateUserProfile(payload);
      const updated = res.data?.data || res.data;
      if (updated) {
        updateUser(updated);
      }
      setToast({
        title: "Cập nhật thành công",
        message: "Hồ sơ của bạn đã được lưu.",
      });
    } catch (error) {
      setToast({
        title: "Cập nhật thất bại",
        message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      setToast({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setToast({
        title: "Mật khẩu chưa khớp",
        message: "Vui lòng nhập lại mật khẩu mới giống nhau.",
      });
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await updateUserPassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      const updated = res.data?.user || res.data?.data?.user;
      if (updated) {
        updateUser(updated);
      }
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setToast({
        title: "Đổi mật khẩu",
        message: res.data?.message || "Mật khẩu đã được cập nhật.",
      });
    } catch (error) {
      setToast({
        title: "Đổi mật khẩu thất bại",
        message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />

      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/10">
              {profile.avatar_url ? (
                <OptimizedImage
                  src={resolveAssetUrl(profile.avatar_url)}
                  alt={profile.display_name || "User avatar"}
                  className="h-full w-full object-cover"
                />

              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-white/70">
                  {(profile.display_name || authUser?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                Hồ sơ cá nhân
              </p>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                {profile.display_name || authUser?.email || "Tài khoản của bạn"}
              </h1>
              <p className="mt-1 text-sm text-white/60">
                Cập nhật thông tin và bảo mật tài khoản.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {authUser?.role || "USER"}
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-100">
              Đang hoạt động
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={submitProfile}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.12),transparent_45%)]" />
          <div className="relative space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                Thông tin cơ bản
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Chỉnh sửa hồ sơ</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiUser className="text-cyan-300" /> Tên hiển thị
                </span>
                <input
                  value={profile.display_name}
                  onChange={handleProfileChange("display_name")}
                  placeholder="Nhập tên hiển thị"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                />
              </label>

              {!isGoogleAccount ? (
                <label className="space-y-2 text-sm text-white/70">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                    <FiMail className="text-emerald-300" /> Email
                  </span>
                  <input
                    value={profile.email}
                    onChange={handleProfileChange("email")}
                    type="email"
                    placeholder="you@email.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:bg-white/10"
                  />
                </label>
              ) : (
                <div className="space-y-2 text-sm text-white/70">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                    <FiMail className="text-emerald-300" /> Email
                  </span>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                    {profile.email || "Chưa có email"}
                  </div>
                  <p className="text-xs text-white/45">
                    Tài khoản Google không thể thay đổi email.
                  </p>
                </div>
              )}
            </div>

            {/* <label className="space-y-2 text-sm text-white/70">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                <FiCamera className="text-violet-300" /> Avatar URL
              </span>
              <input
                value={profile.avatar_url}
                onChange={handleProfileChange("avatar_url")}
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/60 focus:bg-white/10"
              />
              <p className="text-xs text-white/45">
                Dán đường dẫn ảnh để cập nhật avatar của bạn.
              </p>
            </label> */}

            <label className="space-y-2 text-sm text-white/70">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                <FiCamera className="text-cyan-300" /> Tải ảnh từ máy
              </span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loadingAvatar}
                  className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 file:transition hover:border-white/30 hover:bg-white/10"
                />
                <span className="text-xs text-white/50">
                  Ảnh sẽ được tải lên máy chủ và cập nhật ngay lập tức.
                </span>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-0.5 text-emerald-300" />
                <div>
                  <p className="font-semibold text-white">Lưu ý</p>
                  <p className="text-xs text-white/60">
                    Thông tin đã cập nhật sẽ đồng bộ cho toàn bộ hệ thống.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={!hasProfileChanges || loadingProfile}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-400/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>

         {!isGoogleAccount && (
          <form
            onSubmit={submitPassword}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.18),transparent_45%)]" />
            <div className="relative space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Bảo mật
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  Đổi mật khẩu
                </h2>
              </div>

              <label className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiKey className="text-cyan-300" /> Mật khẩu hiện tại
                </span>
                <input
                  type="password"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange("oldPassword")}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                />
              </label>

              <label className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiKey className="text-emerald-300" /> Mật khẩu mới
                </span>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:bg-white/10"
                />
              </label>

              <label className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiKey className="text-violet-300" /> Xác nhận mật khẩu mới
                </span>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/60 focus:bg-white/10"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                Gợi ý: Hãy dùng mật khẩu mạnh kết hợp chữ hoa, chữ thường và ký tự đặc biệt.
              </div>
              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-violet-400/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
