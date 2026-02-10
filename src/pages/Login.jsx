import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/auth.store";
import { signInWithGoogle, signOutFirebaseSession } from "../utils/firebase";

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
  { key: "login", label: "Đăng nhập" },
  { key: "register", label: "Đăng ký" },
];

const extractFirebaseErrorMessage = (err) => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || err?.message;

  if (
    status === 409 ||
    String(message || "")
      .toLowerCase()
      .includes("email already exists")
  ) {
    return "Email đã tồn tại trong hệ thống. Vui lòng đăng nhập bằng email/mật khẩu.";
  }

  return message || "Đăng nhập Google thất bại, thử lại nhé.";
};

export default function Login({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    login,
    register,
    firebaseLogin,
    resendVerification,
    verifyEmailRegistration,
    forgotPassword,
    resetPassword,
    loading,
  } = useAuthStore();
  const [mode, setMode] = useState(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerNotice, setRegisterNotice] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isResetStep, setIsResetStep] = useState(false);

  useEffect(() => {
    if (mode !== "login") return;

    const verifiedFlag = (searchParams.get("verified") || "").toLowerCase();
    const successFlag = (searchParams.get("success") || "").toLowerCase();
    const status = (searchParams.get("status") || "").toLowerCase();
    const isVerifiedFromQuery =
      verifiedFlag === "1" ||
      verifiedFlag === "true" ||
      successFlag === "1" ||
      successFlag === "true" ||
      status === "verified" ||
      status === "success";

    const isVerifiedFromReferrer =
      typeof document !== "undefined" &&
      document.referrer.includes("/api/auth/verify-email/confirm");

    if (isVerifiedFromQuery || isVerifiedFromReferrer) {
      setLoginNotice("Xác nhận email thành công. Bạn có thể đăng nhập ngay.");
      localStorage.setItem("email_verification_completed_at", `${Date.now()}`);

      if (isVerifiedFromQuery) {
        const nextSearch = new URLSearchParams(searchParams);
        ["verified", "success", "status"].forEach((key) => nextSearch.delete(key));
        setSearchParams(nextSearch, { replace: true });
      }

      return;
    }

    if (location.state?.emailVerified) {
      setLoginNotice("Xác nhận email thành công. Bạn có thể đăng nhập ngay.");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, mode, navigate, searchParams, setSearchParams]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const helpText = useMemo(() => {
    return mode === "login"
      ? "Đăng nhập để tiếp tục khám phá kho nhạc cá nhân hoá."
      : "Tạo tài khoản miễn phí và bắt đầu hành trình âm nhạc của bạn.";
  }, [mode]);

  const handleNavigate = (nextMode) => {
    setMode(nextMode);
    navigate(nextMode === "login" ? "/login" : "/register");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const user = await login({ email: loginEmail, password: loginPassword });

      if (user.role === "ADMIN") return navigate("/admin", { replace: true });
      if (user.role === "ARTIST")
        return navigate("/artist/dashboard", { replace: true });
      return navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại, thử lại nhé.";
      setLoginError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    setRegisterError("");
    setRegisterNotice("");
    try {
      const { idToken } = await signInWithGoogle();
      const user = await firebaseLogin({ idToken });

      if (user.role === "ADMIN") return navigate("/admin", { replace: true });
      if (user.role === "ARTIST")
        return navigate("/artist/dashboard", { replace: true });
      return navigate("/", { replace: true });
    } catch (err) {
      await signOutFirebaseSession();
      const msg = extractFirebaseErrorMessage(err);
      if (mode === "register") {
        setRegisterError(msg);
      } else {
        setLoginError(msg);
      }
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegisterError("");

    if (registerPassword !== confirmPassword) {
      setRegisterError("Mật khẩu nhập lại chưa khớp.");
      return;
    }

    try {
      const result = await register({
        email: registerEmail,
        password: registerPassword,
        display_name: displayName,
      });

      if (result?.requires_email_verification) {
        setAwaitingVerification(true);
        setVerificationCode("");
        setVerificationError("");
        setRegisterNotice(
          result.message ||
            "Vui lòng nhập mã xác thực 6 số đã gửi về email để hoàn tất đăng ký."
        );
        return;
      }

      if (result.role === "ADMIN") return navigate("/admin", { replace: true });
      if (result.role === "ARTIST")
        return navigate("/artist/dashboard", { replace: true });
      return navigate("/", { replace: true });
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

  const handleVerifyCode = async () => {
    if (!registerEmail) {
      setVerificationError("Không tìm thấy email đăng ký để xác thực.");
      return;
    }

    const sanitizedCode = verificationCode.trim();
    if (!/^\d{6}$/.test(sanitizedCode)) {
      setVerificationError("Mã xác thực phải gồm đúng 6 chữ số.");
      return;
    }

    setVerificationError("");
    setRegisterError("");

    try {
      const user = await verifyEmailRegistration({
        email: registerEmail,
        verification_code: sanitizedCode,
        authContext: "default",
      });

      if (user.role === "ADMIN") return navigate("/admin", { replace: true });
      if (user.role === "ARTIST") {
        return navigate("/artist/dashboard", { replace: true });
      }
      return navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xác thực mã, vui lòng thử lại.";
      setVerificationError(msg);
    }
  };


  const renderPasswordInput = ({
    label,
    value,
    onChange,
    placeholder = "••••••",
    autoComplete,
    showPassword,
    toggleShowPassword,
    inputClassName,
  }) => (
    <label className="block space-y-2 text-sm">
      <span className="text-white/70">{label}</span>
      <div className="relative">
        <input
          className={`${inputClassName} pr-12`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-3 inline-flex items-center text-white/60 transition hover:text-white"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </label>
  );

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail) {
      setForgotError("Vui lòng nhập email để nhận mã xác thực.");
      return;
    }

    setForgotError("");
    try {
      const message = await forgotPassword({ email: forgotEmail });
      setForgotMessage(message || "Nếu email hợp lệ, hệ thống đã gửi mã đặt lại mật khẩu.");
      setIsResetStep(true);
    } catch (err) {
      setForgotError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi mã đặt lại mật khẩu, vui lòng thử lại."
      );
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!forgotEmail || !forgotCode || !forgotNewPassword) {
      setForgotError("Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới.");
      return;
    }

    if (!/^\d{6}$/.test(forgotCode.trim())) {
      setForgotError("Mã xác thực phải gồm đúng 6 chữ số.");
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setForgotError("");
    try {
      const message = await resetPassword({
        email: forgotEmail,
        verification_code: forgotCode.trim(),
        new_password: forgotNewPassword,
      });

      setForgotMessage(message || "Đặt lại mật khẩu thành công.");
      setIsForgotPasswordMode(false);
      setIsResetStep(false);
      setLoginPassword("");
      setLoginEmail(forgotEmail);
      setForgotCode("");
      setForgotNewPassword("");
    } catch (err) {
      setForgotError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể đặt lại mật khẩu, vui lòng thử lại."
      );
    }
  };

  const handleArtistPortal = () => {
    navigate("/artist-auth");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b0b12] px-4 py-4 text-white sm:py-8 lg:py-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <motion.div
          className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_35px_120px_rgba(0,0,0,0.6)] lg:max-h-[calc(100dvh-3rem)]"
          initial="initial"
          animate="animate"
          variants={glowVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -left-32 top-8 h-64 w-64 rounded-full bg-green-400/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 right-6 h-72 w-72 rounded-full bg-emerald-400/25 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-start lg:gap-8 lg:p-8 xl:p-10">
            <div className="relative z-10 space-y-6 lg:space-y-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-lg font-semibold text-[#0c0914] shadow-lg shadow-green-400/30">
                  ♪
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">
                    Music Platform
                  </p>
                  <h1 className="text-3xl font-semibold">
                    Chào mừng bạn đến với MP
                  </h1>
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-white/70">
                {helpText}
              </p>

              <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                {modes.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    className="relative px-6 py-2 text-sm font-medium"
                  >
                    {mode === item.key && (
                      <motion.span
                        layoutId="auth-pill"
                        className="absolute inset-0 rounded-full bg-white/15"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
                <h2 className="text-lg font-semibold">Quyền lợi thành viên</h2>
                <ul className="space-y-3 text-sm text-white/70">
                  <li>• Gợi ý playlist thông minh theo thói quen nghe.</li>
                  <li>• Lưu lịch sử, đồng bộ thiết bị và nghe liên tục.</li>
                  <li>• Theo dõi nghệ sĩ, album và xu hướng hot nhất.</li>
                </ul> 
              </div>
            </div>

            <motion.div
              className="relative z-10 lg:w-[420px] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1"
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
                      <h2 className="text-2xl font-semibold">Đăng nhập</h2>
                      <p className="mt-1 text-sm text-white/60">
                        Nhập thông tin để tiếp tục nghe nhạc.
                      </p>
                    </div>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Email</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="email@example.com"
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
                      toggleShowPassword: () =>
                        setShowLoginPassword((prev) => !prev),
                      inputClassName:
                        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/40",
                    })}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail);
                          setForgotError("");
                          setForgotMessage("");
                          setForgotCode("");
                          setForgotNewPassword("");
                          setIsResetStep(false);
                          setIsForgotPasswordMode((prev) => !prev);
                        }}
                        className="text-xs text-green-300 transition hover:text-green-200"
                      >
                        {isForgotPasswordMode ? "Đóng quên mật khẩu" : "Quên mật khẩu?"}
                      </button>
                    </div>

                    {isForgotPasswordMode && (
                      <div className="space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4">
                        <p className="text-sm text-white/80">
                          Nhập email để nhận mã xác thực và đặt lại mật khẩu.
                        </p>

                        <label className="block space-y-1.5 text-sm">
                          <span className="text-white/70">Email</span>
                          <input
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                            value={forgotEmail}
                            onChange={(event) => setForgotEmail(event.target.value)}
                            placeholder="email@example.com"
                            type="email"
                          />
                        </label>

                        {!isResetStep ? (
                          <button
                            type="button"
                            onClick={handleForgotPasswordRequest}
                            disabled={loading}
                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Gửi mã xác thực
                          </button>
                        ) : (
                          <>
                            <label className="block space-y-1.5 text-sm">
                              <span className="text-white/70">Mã xác thực 6 số</span>
                              <input
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm tracking-[0.35em] text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                                value={forgotCode}
                                onChange={(event) =>
                                  setForgotCode(
                                    event.target.value.replace(/\D/g, "").slice(0, 6)
                                  )
                                }
                                placeholder="123456"
                                inputMode="numeric"
                              />
                            </label>

                            {renderPasswordInput({
                              label: "Mật khẩu mới",
                              value: forgotNewPassword,
                              onChange: (event) =>
                                setForgotNewPassword(event.target.value),
                              autoComplete: "new-password",
                              showPassword: showResetPassword,
                              toggleShowPassword: () =>
                                setShowResetPassword((prev) => !prev),
                              inputClassName:
                                "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
                            })}

                            <button
                              type="button"
                              onClick={handleConfirmResetPassword}
                              disabled={loading}
                              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-2.5 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition hover:-translate-y-[1px] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Xác nhận đặt lại mật khẩu
                            </button>
                          </>
                        )}

                        {forgotMessage && (
                          <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                            {forgotMessage}
                          </div>
                        )}

                        {forgotError && (
                          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {forgotError}
                          </div>
                        )}
                      </div>
                    )}

                    {loginError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {loginError}
                      </div>
                    )}

                    {loginNotice && (
                      <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {loginNotice}
                      </div>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-green-500/25 transition hover:-translate-y-[1px] hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
                      <span className="h-px flex-1 bg-white/10" />
                      hoặc
                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FcGoogle className="text-lg" />
                      Đăng nhập với Google
                    </button>

                    <p className="text-center text-xs text-white/50">
                      Chưa có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => handleNavigate("register")}
                        className="text-green-300 transition hover:text-green-200"
                      >
                        Đăng ký ngay
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={handleArtistPortal}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
                    >
                      Đăng ký trở thành nghệ sĩ
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    className="w-full space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:space-y-4 sm:p-6"
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
                      <h2 className="text-xl font-semibold sm:text-2xl">Tạo tài khoản</h2>
                      <p className="mt-1 text-xs text-white/60 sm:text-sm">
                        Đăng ký để lưu playlist và theo dõi nghệ sĩ.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1.5 text-sm">
                        <span className="text-white/70">Tên hiển thị</span>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                          value={displayName}
                          onChange={(event) => setDisplayName(event.target.value)}
                          placeholder="Tên hiển thị"
                          type="text"
                          autoComplete="name"
                          required
                        />
                      </label>

                      <label className="block space-y-1.5 text-sm">
                        <span className="text-white/70">Email</span>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                          value={registerEmail}
                          onChange={(event) => setRegisterEmail(event.target.value)}
                          placeholder="email@example.com"
                          type="email"
                          autoComplete="email"
                          required
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {renderPasswordInput({
                        label: "Mật khẩu",
                        value: registerPassword,
                        onChange: (event) => setRegisterPassword(event.target.value),
                        autoComplete: "new-password",
                        showPassword: showRegisterPassword,
                        toggleShowPassword: () =>
                          setShowRegisterPassword((prev) => !prev),
                        inputClassName:
                          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
                      })}
                      {renderPasswordInput({
                        label: "Nhập lại",
                        value: confirmPassword,
                        onChange: (event) => setConfirmPassword(event.target.value),
                        autoComplete: "new-password",
                        showPassword: showConfirmPassword,
                        toggleShowPassword: () =>
                          setShowConfirmPassword((prev) => !prev),
                        inputClassName:
                          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
                      })}
                    </div>

                    {registerNotice && (
                      <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {registerNotice}
                      </div>
                    )}

                    {awaitingVerification && (
                      <div className="space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4">
                        <label className="block space-y-1.5 text-sm">
                          <span className="text-white/70">Mã xác thực 6 số</span>
                          <input
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm tracking-[0.35em] text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                            value={verificationCode}
                            onChange={(event) =>
                              setVerificationCode(
                                event.target.value.replace(/\D/g, "").slice(0, 6)
                              )
                            }
                            placeholder="123456"
                            inputMode="numeric"
                          />
                        </label>

                        {verificationError && (
                          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {verificationError}
                          </div>
                        )}

                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-2.5 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition hover:-translate-y-[1px] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {loading ? "Đang xác thực..." : "Xác thực mã"}
                          </button>

                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Gửi lại mã
                          </button>
                        </div>
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
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-2.5 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition hover:-translate-y-[1px] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>

                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
                      <span className="h-px flex-1 bg-white/10" />
                      hoặc
                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FcGoogle className="text-lg" />
                      Đăng nhập với Google
                    </button>

                    <p className="text-center text-xs text-white/50">
                      Đã có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => handleNavigate("login")}
                        className="text-green-300 transition hover:text-green-200"
                      >
                        Quay lại đăng nhập
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={handleArtistPortal}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
                    >
                      Đăng ký trở thành nghệ sĩ
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
