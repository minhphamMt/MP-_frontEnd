import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiClock, FiFileText } from "react-icons/fi";
import AuthShell from "../components/auth/AuthShell";
import {
  AuthCard,
  AuthField,
  AuthMessage,
  AuthPill,
} from "../components/auth/AuthPrimitives";
import usePageMetadata from "../hooks/usePageMetadata";
import {
  createArtistRequest,
  getMyArtistRequest,
  updateMyArtistRequest,
} from "../api/artist-request.api";
import useAuthStore from "../store/auth.store";

const statusMeta = {
  pending: {
    label: "Đang chờ duyệt",
    tone: "warning",
    icon: FiClock,
    description: "Hồ sơ đã được gửi. Vui lòng chờ đội ngũ quản trị kiểm tra.",
  },
  rejected: {
    label: "Cần cập nhật",
    tone: "error",
    icon: FiFileText,
    description: "Bạn có thể chỉnh lại thông tin và gửi lại hồ sơ.",
  },
  approved: {
    label: "Đã duyệt",
    tone: "success",
    icon: FiCheckCircle,
    description: "Hồ sơ đã đạt yêu cầu. Đăng nhập lại để vào workspace nghệ sĩ.",
  },
};

export default function ArtistRequest() {
  const navigate = useNavigate();
  const { role, authContext, setAuthContext, logout } = useAuthStore();
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

  usePageMetadata({
    title: "Đăng ký làm nghệ sĩ",
    description:
      "Hoàn thiện hồ sơ đăng ký nghệ sĩ trên Khoaluan Music để mở quyền truy cập workspace phát hành.",
    url: "/artist-request",
    robots: "noindex, nofollow",
  });

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const res = await getMyArtistRequest();
        const payload = res?.data?.data ?? res?.data ?? null;
        const normalized = payload && (payload.id || payload.artist_name) ? payload : null;
        setRequest(normalized);
        if (normalized) {
          setForm({
            artist_name: normalized.artist_name || "",
            bio: normalized.bio || "",
            avatar_url: normalized.avatar_url || "",
            proof_link: normalized.proof_link || "",
          });
        }
      } catch (error) {
        console.error("Load artist request failed", error);
        setErrorMessage("Không thể tải hồ sơ đăng ký nghệ sĩ.");
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
      const isResubmitting = request?.status === "rejected";
      const res = isResubmitting ? await updateMyArtistRequest(form) : await createArtistRequest(form);
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
  const canSubmitRequest = !request || status === "rejected";
  const currentStatusMeta = statusMeta[status] || null;
  const StatusIcon = currentStatusMeta?.icon || FiFileText;

  const handleLogout = () => {
    logout();
    setAuthContext("default");
    navigate("/artist-auth", { replace: true });
  };

  const topActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => navigate("/artist-auth")}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/72 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        <FiArrowLeft size={14} />
        Artist Login
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#06101a] transition hover:brightness-105"
        style={{ backgroundColor: "rgb(var(--auth-accent-rgb))" }}
      >
        Đăng xuất
      </button>
    </div>
  );

  const renderStatusSummary = () => (
    <div className="space-y-4">
      {currentStatusMeta ? <AuthMessage tone={currentStatusMeta.tone}>{currentStatusMeta.description}</AuthMessage> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="auth-soft-card rounded-[18px] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/42">Tên nghệ sĩ</p>
          <p className="mt-2 text-sm text-white/88">{request?.artist_name || "--"}</p>
        </div>
        <div className="auth-soft-card rounded-[18px] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/42">Email</p>
          <p className="mt-2 text-sm text-white/88 break-all">{request?.email || "--"}</p>
        </div>
        <div className="auth-soft-card rounded-[18px] px-4 py-3 sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/42">Link xác minh</p>
          <p className="mt-2 text-sm text-white/88 break-all">{request?.proof_link || "--"}</p>
        </div>
      </div>

      {request?.reject_reason ? (
        <AuthMessage tone="error">Lý do từ chối: {request.reject_reason}</AuthMessage>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {status === "approved" ? (
          <button type="button" onClick={() => navigate("/artist-auth")} className="auth-ui-primary">
            Về đăng nhập nghệ sĩ
          </button>
        ) : (
          <button type="button" disabled className="auth-ui-secondary">
            Hồ sơ đang được xử lý
          </button>
        )}
        <button type="button" onClick={handleLogout} className="auth-ui-secondary">
          Đăng xuất
        </button>
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "rejected" ? (
        <AuthMessage tone="error">
          {request?.reject_reason
            ? `Hồ sơ trước đó bị từ chối: ${request.reject_reason}`
            : "Hồ sơ trước đó bị từ chối. Bạn có thể chỉnh sửa và gửi lại."}
        </AuthMessage>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <AuthField
          label="Tên nghệ sĩ *"
          value={form.artist_name}
          onChange={handleChange("artist_name")}
          placeholder="Tên nghệ sĩ"
          required
        />
        <AuthField
          label="Ảnh đại diện"
          value={form.avatar_url}
          onChange={handleChange("avatar_url")}
          placeholder="https://"
        />
      </div>

      <AuthField
        label="Liên kết xác minh"
        value={form.proof_link}
        onChange={handleChange("proof_link")}
        placeholder="Link MXH, fanpage, portfolio..."
        helper="Chọn một link công khai để đội ngũ dễ xác minh hơn."
      />

      <AuthField
        as="textarea"
        label="Bio"
        value={form.bio}
        onChange={handleChange("bio")}
        placeholder="Giới thiệu ngắn về nghệ sĩ"
        rows={3}
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button disabled={submitting} type="submit" className="auth-ui-primary">
          {submitting
            ? "Đang gửi yêu cầu..."
            : status === "rejected"
              ? "Gửi lại yêu cầu"
              : "Gửi yêu cầu"}
        </button>
        <button type="button" onClick={handleLogout} className="auth-ui-secondary">
          Đăng xuất
        </button>
      </div>
    </form>
  );

  return (
    <AuthShell theme="artist" showHeader={false} watermarkSide="left" contentClassName="max-w-[760px]">
      <div className="mx-auto w-full max-w-[760px]">
        <AuthCard variant="main" className="p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-sky-300 shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
                  <StatusIcon size={18} />
                </div>
                <div>
                  <h1 className="text-[1.55rem] font-semibold tracking-[-0.04em] text-white">
                    Đăng ký làm nghệ sĩ
                  </h1>
                  <p className="mt-1 text-[13px] text-white/48">
                    Gọn, rõ và vừa màn hình laptop.
                  </p>
                </div>
              </div>
              {topActions}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AuthPill muted={!currentStatusMeta}>
                {currentStatusMeta?.label || "Chưa gửi hồ sơ"}
              </AuthPill>
              <span className="text-[12px] text-white/44">
                {canSubmitRequest
                  ? "Điền đủ thông tin rồi gửi một lần."
                  : "Theo dõi trạng thái hồ sơ tại đây."}
              </span>
            </div>

            {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}

            {loading ? (
              <div className="auth-soft-card rounded-[18px] p-4 text-sm text-white/68">
                Đang tải hồ sơ đăng ký nghệ sĩ...
              </div>
            ) : canSubmitRequest ? (
              renderForm()
            ) : (
              renderStatusSummary()
            )}
          </div>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
