import useAuthStore from "../store/auth.store";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("123456"); // đổi theo user của bạn
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login({ email, password });

      // Điều hướng theo role (đúng Phase 0)
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
    <div className="min-h-screen bg-gradient-to-br from-[#1f1232] via-[#22103a] to-[#0c0914] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-lg font-bold text-[#170f23]">
              ♪
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Music Platform
              </p>
              <h1 className="text-2xl font-semibold">Chào mừng trở lại</h1>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/40 placeholder:text-white/40"
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
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/40 placeholder:text-white/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                type="password"
                autoComplete="current-password"
                required
              />
              <p className="text-xs text-white/50">
                Mẹo: tài khoản demo đã được điền sẵn.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 text-sm text-red-100 px-4 py-3">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-[#0c0914] font-semibold py-3 rounded-lg shadow-lg shadow-green-500/20 transition transform hover:-translate-y-[1px] hover:shadow-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-white/50">
            Bảo mật OAuth · Lưu trữ an toàn · Trải nghiệm nghe nhạc mượt mà
          </div>
        </div>
      </div>
    </div>
  );
}