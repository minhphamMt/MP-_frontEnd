import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // đổi theo user của bạn
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login({ email, password });

      // Điều hướng theo role (giữ nguyên logic)
      if (user.role === "ADMIN") return navigate("/admin", { replace: true });
      if (user.role === "ARTIST") return navigate("/artist", { replace: true });
      return navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại, thử lại nhé.";
      setError(msg);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
          {/* GLOW */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

          {/* HEADER */}
          <div className="relative mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-lg font-bold text-[#0c0914] shadow-lg shadow-green-400/30">
              ♪
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Music Platform
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Chào mừng trở lại
              </h1>
            </div>
          </div>

          {/* FORM */}
          <form className="relative space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40
                           focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Mật khẩu
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40
                           focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                type="password"
                autoComplete="current-password"
                required
              />
             
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 py-3 text-sm font-semibold text-[#0c0914]
                         shadow-lg shadow-green-500/25 transition
                         hover:-translate-y-[1px] hover:shadow-green-500/40
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="relative mt-8 text-center text-xs text-white/50">
            Bảo mật OAuth · Lưu trữ an toàn · Trải nghiệm nghe nhạc mượt mà
          </div>
        </div>
      </div>
    </div>
  );
}
