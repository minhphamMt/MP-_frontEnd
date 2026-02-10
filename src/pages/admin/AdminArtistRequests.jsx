import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiRefreshCw,
  FiSlash,
} from "react-icons/fi";
import {
  approveArtistRequest,
  listArtistRequests,
  rejectArtistRequest,
} from "../../api/admin.api";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const statusBadge = (status) => {
  switch (status) {
    case "approved":
      return "text-emerald-300";
    case "pending":
      return "text-amber-300";
    case "rejected":
      return "text-rose-300";
    default:
      return "text-white/60";
  }
};

const formatStatusText = (status) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return status || "Không xác định";
  }
};

const DetailItem = ({ label, children }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</p>
    <div className="mt-1 break-all text-sm text-white/85">{children || "Chưa cập nhật"}</div>
  </div>
);

export default function AdminArtistRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = keyword.trim();
      const res = await listArtistRequests({
        page: 1,
        limit: 50,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(trimmedKeyword ? { keyword: trimmedKeyword, q: trimmedKeyword } : {}),
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.requests || [];
      setRequests(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Load artist requests failed", error);
      setErrorMessage("Không thể tải danh sách yêu cầu nghệ sĩ.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, keyword]);

  const handleApprove = async (request) => {
    try {
      await approveArtistRequest(request.id);
      await loadRequests();
    } catch (error) {
      console.error("Approve artist request failed", error);
      alert("Không thể duyệt yêu cầu.");
    }
  };

  const handleReject = async (request) => {
    const reason = window.prompt("Nhập lý do từ chối yêu cầu:");
    if (!reason) return;
    try {
      await rejectArtistRequest(request.id, { reject_reason: reason });
      await loadRequests();
    } catch (error) {
      console.error("Reject artist request failed", error);
      alert("Không thể từ chối yêu cầu.");
    }
  };

  const visibleRequests = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return requests;
    return requests.filter((request) =>
      [
        request.artist_name,
        request.email,
        request.display_name,
        `${request.id}`,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [keyword, requests]);

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Duyệt yêu cầu nghệ sĩ
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo nghệ sĩ, email..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition placeholder:text-white/40 focus:border-white/30 focus:outline-none sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-black"
              >
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadRequests}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          Danh sách yêu cầu
        </div>

        <div className="divide-y divide-white/5">
          {loading && (
            <div className="px-4 py-6 text-sm text-white/60">
              Đang tải dữ liệu...
            </div>
          )}
          {!loading && visibleRequests.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">
              Không có yêu cầu phù hợp.
            </div>
          )}

          {!loading &&
            visibleRequests.map((request) => {
              const isExpanded = expandedRequestId === request.id;

              return (
                <div key={request.id} className="px-3 py-3 sm:px-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpandedRequestId((current) =>
                        current === request.id ? null : request.id
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedRequestId((current) =>
                          current === request.id ? null : request.id
                        );
                      }
                    }}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 transition hover:border-white/25 sm:px-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-white/70">
                          Yêu cầu #{request.id}
                        </p>
                        <span
                          className={`rounded-full border border-white/10 px-2 py-1 text-[11px] font-semibold ${statusBadge(
                            request.status
                          )}`}
                        >
                          {formatStatusText(request.status)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white/70"
                      >
                        {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>

                    <div
                      className="flex flex-wrap gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {request.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                          >
                            <FiCheckCircle /> Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                          >
                            <FiSlash /> Từ chối
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-white/50">
                          {request.status === "approved"
                            ? "Yêu cầu đã được duyệt"
                            : "Yêu cầu đã được xử lý"}
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailItem label="Tên nghệ sĩ">
                          {request.artist_name}
                        </DetailItem>
                        <DetailItem label="Tên hiển thị">
                          {request.display_name}
                        </DetailItem>
                        <DetailItem label="Email">{request.email}</DetailItem>
                        <DetailItem label="Tiểu sử">{request.bio}</DetailItem>
                        <DetailItem label="Ngày gửi">{request.created_at}</DetailItem>
                        <DetailItem label="Mã người dùng">
                          {request.user_id}
                        </DetailItem>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:col-span-2 lg:col-span-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                            Link chứng minh / link cá nhân
                          </p>
                          {request.proof_link ? (
                            <a
                              href={request.proof_link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="mt-1 inline-flex items-center gap-1 break-all text-sm text-cyan-300 hover:text-cyan-200"
                            >
                              {request.proof_link} <FiExternalLink className="shrink-0" />
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-white/85">Chưa cập nhật</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
