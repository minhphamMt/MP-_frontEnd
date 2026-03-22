import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiCamera,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiMail,
  FiX,
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
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const [profile, setProfile] = useState(emptyProfile);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isResetStep, setIsResetStep] = useState(false);
  const [showForgotResetPassword, setShowForgotResetPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);
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
    return (
      profile.display_name !== (authUser.display_name || "") ||
      profile.avatar_url !== (authUser.avatar_url || "")
    );
  }, [authUser, profile.avatar_url, profile.display_name]);

  const handleProfileChange = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswords((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
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

  const openForgotModal = () => {
    setForgotEmail(profile.email || authUser?.email || "");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotMessage("");
    setIsResetStep(false);
    setShowForgotResetPassword(false);
    setForgotOpen(true);
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail.trim()) {
      setToast({
        title: "Thiếu email",
        message: "Vui lòng nhập email để nhận mã xác thực.",
      });
      return;
    }

    setLoadingForgot(true);
    try {
      const message = await forgotPassword({ email: forgotEmail.trim() });
      setForgotMessage(message || "Nếu email hợp lệ, hệ thống đã gửi mã đặt lại mật khẩu.");
      setIsResetStep(true);
    } catch (error) {
      setToast({
        title: "Gửi mã thất bại",
        message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoadingForgot(false);
    }
  };

  const handleForgotPasswordReset = async () => {
    if (!forgotEmail.trim() || !forgotCode.trim() || !forgotNewPassword) {
      setToast({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới.",
      });
      return;
    }

    if (!/^\d{6}$/.test(forgotCode.trim())) {
      setToast({
        title: "Mã chưa hợp lệ",
        message: "Mã xác thực phải gồm đúng 6 chữ số.",
      });
      return;
    }

    if (forgotNewPassword.length < 6) {
      setToast({
        title: "Mật khẩu quá ngắn",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      return;
    }

    setLoadingForgot(true);
    try {
      const message = await resetPassword({
        email: forgotEmail.trim(),
        verification_code: forgotCode.trim(),
        new_password: forgotNewPassword,
      });

      setForgotOpen(false);
      setForgotCode("");
      setForgotNewPassword("");
      setIsResetStep(false);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setToast({
        title: "Đặt lại mật khẩu",
        message: message || "Mật khẩu đã được cập nhật thành công.",
      });
    } catch (error) {
      setToast({
        title: "Đặt lại thất bại",
        message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <div className="user-page-shell min-h-screen space-y-8 px-4 py-6 sm:px-8">
      <Toast
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ title: "", message: "" })}
      />

      <header className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1a1a1a] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
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
            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              {authUser?.role || "USER"}
            </div>
            <div className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-xs font-bold text-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.35)]">
              Đang hoạt động
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={submitProfile}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1a1a1a] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
        >
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
                  <FiUser className="text-white/70" /> Tên hiển thị
                </span>
                <input
                  value={profile.display_name}
                  onChange={handleProfileChange("display_name")}
                  placeholder="Nhập tên hiển thị"
                  className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
                />
              </label>

              <div className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiMail className="text-white/70" /> Email
                </span>
                <input
                  value={profile.email}
                  type="email"
                  readOnly
                  aria-readonly="true"
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65 outline-none"
                />
                <p className="text-xs text-white/45">
                  Email dùng để đăng nhập và xác nhận tài khoản nên không thể đổi tại đây.
                </p>
              </div>
            </div>

            {/* <label className="space-y-2 text-sm text-white/70">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                <FiCamera className="text-emerald-300" /> Avatar URL
              </span>
              <input
                value={profile.avatar_url}
                onChange={handleProfileChange("avatar_url")}
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:bg-white/10"
              />
              <p className="text-xs text-white/45">
                Dán đường dẫn ảnh để cập nhật avatar của bạn.
              </p>
            </label> */}

            <label className="space-y-2 text-sm text-white/70">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                <FiCamera className="text-white/70" /> Tải ảnh từ máy
              </span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loadingAvatar}
                  className="w-full rounded-2xl border border-dashed border-white/20 bg-[#111111] px-4 py-3 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white/80 file:transition md:hover:border-white/30"
                />
                <span className="text-xs text-white/50">
                  Ảnh sẽ được tải lên máy chủ và cập nhật ngay lập tức.
                </span>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-0.5 text-white/70" />
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
                className="user-btn-primary px-6 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>

         {!isGoogleAccount && (
          <form
            onSubmit={submitPassword}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1a1a1a] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
          >
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
                  <FiKey className="text-white/70" /> Mật khẩu hiện tại
                </span>
                <div className="relative">
                  <input
                    type={showPasswords.oldPassword ? "text" : "password"}
                    value={passwords.oldPassword}
                    onChange={handlePasswordChange("oldPassword")}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("oldPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 transition md:hover:bg-white/10 md:hover:text-white"
                    aria-label={showPasswords.oldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPasswords.oldPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </label>

              <label className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiKey className="text-white/70" /> Mật khẩu mới
                </span>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 transition md:hover:bg-white/10 md:hover:text-white"
                    aria-label={showPasswords.newPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPasswords.newPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </label>

              <label className="space-y-2 text-sm text-white/70">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <FiKey className="text-white/70" /> Xác nhận mật khẩu mới
                </span>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange("confirmPassword")}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 transition md:hover:bg-white/10 md:hover:text-white"
                    aria-label={showPasswords.confirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPasswords.confirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                Gợi ý: Hãy dùng mật khẩu mạnh kết hợp chữ hoa, chữ thường và ký tự đặc biệt.
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-medium text-emerald-200 transition md:hover:text-emerald-100"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button
                type="submit"
                disabled={loadingPassword}
                className="user-btn-primary w-full px-6 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        )}
      </div>

      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              className="w-full max-w-md rounded-[30px] border border-white/14 bg-[#0d1319]/98 p-6 shadow-[0_26px_90px_rgba(0,0,0,0.58)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">Quên mật khẩu</h3>
                  <p className="mt-1 text-sm text-white/65">
                    {isResetStep
                      ? "Nhập mã xác thực và mật khẩu mới."
                      : "Mã xác thực sẽ được gửi tới email tài khoản của bạn."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="rounded-[14px] border border-white/10 p-2 text-white/65 transition md:hover:bg-white/10 md:hover:text-white"
                  aria-label="Đóng"
                >
                  <FiX />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Email</span>
                  <input
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 outline-none"
                    value={forgotEmail}
                    type="email"
                    autoComplete="email"
                    readOnly
                    aria-readonly="true"
                  />
                </label>

                {isResetStep && (
                  <>
                    <label className="block space-y-1.5 text-sm">
                      <span className="text-white/70">Mã xác thực 6 số</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm tracking-[0.35em] text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                        value={forgotCode}
                        onChange={(event) =>
                          setForgotCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="123456"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="block space-y-1.5 text-sm">
                      <span className="text-white/70">Mật khẩu mới</span>
                      <div className="relative">
                        <input
                          type={showForgotResetPassword ? "text" : "password"}
                          value={forgotNewPassword}
                          onChange={(event) => setForgotNewPassword(event.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotResetPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 transition md:hover:bg-white/10 md:hover:text-white"
                          aria-label={
                            showForgotResetPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                        >
                          {showForgotResetPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </label>
                  </>
                )}

                {forgotMessage && (
                  <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {forgotMessage}
                  </div>
                )}

                {!isResetStep ? (
                  <button
                    type="button"
                    onClick={handleForgotPasswordRequest}
                    disabled={loadingForgot}
                    className="user-btn-primary w-full px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingForgot ? "Đang xử lý..." : "Gửi mã xác thực"}
                  </button>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleForgotPasswordReset}
                      disabled={loadingForgot}
                      className="user-btn-primary w-full px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingForgot ? "Đang xử lý..." : "Xác nhận mật khẩu mới"}
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotPasswordRequest}
                      disabled={loadingForgot}
                      className="user-btn-secondary w-full px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Gửi lại mã
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
