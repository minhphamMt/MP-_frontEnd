import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthFloatingAlert } from "../components/auth/AuthPrimitives";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailRegistration, resendVerification, loading } = useAuthStore();

  const intent = searchParams.get("intent") || "user";
  const redirectPath = useMemo(
    () => (intent === "artist" ? "/artist-request" : "/"),
    [intent]
  );

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Nhập mã xác thực 6 số được gửi qua email để hoàn tất đăng ký."
  );

  usePageMetadata({
    title: "Xác nhận email",
    description:
      "Xác nhận email để hoàn tất đăng ký tài khoản trên Khoaluan Music.",
    url:
      intent === "artist"
        ? `/verify-email?intent=artist${email ? `&email=${encodeURIComponent(email)}` : ""}`
        : `/verify-email${email ? `?email=${encodeURIComponent(email)}` : ""}`,
    robots: "noindex, nofollow",
  });

  const handleVerify = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email đăng ký.");
      return;
    }

    const code = verificationCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Mã xác thực phải gồm đúng 6 chữ số.");
      return;
    }

    setError("");

    try {
      await verifyEmailRegistration({
        email: email.trim(),
        verification_code: code,
        authContext: intent === "artist" ? "artist_request" : "default",
      });

      setNotice("Xác nhận email thành công. Đang chuyển trang...");
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xác nhận mã, vui lòng thử lại.";
      setError(msg);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email để gửi lại mã.");
      return;
    }

    setError("");
    try {
      const message = await resendVerification({ email: email.trim() });
      setNotice(message || "Đã gửi lại mã xác thực qua email.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi lại mã xác thực, vui lòng thử lại.";
      setError(msg);
    }
  };

  return (
    <>
      <AuthFloatingAlert message={error} />

      <div className="flex min-h-dvh items-center justify-center bg-[#0b0b12] px-4 py-8 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:p-8">
        <h1 className="text-2xl font-semibold">Xác nhận email</h1>
        <p className="mt-2 text-sm text-white/60">
          Hoàn tất xác thực ngay trên tab hiện tại. Không cần mở thêm tab mới.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-white/70">Email đăng ký</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              type="email"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-white/70">Mã xác thực 6 số</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-white tracking-[0.35em] placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              value={verificationCode}
              onChange={(event) =>
                setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              inputMode="numeric"
            />
          </label>

          {notice && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {notice}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleVerify}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition md:hover:-translate-y-[1px] md:hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang xác thực..." : "Xác thực mã"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleResend}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition md:hover:border-white/35 md:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Gửi lại mã
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
