import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiMusic } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import {
  AuthCard,
  AuthDivider,
  AuthField,
  AuthMessage,
  AuthModal,
  AuthPasswordField,
} from "../components/auth/AuthPrimitives";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import { showBootIntro } from "../utils/bootIntro";
import { signInWithGoogle, signOutFirebaseSession } from "../utils/firebase";

const MotionDiv = motion.div;
const cardLayoutTransition = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 0.92,
};
const formSwapTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

const DISPLAY_NAME_REGEX = /^[\p{L}\p{N}\s._'-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [errorPopup, setErrorPopup] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginNotice, setLoginNotice] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerNotice, setRegisterNotice] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});

  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

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
    if (!errorPopup) return undefined;
    const timeoutId = setTimeout(() => setErrorPopup(""), 3500);
    return () => clearTimeout(timeoutId);
  }, [errorPopup]);

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

  usePageMetadata({
    title: mode === "login" ? "Đăng nhập" : "Đăng ký",
    description:
      mode === "login"
        ? "Đăng nhập Khoaluan Music để tiếp tục nghe nhạc."
        : "Tạo tài khoản Khoaluan Music để bắt đầu nghe nhạc.",
    url: mode === "login" ? "/login" : "/register",
    robots: "noindex, nofollow",
  });

  const showError = (message) => {
    setErrorPopup(message);
  };

  const handleNavigate = (nextMode) => {
    setMode(nextMode);
    setRegisterNotice("");
    navigate(nextMode === "login" ? "/login" : "/register");
  };

  const navigateWithIntro = (to) => {
    showBootIntro({ pathname: to });
    navigate(to, { replace: true });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await login({ email: loginEmail, password: loginPassword });
      if (user.role === "ADMIN") return navigateWithIntro("/admin");
      if (user.role === "ARTIST") return navigateWithIntro("/artist/dashboard");
      return navigateWithIntro("/");
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Đăng nhập thất bại, thử lại nhé.");
    }
  };

  const handleGoogleLogin = async () => {
    setRegisterNotice("");
    try {
      const { idToken } = await signInWithGoogle();
      const user = await firebaseLogin({ idToken });
      if (user.role === "ADMIN") return navigateWithIntro("/admin");
      if (user.role === "ARTIST") return navigateWithIntro("/artist/dashboard");
      return navigateWithIntro("/");
    } catch (err) {
      await signOutFirebaseSession();
      showError(extractFirebaseErrorMessage(err));
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const nextErrors = validateRegisterFields({
      displayName,
      email: registerEmail,
      password: registerPassword,
      confirmPassword,
    });
    setRegisterFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showError(Object.values(nextErrors)[0]);
      return;
    }

    try {
      const result = await register({
        email: registerEmail,
        password: registerPassword,
        display_name: displayName.trim(),
      });

      if (result?.requires_email_verification) {
        setAwaitingVerification(true);
        setVerificationCode("");
        setRegisterNotice(
          result.message ||
            "Nhập mã xác thực 6 số đã gửi về email để hoàn tất đăng ký."
        );
        return;
      }

      if (result.role === "ADMIN") return navigateWithIntro("/admin");
      if (result.role === "ARTIST") return navigateWithIntro("/artist/dashboard");
      return navigateWithIntro("/");
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Đăng ký thất bại, thử lại nhé.");
    }
  };

  const handleResendVerification = async () => {
    if (!registerEmail) {
      showError("Vui lòng nhập email để gửi lại xác thực.");
      return;
    }

    try {
      const message = await resendVerification({ email: registerEmail });
      setRegisterNotice(message || "Đã gửi lại email xác thực.");
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi lại email xác thực, vui lòng thử lại."
      );
    }
  };

  const handleVerifyCode = async () => {
    if (!registerEmail) {
      showError("Không tìm thấy email đăng ký để xác thực.");
      return;
    }

    const sanitizedCode = verificationCode.trim();
    if (!/^\d{6}$/.test(sanitizedCode)) {
      showError("Mã xác thực phải gồm đúng 6 chữ số.");
      return;
    }

    try {
      const user = await verifyEmailRegistration({
        email: registerEmail,
        verification_code: sanitizedCode,
        authContext: "default",
      });

      if (user.role === "ADMIN") return navigateWithIntro("/admin");
      if (user.role === "ARTIST") return navigateWithIntro("/artist/dashboard");
      return navigateWithIntro("/");
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể xác thực mã, vui lòng thử lại."
      );
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail) {
      showError("Vui lòng nhập email để nhận mã xác thực.");
      return;
    }

    try {
      const message = await forgotPassword({ email: forgotEmail });
      setForgotMessage(message || "Nếu email hợp lệ, hệ thống đã gửi mã đặt lại mật khẩu.");
      setIsResetStep(true);
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi mã đặt lại mật khẩu, vui lòng thử lại."
      );
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!forgotEmail || !forgotCode || !forgotNewPassword) {
      showError("Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới.");
      return;
    }
    if (!/^\d{6}$/.test(forgotCode.trim())) {
      showError("Mã xác thực phải gồm đúng 6 chữ số.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      showError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

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
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể đặt lại mật khẩu, vui lòng thử lại."
      );
    }
  };

  const openForgotModal = () => {
    setForgotEmail(loginEmail);
    setForgotMessage("");
    setForgotCode("");
    setForgotNewPassword("");
    setShowResetPassword(false);
    setIsResetStep(false);
    setForgotOpen(true);
  };

  const isLoginMode = mode === "login";
  const isRegisterMode = mode === "register";

  const formSection = (
    <MotionDiv
      layout
      initial={false}
      transition={cardLayoutTransition}
      className="auth-form-wrap relative mx-auto w-full max-w-[448px]"
    >
      <AuthCard variant="main" className="auth-fit-card p-5 sm:p-6">
        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          <MotionDiv layout="position" transition={cardLayoutTransition} className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-0.5 hover:border-white/16"
              aria-label="Về trang chủ"
            >
              <img
                src="/logo-brand.png"
                alt="Khoaluan Music"
                className="h-full w-full rounded-[14px] object-cover"
                draggable="false"
              />
            </button>
            <h1 className="auth-fit-title mt-4 text-[1.7rem] font-semibold tracking-[-0.04em] text-white">
              {mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </h1>
            <p className="auth-fit-subtitle mt-1 text-[13px] text-white/48">
              {mode === "login" ? "Tiếp tục tài khoản của bạn" : "Tạo tài khoản mới thật nhanh"}
            </p>
          </MotionDiv>

          <MotionDiv
            layout
            initial={false}
            transition={cardLayoutTransition}
            className="auth-form-stage relative mt-4 overflow-hidden"
          >
              <MotionDiv
                initial={false}
                animate={
                  mode === "login"
                    ? { opacity: 1, x: 0, y: 0, scale: 1 }
                    : { opacity: 0, x: -14, y: 4, scale: 0.994 }
                }
                transition={formSwapTransition}
                className={`space-y-3 will-change-transform ${mode === "login" ? "relative" : "pointer-events-none absolute inset-0"}`}
              >
                <AuthField
                  label="Email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  autoComplete="email"
                  required={isLoginMode}
                  disabled={!isLoginMode}
                />

                <AuthPasswordField
                  label="Mật khẩu"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  autoComplete="current-password"
                  showPassword={showLoginPassword}
                  toggleShowPassword={() => setShowLoginPassword((prev) => !prev)}
                  required={isLoginMode}
                  disabled={!isLoginMode}
                />

                <div className="flex items-center justify-end">
                  <button type="button" onClick={openForgotModal} className="text-xs font-medium auth-ui-link">
                    Quên mật khẩu?
                  </button>
                </div>

                {loginNotice ? <AuthMessage tone="success">{loginNotice}</AuthMessage> : null}
              </MotionDiv>

              <MotionDiv
                initial={false}
                animate={
                  mode === "register"
                    ? { opacity: 1, x: 0, y: 0, scale: 1 }
                    : { opacity: 0, x: 14, y: 4, scale: 0.994 }
                }
                transition={formSwapTransition}
                className={`space-y-3 pb-1 will-change-transform ${mode === "register" ? "relative" : "pointer-events-none absolute inset-0"}`}
              >
                <div className="grid gap-3">
                  <AuthField
                    label="Tên hiển thị"
                    value={displayName}
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                      setRegisterFieldErrors((prev) => ({ ...prev, displayName: "" }));
                    }}
                    placeholder="Tên hiển thị"
                    type="text"
                  autoComplete="name"
                  required={isRegisterMode}
                  disabled={!isRegisterMode}
                  error={registerFieldErrors.displayName}
                  />

                  <AuthField
                    label="Email"
                    value={registerEmail}
                    onChange={(event) => {
                      setRegisterEmail(event.target.value);
                      setRegisterFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="email@example.com"
                    type="email"
                  autoComplete="email"
                  required={isRegisterMode}
                  disabled={!isRegisterMode}
                  error={registerFieldErrors.email}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <AuthPasswordField
                    label="Mật khẩu"
                    value={registerPassword}
                    onChange={(event) => {
                      setRegisterPassword(event.target.value);
                      setRegisterFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    autoComplete="new-password"
                    showPassword={showRegisterPassword}
                    toggleShowPassword={() => setShowRegisterPassword((prev) => !prev)}
                    required={isRegisterMode}
                    disabled={!isRegisterMode}
                    error={registerFieldErrors.password}
                  />

                  <AuthPasswordField
                    label="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setRegisterFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: "",
                      }));
                    }}
                    autoComplete="new-password"
                    showPassword={showConfirmPassword}
                    toggleShowPassword={() => setShowConfirmPassword((prev) => !prev)}
                    required={isRegisterMode}
                    disabled={!isRegisterMode}
                    error={registerFieldErrors.confirmPassword}
                  />
                </div>

                {registerNotice ? <AuthMessage tone="success">{registerNotice}</AuthMessage> : null}
              </MotionDiv>
          </MotionDiv>

          <MotionDiv
            layout="position"
            transition={cardLayoutTransition}
            className="auth-actions mt-3.5 space-y-2.5"
          >
            <button disabled={loading} type="submit" className="auth-ui-primary">
              {loading
                ? mode === "login"
                  ? "Đang đăng nhập..."
                  : "Đang đăng ký..."
                : mode === "login"
                  ? "Đăng nhập"
                  : "Tạo tài khoản"}
            </button>

            <AuthDivider>hoặc</AuthDivider>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="auth-ui-secondary"
            >
              <FcGoogle className="text-lg" />
              Tiếp tục với Google
            </button>

            <div className="space-y-1 pt-1 text-center text-[12px] text-white/48">
              <p>
                {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  type="button"
                  onClick={() => handleNavigate(mode === "login" ? "register" : "login")}
                  className="font-medium auth-ui-link"
                >
                  {mode === "login" ? "Đăng ký" : "Đăng nhập"}
                </button>
              </p>
              <p>
                Nghệ sĩ?{" "}
                <button type="button" onClick={() => navigate("/artist-auth")} className="font-medium auth-ui-link">
                  Artist Portal
                </button>
              </p>
            </div>
          </MotionDiv>
        </form>
      </AuthCard>
      <p className="pointer-events-none absolute left-1/2 top-full mt-4 -translate-x-1/2 whitespace-nowrap text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
        KLTN MINH PHẠM CS64-NEU
      </p>
    </MotionDiv>
  );

  return (
    <>
      <AuthShell theme="listener" showHeader={false} centerViewport contentClassName="max-w-[430px]">
        {formSection}
      </AuthShell>

      <AnimatePresence>
        {errorPopup ? (
          <MotionDiv
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="auth-ui-floating-alert"
          >
            {errorPopup}
          </MotionDiv>
        ) : null}
      </AnimatePresence>

      <AuthModal
        open={awaitingVerification}
        onClose={() => setAwaitingVerification(false)}
        theme="listener"
        icon={<FiMail size={18} />}
        title="Xác thực email"
        description="Nhập mã 6 số để hoàn tất đăng ký."
      >
        <AuthField
          label="Mã xác thực"
          value={verificationCode}
          onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          inputClassName="text-center text-base tracking-[0.35em]"
        />

        <div className="grid gap-2.5 sm:grid-cols-2">
          <button type="button" onClick={handleVerifyCode} disabled={loading} className="auth-ui-primary">
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            className="auth-ui-secondary"
          >
            Gửi lại mã
          </button>
        </div>
      </AuthModal>

      <AuthModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        theme="listener"
        icon={<FiMusic size={18} />}
        title="Khôi phục mật khẩu"
        description={isResetStep ? "Nhập mã và mật khẩu mới." : "Nhập email để nhận mã xác thực."}
      >
        <AuthField
          label="Email"
          value={forgotEmail}
          onChange={(event) => setForgotEmail(event.target.value)}
          placeholder="email@example.com"
          type="email"
          autoComplete="email"
        />

        {isResetStep ? (
          <>
            <AuthField
              label="Mã xác thực 6 số"
              value={forgotCode}
              onChange={(event) => setForgotCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              inputClassName="text-center tracking-[0.35em]"
            />

            <AuthPasswordField
              label="Mật khẩu mới"
              value={forgotNewPassword}
              onChange={(event) => setForgotNewPassword(event.target.value)}
              autoComplete="new-password"
              showPassword={showResetPassword}
              toggleShowPassword={() => setShowResetPassword((prev) => !prev)}
            />
          </>
        ) : null}

        {forgotMessage ? <AuthMessage tone="success">{forgotMessage}</AuthMessage> : null}

        {!isResetStep ? (
          <button
            type="button"
            onClick={handleForgotPasswordRequest}
            disabled={loading}
            className="auth-ui-primary"
          >
            Gửi mã xác thực
          </button>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleConfirmResetPassword}
              disabled={loading}
              className="auth-ui-primary"
            >
              Xác nhận mật khẩu mới
            </button>
            <button
              type="button"
              onClick={handleForgotPasswordRequest}
              disabled={loading}
              className="auth-ui-secondary"
            >
              Gửi lại mã
            </button>
          </div>
        )}
      </AuthModal>
    </>
  );
}
