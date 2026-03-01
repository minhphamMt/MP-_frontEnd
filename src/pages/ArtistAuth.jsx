import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

const formVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

const glowVariants = {
  initial: { opacity: 0.4, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

const modes = [
  { key: "login", label: "Đăng nhập nghệ sĩ" },
  { key: "register", label: "Đăng ký nghệ sĩ" },
];

const rejectNonArtistLogin = (role) => role === "ADMIN" || !role;
const hasArtistIntent = (user) =>
  user?.artist_register_intent === true || user?.artist_register_intent === 1;


const DISPLAY_NAME_REGEX = /^[\p{L}\p{N}\s._'-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterFields = ({ displayName, email, password, confirmPassword }) => {
  const errors = {};
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    errors.displayName = "Vui lòng nhập tên hiển thị.";
  } else if (trimmedName.length < 2 || trimmedName.length > 40) {
    errors.displayName = "Tên hiển thị phải từ 2 đến 40 ký tự.";
  } else if (!DISPLAY_NAME_REGEX.test(trimmedName)) {
    errors.displayName = "Tên hiển thị chỉ gồm chữ, số và ký tự . _ ' -.";
  }

  if (!email.trim()) {
    errors.email = "Vui lòng nhập email.";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Email không đúng định dạng.";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";
  }

  return errors;
};

export default function ArtistAuth() {
  const navigate = useNavigate();
  const {
    loginArtist,
    registerArtist,
    resendVerification,
    forgotPassword,
    resetPassword,
    loading,
    logout,
    setAuthContext,
    isAuthenticated,
    role,
    authContext,
  } = useAuthStore();
  const [mode, setMode] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerNotice, setRegisterNotice] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isResetStep, setIsResetStep] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (role === "ARTIST") {
      setAuthContext("default");
      navigate("/artist/dashboard", { replace: true });
      return;
    }
    if (authContext === "artist_request") {
      navigate("/artist-request", { replace: true });
    }
  }, [isAuthenticated, role, authContext, navigate, setAuthContext]);

  const helpText = useMemo(() => {
    return mode === "login"
      ? "Đăng nhập tài khoản nghệ sĩ để gửi yêu cầu xét duyệt."
      : "Tạo tài khoản nghệ sĩ mới để bắt đầu đăng ký.";
  }, [mode]);

  const handleNavigate = (nextMode) => {
    setMode(nextMode);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const user = await loginArtist({
        email: loginEmail,
        password: loginPassword,
      });

      if (!hasArtistIntent(user)) {
        setLoginError(
          "Tài khoản này chưa đăng ký yêu cầu trở thành nghệ sĩ."
        );
        logout();
        return;
      }

      if (rejectNonArtistLogin(user.role)) {
        setLoginError(
          "Tài khoản này không thể đăng nhập vào cổng nghệ sĩ."
        );
        logout();
        return;
      }

      if (user.role === "ARTIST") {
        setAuthContext("default");
        return navigate("/artist/dashboard", { replace: true });
      }
      return navigate("/artist-request", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại, thử lại nhé.";
      setLoginError(msg);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegisterError("");
    setRegisterNotice("");

    const nextErrors = validateRegisterFields({
      displayName,
      email: registerEmail,
      password: registerPassword,
      confirmPassword,
    });
    setRegisterFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setRegisterError(Object.values(nextErrors)[0]);
      return;
    }

    try {
      const result = await registerArtist({
        email: registerEmail,
        password: registerPassword,
        display_name: displayName.trim(),
      });

      if (result?.requires_email_verification) {
        setRegisterNotice(
          result.message ||
            "Vui lòng kiểm tra email để xác nhận tài khoản nghệ sĩ."
        );
        return navigate(
          `/verify-email?email=${encodeURIComponent(registerEmail)}&intent=artist`
        );
      }

      if (!hasArtistIntent(result)) {
        setRegisterError(
          "Tài khoản này chưa đăng ký yêu cầu trở thành nghệ sĩ."
        );
        logout();
        return;
      }

      if (rejectNonArtistLogin(result.role)) {
        setRegisterError(
          "Tài khoản này không thể đăng ký qua cổng nghệ sĩ."
        );
        logout();
        return;
      }

      if (result.role === "ARTIST") {
        setAuthContext("default");
        return navigate("/artist/dashboard", { replace: true });
      }
      return navigate("/artist-request", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại, thử lại nhé.";
      setRegisterError(msg);
    }
  };

  const handleResendVerification = async () => {
    if (!registerEmail) {
      setRegisterError("Vui lòng nhập email để gửi lại xác thực.");
      return;
    }

    setRegisterError("");
    try {
      const message = await resendVerification({ email: registerEmail });
      setRegisterNotice(message || "Đã gửi lại email xác thực.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi lại email xác thực, vui lòng thử lại.";
      setRegisterError(msg);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail) {
      setLoginError("Vui lòng nhập email để nhận mã xác thực.");
      return;
    }

    setLoginError("");
    try {
      const message = await forgotPassword({ email: forgotEmail });
      setForgotMessage(message || "Nếu email hợp lệ, hệ thống đã gửi mã đặt lại mật khẩu.");
      setIsResetStep(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi mã đặt lại mật khẩu, vui lòng thử lại.";
      setLoginError(msg);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!forgotEmail || !forgotCode || !forgotNewPassword) {
      setLoginError("Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới.");
      return;
    }
    if (!/^\d{6}$/.test(forgotCode.trim())) {
      setLoginError("Mã xác thực phải gồm đúng 6 chữ số.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setLoginError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setLoginError("");
    try {
      const message = await resetPassword({
        email: forgotEmail,
        verification_code: forgotCode.trim(),
        new_password: forgotNewPassword,
      });

      setForgotMessage(message || "Đặt lại mật khẩu thành công.");
      setForgotOpen(false);
      setIsResetStep(false);
      setLoginPassword("");
      setLoginEmail(forgotEmail);
      setForgotCode("");
      setForgotNewPassword("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đặt lại mật khẩu, vui lòng thử lại.";
      setLoginError(msg);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(loginEmail || registerEmail);
    setForgotMessage("");
    setForgotCode("");
    setForgotNewPassword("");
    setShowResetPassword(false);
    setIsResetStep(false);
    setForgotOpen(true);
  };

  const renderPasswordInput = ({
    label,
    value,
    onChange,
    autoComplete,
    showPassword,
    toggleShowPassword,
    className,
  }) => (
    <label className="block space-y-2 text-sm">
      <span className="text-white/70">{label}</span>
      <div className="relative">
        <input
          className={`${className} pr-12`}
          value={value}
          onChange={onChange}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-3 inline-flex items-center text-white/60 transition md:hover:text-white"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </label>
  );

  return (
    <div className="flex min-h-dvh items-start justify-center overflow-y-auto bg-[#0b0b12] px-4 py-4 text-white sm:py-6 lg:items-center">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <motion.div
          className="relative w-full overflow-visible rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_35px_120px_rgba(0,0,0,0.6)] lg:max-h-[calc(100dvh-2rem)] lg:overflow-hidden"
          initial="initial"
          animate="animate"
          variants={glowVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -left-32 top-8 h-64 w-64 rounded-full bg-indigo-400/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 right-6 h-72 w-72 rounded-full bg-sky-400/25 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-center lg:gap-8 lg:p-8 xl:p-10">
            <div className="relative z-10 space-y-6 lg:space-y-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 text-lg font-semibold text-[#0c0914] shadow-lg shadow-sky-400/30">
                  ★
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">
                    Artist Portal
                  </p>
                  <h1 className="text-2xl font-semibold sm:text-3xl">
                    Đăng ký trở thành nghệ sĩ
                  </h1>
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-white/70">
                {helpText}
              </p>

              <div className="inline-flex w-full flex-wrap rounded-2xl border border-white/10 bg-white/5 p-1 sm:w-auto sm:rounded-full">
                {modes.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    className="relative flex-1 px-3 py-2 text-xs font-medium sm:flex-none sm:px-4"
                  >
                    {mode === item.key && (
                      <motion.span
                        layoutId="artist-auth-pill"
                        className="absolute inset-0 rounded-full bg-white/15"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={
                        mode === item.key
                          ? "relative text-white"
                          : "relative text-white/60"
                      }
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 lg:p-6">
                <h2 className="text-lg font-semibold">
                  Quy trình xét duyệt nghệ sĩ
                </h2>
                <ul className="space-y-3 text-sm text-white/70">
                  <li>• Hoàn thiện hồ sơ nghệ sĩ và gửi thông tin xác thực.</li>
                  <li>• Đội ngũ MP sẽ kiểm tra và phản hồi trong 24-48h.</li>
                  <li>• Khi được duyệt, bạn sẽ truy cập bảng điều khiển nghệ sĩ.</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-sm text-white/60 transition md:hover:text-white"
              >
                ← Quay lại đăng nhập người dùng
              </button>
            </div>

            <motion.div
              className="relative z-10 lg:w-[420px]"
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    className="w-full space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:space-y-5 sm:p-8"
                    onSubmit={handleLogin}
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    transition={{
                      opacity: { duration: 0.25, ease: "easeOut" },
                      y: { duration: 0.25, ease: "easeOut" },
                    }}
                  >
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Đăng nhập nghệ sĩ
                      </h2>
                      <p className="mt-1 text-sm text-white/60">
                        Sử dụng tài khoản nghệ sĩ để gửi yêu cầu xét duyệt.
                      </p>
                    </div>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Email</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="email@artist.com"
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </label>

                    {renderPasswordInput({
                      label: "Mật khẩu",
                      value: loginPassword,
                      onChange: (event) => setLoginPassword(event.target.value),
                      autoComplete: "current-password",
                      showPassword: showLoginPassword,  
                      toggleShowPassword: () => setShowLoginPassword((prev) => !prev),
                      className:
                        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40",
                    })}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={openForgotModal}
                        className="text-xs text-sky-200 transition md:hover:text-sky-100"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    {loginError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {loginError}
                      </div>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-sky-500/25 transition md:hover:-translate-y-[1px] md:hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    className="w-full space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:space-y-5 sm:p-8"
                    onSubmit={handleRegister}
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    transition={{
                      opacity: { duration: 0.25, ease: "easeOut" },
                      y: { duration: 0.25, ease: "easeOut" },
                    }}
                  >
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Tạo tài khoản nghệ sĩ
                      </h2>
                      <p className="mt-1 text-sm text-white/60">
                        Bắt đầu hành trình nghệ sĩ cùng MP.
                      </p>
                    </div>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Tên hiển thị</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                        value={displayName}
                        onChange={(event) => {
                          setDisplayName(event.target.value);
                          setRegisterFieldErrors((prev) => ({ ...prev, displayName: "" }));
                        }}
                        placeholder="Tên nghệ sĩ"
                        type="text"
                        autoComplete="name"
                        required
                      />
                      {registerFieldErrors.displayName && (
                        <p className="text-xs text-rose-300">{registerFieldErrors.displayName}</p>
                      )}
                    </label>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Email</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                        value={registerEmail}
                        onChange={(event) => {
                          setRegisterEmail(event.target.value);
                          setRegisterFieldErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder="email@artist.com"
                        type="email"
                        autoComplete="email"
                        required
                      />
                      {registerFieldErrors.email && (
                        <p className="text-xs text-rose-300">{registerFieldErrors.email}</p>
                      )}
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      {renderPasswordInput({
                        label: "Mật khẩu",
                        value: registerPassword,
                        onChange: (event) => {
                          setRegisterPassword(event.target.value);
                          setRegisterFieldErrors((prev) => ({ ...prev, password: "" }));
                        },
                        autoComplete: "new-password",
                        showPassword: showRegisterPassword,
                        toggleShowPassword: () => setShowRegisterPassword((prev) => !prev),
                        className:
                          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40",
                      })}
                      {renderPasswordInput({
                        label: "Nhập lại",
                        value: confirmPassword,
                        onChange: (event) => {
                          setConfirmPassword(event.target.value);
                          setRegisterFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        },
                        autoComplete: "new-password",
                        showPassword: showConfirmPassword,
                        toggleShowPassword: () => setShowConfirmPassword((prev) => !prev),
                        className:
                          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40",
                      })}
                    </div>

                    {(registerFieldErrors.password || registerFieldErrors.confirmPassword) && (
                      <div className="space-y-1 text-xs text-rose-300">
                        {registerFieldErrors.password && <p>{registerFieldErrors.password}</p>}
                        {registerFieldErrors.confirmPassword && (
                          <p>{registerFieldErrors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    {/* <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={openForgotModal}
                        className="text-xs text-indigo-200 transition md:hover:text-indigo-100"
                      >
                        Quên mật khẩu?
                      </button>
                    </div> */}

                    {registerNotice && (
                      <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {registerNotice}
                      </div>
                    )}

                    {registerError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {registerError}
                      </div>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-indigo-500/25 transition md:hover:-translate-y-[1px] md:hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition md:hover:border-white/35 md:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Gửi lại email xác thực
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#10131d] p-5 text-white shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Quên mật khẩu</h3>
                  <p className="mt-1 text-sm text-white/60">
                    {isResetStep
                      ? "Nhập mã xác thực 6 số và mật khẩu mới của bạn."
                      : "Nhập email để nhận mã đặt lại mật khẩu."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="rounded-lg border border-white/10 p-2 text-white/70 transition md:hover:text-white"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Email</span>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    type="email"
                    placeholder="email@artist.com"
                    autoComplete="email"
                    required
                  />
                </label>

                {isResetStep && (
                  <>
                    <label className="block space-y-1.5 text-sm">
                      <span className="text-white/70">Mã xác thực</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                        value={forgotCode}
                        onChange={(event) => setForgotCode(event.target.value)}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        required
                      />
                    </label>

                    {renderPasswordInput({
                      label: "Mật khẩu mới",
                      value: forgotNewPassword,
                      onChange: (event) => setForgotNewPassword(event.target.value),
                      autoComplete: "new-password",
                      showPassword: showResetPassword,
                      toggleShowPassword: () => setShowResetPassword((prev) => !prev),
                      className:
                        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40",
                    })}
                  </>
                )}

                {forgotMessage && (
                  <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-100">
                    {forgotMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={isResetStep ? handleConfirmResetPassword : handleForgotPasswordRequest}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500 py-2.5 text-sm font-semibold text-[#0c0914] shadow-lg shadow-sky-500/25 transition md:hover:-translate-y-[1px] md:hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResetStep ? "Xác nhận mật khẩu mới" : "Gửi mã xác thực"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
