import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/auth.store";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailRegistration, resendVerification, loading, logout } = useAuthStore();

  const initialToken = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";
  const intent = searchParams.get("intent") || "user";

  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    initialToken
      ? "Đang xác nhận email của bạn..."
      : "Nếu chưa nhận được email xác nhận, bạn có thể yêu cầu gửi lại bên dưới."
  );

  const redirectPath = useMemo(
    () => (intent === "artist" ? "/artist-auth" : "/login"),
    [intent]
  );

  const handleVerify = async (token) => {
    const effectiveToken = token.trim();
    if (!effectiveToken) {
      return;
    }

    setError("");
    setNotice("Đang xác nhận email của bạn...");

    try {
      await verifyEmailRegistration({ token: effectiveToken });
      logout();
      setNotice("Xác nhận email thành công. Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 900);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xác nhận email, vui lòng thử lại.";
      setNotice("Vui lòng gửi lại email xác nhận để nhận liên kết mới.");
      setError(msg);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email để gửi lại xác thực.");
      return;
    }

    setError("");
    try {
      const message = await resendVerification({ email: email.trim() });
      setNotice(message || "Đã gửi lại email xác thực.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi lại email xác thực, vui lòng thử lại.";
      setError(msg);
    }
  };

  useEffect(() => {
    if (initialToken) {
      handleVerify(initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b0b12] px-4 py-8 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:p-8">
        <h1 className="text-2xl font-semibold">Xác nhận email</h1>
        <p className="mt-2 text-sm text-white/60">
          Chúng tôi đã xử lý xác nhận trực tiếp qua liên kết trong email.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-white/70">Email nhận xác thực</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              type="email"
            />
          </label>

          {notice && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {notice}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition hover:-translate-y-[1px] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Gửi lại email xác thực"}
          </button>

          <button
            type="button"
            onClick={() => navigate(redirectPath)}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:border-white/35 hover:bg-white/10"
          >
            Đi tới trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
