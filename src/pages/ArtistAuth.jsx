import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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

export default function ArtistAuth() {
  const navigate = useNavigate();
  const {
    loginArtist,
    registerArtist,
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

    if (registerPassword !== confirmPassword) {
      setRegisterError("Mật khẩu nhập lại chưa khớp.");
      return;
    }

    try {
      const user = await registerArtist({
        email: registerEmail,
        password: registerPassword,
        display_name: displayName,
      });

      if (!hasArtistIntent(user)) {
        setRegisterError(
          "Tài khoản này chưa đăng ký yêu cầu trở thành nghệ sĩ."
        );
        logout();
        return;
      }

      if (rejectNonArtistLogin(user.role)) {
        setRegisterError(
          "Tài khoản này không thể đăng ký qua cổng nghệ sĩ."
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
        "Đăng ký thất bại, thử lại nhé.";
      setRegisterError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b12] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <motion.div
          className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_35px_120px_rgba(0,0,0,0.6)]"
          initial="initial"
          animate="animate"
          variants={glowVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -left-32 top-8 h-64 w-64 rounded-full bg-indigo-400/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 right-6 h-72 w-72 rounded-full bg-sky-400/25 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="grid gap-10 p-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-center">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 text-lg font-semibold text-[#0c0914] shadow-lg shadow-sky-400/30">
                  ★
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">
                    Artist Portal
                  </p>
                  <h1 className="text-3xl font-semibold">
                    Đăng ký trở thành nghệ sĩ
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
                    className="relative px-4 py-2 text-xs font-medium"
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

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
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
                className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
              >
                ← Quay lại đăng nhập người dùng
              </button>
            </div>

            <motion.div
              className="relative z-10 min-h-[560px] lg:w-[420px]"
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    className="w-full space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
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

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Mật khẩu</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                        value={loginPassword}
                        onChange={(event) =>
                          setLoginPassword(event.target.value)
                        }
                        placeholder="••••••"
                        type="password"
                        autoComplete="current-password"
                        required
                      />
                    </label>

                    {loginError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {loginError}
                      </div>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-sky-500/25 transition hover:-translate-y-[1px] hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    className="w-full space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
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
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Tên nghệ sĩ"
                        type="text"
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Email</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        placeholder="email@artist.com"
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-2 text-sm">
                        <span className="text-white/70">Mật khẩu</span>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                          value={registerPassword}
                          onChange={(event) =>
                            setRegisterPassword(event.target.value)
                          }
                          placeholder="••••••"
                          type="password"
                          autoComplete="new-password"
                          required
                        />
                      </label>
                      <label className="block space-y-2 text-sm">
                        <span className="text-white/70">Nhập lại</span>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="••••••"
                          type="password"
                          autoComplete="new-password"
                          required
                        />
                      </label>
                    </div>

                    {registerError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {registerError}
                      </div>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-indigo-500/25 transition hover:-translate-y-[1px] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng ký..." : "Đăng ký"}
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
