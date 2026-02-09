import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { createArtistRequest, getMyArtistRequest } from "../api/artist-request.api";
import useAuthStore from "../store/auth.store";

const statusStyles = {
  pending: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
};

export default function ArtistRequest() {
  const navigate = useNavigate();
  const { role, authContext, setAuthContext } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    artist_name: "",
    bio: "",
    avatar_url: "",
    proof_link: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isAllowed = useMemo(
    () => authContext === "artist_request" || role === "ARTIST",
    [authContext, role]
  );

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const res = await getMyArtistRequest();
        const payload = res?.data?.data ?? res?.data ?? null;
        setRequest(payload);
      } catch (error) {
        console.error("Load artist request failed", error);
        setErrorMessage("Không thể tải yêu cầu nghệ sĩ.");
      } finally {
        setLoading(false);
      }
    };

    if (isAllowed) {
      loadRequest();
    } else {
      setLoading(false);
    }
  }, [isAllowed]);

  useEffect(() => {
    if (role === "ARTIST") {
      setAuthContext("default");
      navigate("/artist/dashboard", { replace: true });
    }
  }, [role, navigate, setAuthContext]);

  if (!isAllowed) {
    return <Navigate to="/403" replace />;
  }

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      setSubmitting(true);
      const res = await createArtistRequest(form);
      const payload = res?.data?.data ?? res?.data ?? null;
      setRequest(payload);
    } catch (error) {
      console.error("Create artist request failed", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi yêu cầu. Vui lòng thử lại.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const status = request?.status;

  return (
    <div className="min-h-screen bg-[#0b0b12] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Artist Request
          </p>
          <h1 className="text-3xl font-semibold">
            Gửi yêu cầu trở thành nghệ sĩ
          </h1>
          <p className="text-sm text-white/70">
            Vui lòng cung cấp đầy đủ thông tin để đội ngũ MP xác thực hồ sơ của
            bạn.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-white/70">
            Đang tải thông tin yêu cầu...
          </div>
        ) : request ? (
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div>
              <h2 className="text-xl font-semibold">
                Trạng thái yêu cầu:{" "}
                <span className="capitalize">{status || "pending"}</span>
              </h2>
              <p className="mt-2 text-sm text-white/70">
                {status === "pending" &&
                  "Yêu cầu của bạn đang chờ admin xét duyệt. Vui lòng chờ trong 24-48h."}
                {status === "rejected" &&
                  "Yêu cầu đã bị từ chối. Bạn có thể liên hệ hỗ trợ để biết thêm chi tiết."}
                {status === "approved" &&
                  "Yêu cầu đã được duyệt. Đăng nhập lại để vào khu vực nghệ sĩ."}
              </p>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                statusStyles[status] || "border-white/10 bg-white/5 text-white/70"
              }`}
            >
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="text-white/60">Tên nghệ sĩ:</span>{" "}
                  {request.artist_name || "--"}
                </div>
                <div>
                  <span className="text-white/60">Email:</span>{" "}
                  {request.email || "--"}
                </div>
                {request.reject_reason && (
                  <div>
                    <span className="text-white/60">Lý do từ chối:</span>{" "}
                    {request.reject_reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Tên nghệ sĩ *</span>
                <input
                  value={form.artist_name}
                  onChange={handleChange("artist_name")}
                  placeholder="Tên nghệ sĩ"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  required
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-white/70">Link ảnh đại diện</span>
                <input
                  value={form.avatar_url}
                  onChange={handleChange("avatar_url")}
                  placeholder="https://"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Bio</span>
              <textarea
                value={form.bio}
                onChange={handleChange("bio")}
                placeholder="Giới thiệu ngắn về nghệ sĩ"
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-white/70">Liên kết xác thực</span>
              <input
                value={form.proof_link}
                onChange={handleChange("proof_link")}
                placeholder="Link MXH, portfolio, fanpage..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </label>

            <button
              disabled={submitting}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 py-3 text-sm font-semibold text-[#0c0914] shadow-lg shadow-emerald-500/25 transition hover:-translate-y-[1px] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

