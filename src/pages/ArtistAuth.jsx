import { AnimatePresence, motion } from "framer-motion";
import { startTransition, useEffect, useState } from "react";
import { FiMusic, FiRadio } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import {
  AuthCard,
  AuthField,
  AuthFloatingAlert,
  AuthMessage,
  AuthModal,
  AuthPasswordField,
} from "../components/auth/AuthPrimitives";
import useMediaQuery from "../hooks/useMediaQuery";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import {
  extractApiErrorMessage,
  extractApiFieldError,
} from "../utils/apiError";
import { showBootIntro } from "../utils/bootIntro";
import {
  getConfirmPasswordError,
  getPasswordValidationError,
  PASSWORD_REQUIREMENTS_TEXT,
} from "../utils/passwordValidation";

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

const rejectNonArtistLogin = (role) => role === "ADMIN" || !role;
const hasArtistIntent = (user) =>
  user?.artist_register_intent === true || user?.artist_register_intent === 1;
const canUseArtistAuth = (user) =>
  user?.role === "ARTIST" || user?.role === "USER" || hasArtistIntent(user);

const DISPLAY_NAME_REGEX = /^[\p{L}\p{N}\s._'-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO_ARTIST_EMAIL = "sontung@gmail.com";
const DEMO_ARTIST_PASSWORD = "123456";

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

  const passwordError = getPasswordValidationError(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  const confirmPasswordError = getConfirmPasswordError(
    password,
    confirmPassword
  );
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }

  return errors;
};

export default function ArtistAuth() {
  const isCompactAuthMotion = useMediaQuery("(max-width: 767px), (hover: none) and (pointer: coarse)");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    loginArtist,
    registerArtist,
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

  const [authNotice, setAuthNotice] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [errorPopup, setErrorPopup] = useState("");

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
  const [forgotFieldErrors, setForgotFieldErrors] = useState({});
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
    const authRequiredMessage = location.state?.authRequiredMessage || "";
    if (!authRequiredMessage) return;

    startTransition(() => {
      setAuthNotice(authRequiredMessage);
    });
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, location.state, navigate]);

  const showError = (message) => {
    setLoginError(message);
    setErrorPopup(message);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (role === "ARTIST") {
      setAuthContext("default");
      showBootIntro({ pathname: "/artist/dashboard" });
      navigate("/artist/dashboard", { replace: true });
      return;
    }
    if (authContext === "artist_request") {
      showBootIntro({ pathname: "/artist-request" });
      navigate("/artist-request", { replace: true });
    }
  }, [isAuthenticated, role, authContext, navigate, setAuthContext]);

  usePageMetadata({
    title: mode === "login" ? "Đăng nhập nghệ sĩ" : "Đăng ký nghệ sĩ",
    description:
      mode === "login"
        ? "Đăng nhập cổng nghệ sĩ Khoaluan Music."
        : "Đăng ký tài khoản nghệ sĩ trên Khoaluan Music.",
    url: "/artist-auth",
    robots: "noindex, nofollow",
  });

  const handleNavigate = (nextMode) => {
    setMode(nextMode);
  };

  const navigateWithIntro = (to) => {
    showBootIntro({ pathname: to });
    navigate(to, { replace: true });
  };

  const completeArtistAuthEntry = async ({ email, password }) => {
    const user = await loginArtist({ email, password });

    if (!canUseArtistAuth(user)) {
      showError("Tài khoản này chưa đăng ký yêu cầu trở thành nghệ sĩ.");
      logout();
      return null;
    }

    if (rejectNonArtistLogin(user.role)) {
      showError("Tài khoản này không thể đăng nhập vào cổng nghệ sĩ.");
      logout();
      return null;
    }

    if (user.role === "ARTIST") {
      setAuthContext("default");
      navigateWithIntro("/artist/dashboard");
      return user;
    }

    navigateWithIntro("/artist-request");
    return user;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      await completeArtistAuthEntry({
        email: loginEmail,
        password: loginPassword,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Đăng nhập thất bại, thử lại nhé.";
      showError(msg);
    }
  };

  const handleDemoLogin = async () => {
    setLoginEmail(DEMO_ARTIST_EMAIL);
    setLoginPassword(DEMO_ARTIST_PASSWORD);
    setAuthNotice("");
    setRegisterNotice("");
    setLoginError("");

    try {
      await completeArtistAuthEntry({
        email: DEMO_ARTIST_EMAIL,
        password: DEMO_ARTIST_PASSWORD,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể vào bằng tài khoản demo nghệ sĩ, vui lòng thử lại.";
      showError(msg);
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
        setRegisterNotice(result.message || "Vui lòng kiểm tra email để xác nhận tài khoản nghệ sĩ.");
        return navigate(`/verify-email?email=${encodeURIComponent(registerEmail)}&intent=artist`);
      }

      if (!canUseArtistAuth(result)) {
        setRegisterError("Tài khoản này chưa đăng ký yêu cầu trở thành nghệ sĩ.");
        logout();
        return;
      }

      if (rejectNonArtistLogin(result.role)) {
        setRegisterError("Tài khoản này không thể đăng ký qua cổng nghệ sĩ.");
        logout();
        return;
      }

      if (result.role === "ARTIST") {
        setAuthContext("default");
        return navigateWithIntro("/artist/dashboard");
      }
      return navigateWithIntro("/artist-request");
    } catch (err) {
      const backendPasswordError = extractApiFieldError(err, ["password"]);

      if (backendPasswordError) {
        setRegisterFieldErrors((prev) => ({
          ...prev,
          password: backendPasswordError,
        }));
      }

      const msg = extractApiErrorMessage(err, "Đăng ký thất bại, thử lại nhé.");
      setRegisterError(msg);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail) {
      showError("Vui lòng nhập email để nhận mã xác thực.");
      return;
    }

    setLoginError("");
    setForgotFieldErrors({});
    try {
      const message = await forgotPassword({ email: forgotEmail });
      setForgotMessage(message || "Nếu email hợp lệ, hệ thống đã gửi mã đặt lại mật khẩu.");
      setIsResetStep(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi mã đặt lại mật khẩu, vui lòng thử lại.";
      showError(msg);
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

    const nextPasswordError = getPasswordValidationError(forgotNewPassword, {
      requiredMessage: "Vui lòng nhập mật khẩu mới.",
    });

    if (nextPasswordError) {
      setForgotFieldErrors({ newPassword: nextPasswordError });
      showError(nextPasswordError);
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
      setForgotFieldErrors({});
    } catch (err) {
      const backendPasswordError = extractApiFieldError(err, ["new_password"]);

      if (backendPasswordError) {
        setForgotFieldErrors({ newPassword: backendPasswordError });
      }

      const msg = extractApiErrorMessage(
        err,
        "Không thể đặt lại mật khẩu, vui lòng thử lại."
      );
      showError(msg);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(loginEmail || registerEmail);
    setForgotMessage("");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotFieldErrors({});
    setShowResetPassword(false);
    setIsResetStep(false);
    setForgotOpen(true);
  };

  const isLoginMode = mode === "login";
  const isRegisterMode = mode === "register";
  const layoutEnabled = !isCompactAuthMotion;
  const effectiveCardLayoutTransition = isCompactAuthMotion
    ? { duration: 0.12, ease: "linear" }
    : cardLayoutTransition;
  const effectiveFormSwapTransition = isCompactAuthMotion
    ? { duration: 0.14, ease: "easeOut" }
    : formSwapTransition;
  const compactFormSwapTransition = {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1],
  };
  const compactFormMotion = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };
  const loginFields = (
    <>
      <AuthField
        label="Email"
        value={loginEmail}
        onChange={(event) => setLoginEmail(event.target.value)}
        placeholder="email@artist.com"
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

      {authNotice ? <AuthMessage tone="info">{authNotice}</AuthMessage> : null}
      {loginError ? <AuthMessage tone="error">{loginError}</AuthMessage> : null}
    </>
  );
  const registerFields = (
    <>
      <AuthField
        label="Tên hiển thị"
        value={displayName}
        onChange={(event) => {
          setDisplayName(event.target.value);
          setRegisterFieldErrors((prev) => ({ ...prev, displayName: "" }));
        }}
        placeholder="Tên nghệ sĩ"
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
        placeholder="email@artist.com"
        type="email"
        autoComplete="email"
        required={isRegisterMode}
        disabled={!isRegisterMode}
        error={registerFieldErrors.email}
      />

      <AuthPasswordField
        label="Mật khẩu"
        value={registerPassword}
        onChange={(event) => {
          setRegisterPassword(event.target.value);
          setRegisterFieldErrors((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
          }));
        }}
        autoComplete="new-password"
        showPassword={showRegisterPassword}
        toggleShowPassword={() => setShowRegisterPassword((prev) => !prev)}
        required={isRegisterMode}
        disabled={!isRegisterMode}
        error={registerFieldErrors.password}
        helper={registerFieldErrors.password ? "" : PASSWORD_REQUIREMENTS_TEXT}
      />

      <AuthPasswordField
        label="Nhập lại mật khẩu"
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          setRegisterFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }}
        autoComplete="new-password"
        showPassword={showConfirmPassword}
        toggleShowPassword={() => setShowConfirmPassword((prev) => !prev)}
        required={isRegisterMode}
        disabled={!isRegisterMode}
        error={registerFieldErrors.confirmPassword}
      />

      {authNotice ? <AuthMessage tone="info">{authNotice}</AuthMessage> : null}
      {registerNotice ? <AuthMessage tone="success">{registerNotice}</AuthMessage> : null}
      {registerError ? <AuthMessage tone="error">{registerError}</AuthMessage> : null}
    </>
  );

  const formSection = (
    <MotionDiv
      layout={layoutEnabled}
      initial={false}
      transition={effectiveCardLayoutTransition}
      className="auth-form-wrap relative mx-auto w-full max-w-[448px]"
    >
      <AuthCard variant="main" className="auth-fit-card p-5 sm:p-6">
        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          <MotionDiv
            layout={layoutEnabled ? "position" : false}
            transition={effectiveCardLayoutTransition}
            className="flex flex-col items-center text-center"
          >
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
              {mode === "login" ? "Artist Sign In" : "Artist Sign Up"}
            </h1>
            <p className="auth-fit-subtitle mt-1 text-[13px] text-white/48">
              {mode === "login" ? "Truy cập tài khoản nghệ sĩ" : "Tạo tài khoản để gửi hồ sơ"}
            </p>
          </MotionDiv>

          <MotionDiv
            layout={layoutEnabled}
            initial={false}
            transition={effectiveCardLayoutTransition}
            className="auth-form-stage relative mt-4 overflow-hidden"
          >
            {isCompactAuthMotion ? (
              <AnimatePresence initial={false} mode="wait">
                <MotionDiv
                  key={mode}
                  initial={compactFormMotion.initial}
                  animate={compactFormMotion.animate}
                  exit={compactFormMotion.exit}
                  transition={compactFormSwapTransition}
                  className={`auth-form-panel will-change-transform ${
                    mode === "register" ? "space-y-3 pb-1" : "space-y-3"
                  }`}
                >
                  {mode === "login" ? loginFields : registerFields}
                </MotionDiv>
              </AnimatePresence>
            ) : (
              <>
                <MotionDiv
                  initial={false}
                  animate={
                    mode === "login"
                      ? { opacity: 1, x: 0, y: 0, scale: 1 }
                      : { opacity: 0, x: -14, y: 4, scale: 0.994 }
                  }
                  transition={effectiveFormSwapTransition}
                  className={`auth-form-panel space-y-3 will-change-transform ${
                    mode === "login" ? "is-active relative" : "is-inactive pointer-events-none absolute inset-0"
                  }`}
                >
                  {loginFields}
                </MotionDiv>

                <MotionDiv
                  initial={false}
                  animate={
                    mode === "register"
                      ? { opacity: 1, x: 0, y: 0, scale: 1 }
                      : { opacity: 0, x: 14, y: 4, scale: 0.994 }
                  }
                  transition={effectiveFormSwapTransition}
                  className={`auth-form-panel space-y-3 pb-1 will-change-transform ${
                    mode === "register" ? "is-active relative" : "is-inactive pointer-events-none absolute inset-0"
                  }`}
                >
                  {registerFields}
                </MotionDiv>
              </>
            )}
          </MotionDiv>

          <MotionDiv
            layout={layoutEnabled ? "position" : false}
            transition={effectiveCardLayoutTransition}
            className="auth-actions mt-3.5 space-y-2.5"
          >
            {mode === "login" ? (
              <button disabled={loading} type="submit" className="auth-ui-primary">
                {loading ? "Đang đăng nhập..." : "Vào cổng nghệ sĩ"}
              </button>
            ) : (
              <button disabled={loading} type="submit" className="auth-ui-primary">
                {loading ? "Đang đăng ký..." : "Bắt đầu đăng ký"}
              </button>
            )}

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="auth-ui-secondary"
            >
              Vào nhanh với tài khoản demo nghệ sĩ
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
                Người dùng?{" "}
                <button type="button" onClick={() => navigate("/login")} className="font-medium auth-ui-link">
                  Về trang đăng nhập
                </button>
              </p>
            </div>
          </MotionDiv>
        </form>
      </AuthCard>
      <p className="pointer-events-none absolute left-1/2 top-full mt-4 -translate-x-1/2 whitespace-nowrap text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
        KLTN Pham Dinh Minh CS64-NEU
      </p>
    </MotionDiv>
  );

  return (
    <>
      <AuthFloatingAlert message={errorPopup} />

      <AuthShell
        theme="artist"
        showHeader={false}
        centerViewport
        watermarkSide="left"
        contentClassName="max-w-[430px]"
      >
        {formSection}
      </AuthShell>

      <AuthModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        theme="artist"
        icon={<FiRadio size={18} />}
        title="Khôi phục mật khẩu"
        description={isResetStep ? "Nhập mã và mật khẩu mới." : "Nhập email artist để nhận mã xác thực."}
      >
        <AuthField
          label="Email"
          value={forgotEmail}
          onChange={(event) => setForgotEmail(event.target.value)}
          type="email"
          placeholder="email@artist.com"
          autoComplete="email"
          required
        />

        {isResetStep ? (
          <>
            <AuthField
              label="Mã xác thực"
              value={forgotCode}
              onChange={(event) => setForgotCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              inputClassName="text-center tracking-[0.35em]"
              required
            />

            <AuthPasswordField
              label="Mật khẩu mới"
              value={forgotNewPassword}
              onChange={(event) => {
                setForgotNewPassword(event.target.value);
                setForgotFieldErrors((prev) => ({ ...prev, newPassword: "" }));
              }}
              autoComplete="new-password"
              showPassword={showResetPassword}
              toggleShowPassword={() => setShowResetPassword((prev) => !prev)}
              required
              error={forgotFieldErrors.newPassword}
              helper={
                forgotFieldErrors.newPassword ? "" : PASSWORD_REQUIREMENTS_TEXT
              }
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
