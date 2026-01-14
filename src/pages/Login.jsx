import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

const formVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

const glowVariants = {
  initial: { opacity: 0.4, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

const modes = [
  { key: "login", label: "Đăng nhập" },
  { key: "register", label: "Đăng ký" },
];

export default function Login({ initialMode = "login" }) {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();
  const [mode, setMode] = useState(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");

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
      if (user.role === "ARTIST") return navigate("/artist", { replace: true });
      return navigate("/", { replace: true });
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
      const user = await register({
        email: registerEmail,
        password: registerPassword,
        display_name: displayName,
      });

      if (user.role === "ADMIN") return navigate("/admin", { replace: true });
      if (user.role === "ARTIST") return navigate("/artist", { replace: true });
      return navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại, thử lại nhé.";
      setRegisterError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <motion.div
          className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_35px_120px_rgba(0,0,0,0.6)]"
          initial="initial"
          animate="animate"
          variants={glowVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -left-32 top-8 h-64 w-64 rounded-full bg-green-400/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 right-6 h-72 w-72 rounded-full bg-emerald-400/25 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="grid gap-10 p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="relative z-10 space-y-8">
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

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold">Quyền lợi thành viên</h2>
                <ul className="space-y-3 text-sm text-white/70">
                  <li>• Gợi ý playlist thông minh theo thói quen nghe.</li>
                  <li>• Lưu lịch sử, đồng bộ thiết bị và nghe liên tục.</li>
                  <li>• Theo dõi nghệ sĩ, album và xu hướng hot nhất.</li>
                </ul>
              </div>
            </div>

             <div className="relative z-10 min-h-[560px]">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
                    onSubmit={handleLogin}
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeOut" }}
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

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Mật khẩu</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/40"
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
                      className="w-full rounded-xl bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-green-500/25 transition hover:-translate-y-[1px] hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
                    onSubmit={handleRegister}
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div>
                      <h2 className="text-2xl font-semibold">Tạo tài khoản</h2>
                      <p className="mt-1 text-sm text-white/60">
                        Đăng ký để lưu playlist và theo dõi nghệ sĩ.
                      </p>
                    </div>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Tên hiển thị</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Nhập tên bạn muốn hiển thị"
                        type="text"
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="block space-y-2 text-sm">
                      <span className="text-white/70">Email</span>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        placeholder="email@example.com"
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-2 text-sm">
                        <span className="text-white/70">Mật khẩu</span>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
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
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
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
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition hover:-translate-y-[1px] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang đăng ký..." : "Đăng ký"}
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
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}