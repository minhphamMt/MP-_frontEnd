import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiRefreshCw, FiSlash } from "react-icons/fi";
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

export default function AdminArtistRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
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
        <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50 lg:grid-cols-[1.2fr_1fr_0.6fr_0.8fr]">
          <span>Hồ sơ</span>
          <span className="hidden lg:block">Email</span>
          <span className="hidden lg:block">Trạng thái</span>
          <span className="text-right">Hành động</span>
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
            visibleRequests.map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 text-sm text-white/80 lg:grid-cols-[1.2fr_1fr_0.6fr_0.8fr]"
              >
                <div>
                  <p className="font-semibold text-white">
                    {request.artist_name}
                  </p>
                  <p className="text-xs text-white/50">
                    {request.display_name || "Chưa cập nhật"}
                  </p>
                </div>
                <p className="hidden text-xs text-white/60 lg:block">
                  {request.email}
                </p>
                <p
                  className={`hidden text-xs font-semibold capitalize lg:block ${statusBadge(
                    request.status
                  )}`}
                >
                  {request.status}
                </p>
                <div className="flex justify-end gap-2">
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
                        ? "Đã duyệt"
                        : "Đã xử lý"}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

