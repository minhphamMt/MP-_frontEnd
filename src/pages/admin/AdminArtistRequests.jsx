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
  listUsers,
  rejectArtistRequest,
} from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import { promptAdminInput } from "../../utils/adminDialog";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../../utils/adminListRequest";

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

const getRequestIdentity = (request) => ({
  userId:
    request?.user_id === null || request?.user_id === undefined
      ? ""
      : `${request.user_id}`.trim(),
  email: typeof request?.email === "string" ? request.email.trim() : "",
});

const DetailItem = ({ label, children }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</p>
    <div className="mt-1 break-all text-sm text-white/85">{children || "Chưa cập nhật"}</div>
  </div>
);

export default function AdminArtistRequests() {
  const [requests, setRequests] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountErrorMessage, setAccountErrorMessage] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = keyword.trim();
      const res = await withAdminListTimeout(() =>
        listArtistRequests({
          page: 1,
          limit: 50,
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(trimmedKeyword
            ? { keyword: trimmedKeyword, q: trimmedKeyword }
            : {}),
        })
      );
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.requests || [];
      setRequests(list);
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load artist requests timed out");
      } else {
        console.error("Load artist requests failed", error);
      }
      setErrorMessage(
        getAdminListFallbackMessage("yêu cầu nghệ sĩ", keyword.trim())
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setAccountsLoading(true);
      const res = await withAdminListTimeout(() =>
        listUsers({ page: 1, limit: 500 })
      );
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.users || [];
      setUserAccounts(list);
      setAccountErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load user accounts timed out");
      } else {
        console.error("Load user accounts failed", error);
      }
      setUserAccounts([]);
      setAccountErrorMessage(
        "Chưa đối chiếu được tài khoản người dùng. Bạn vẫn có thể xem trạng thái trống."
      );
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, keyword]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (request) => {
    try {
      await approveArtistRequest(request.id);
      await loadRequests();
    } catch (error) {
      console.error("Approve artist request failed", error);
      setErrorMessage("Không thể duyệt yêu cầu.");
    }
  };

  const handleReject = async (request) => {
    const reason = await promptAdminInput({
      title: "Từ chối yêu cầu nghệ sĩ",
      message: "Nhập lý do từ chối yêu cầu",
      placeholder: "Nhập lý do...",
      confirmText: "Từ chối",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!reason?.trim()) return;
    try {
      await rejectArtistRequest(request.id, { reject_reason: reason.trim() });
      await loadRequests();
    } catch (error) {
      console.error("Reject artist request failed", error);
      setErrorMessage("Không thể từ chối yêu cầu.");
    }
  };

  const activeUserIds = useMemo(
    () =>
      new Set(
        userAccounts
          .map((user) =>
            user?.id === null || user?.id === undefined ? "" : `${user.id}`.trim()
          )
          .filter(Boolean)
      ),
    [userAccounts]
  );

  const visibleRequests = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return requests
      .filter((request) => {
        const { userId, email } = getRequestIdentity(request);
        return Boolean(userId && email && activeUserIds.has(userId));
      })
      .filter((request) => {
        if (!normalized) return true;
        return [
          request.artist_name,
          request.email,
          request.display_name,
          `${request.id}`,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized));
      });
  }, [activeUserIds, keyword, requests]);

  const isPageLoading = loading || accountsLoading;
  const pendingRequestsCount = visibleRequests.filter((request) => request?.status === "pending").length;
  const approvedRequestsCount = visibleRequests.filter((request) => request?.status === "approved").length;
  const linkedRequestsCount = visibleRequests.filter((request) => activeUserIds.has(`${request?.user_id}`.trim())).length;

  const handleRefresh = async () => {
    await Promise.all([loadRequests(), loadUsers()]);
  };

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="admin-list-header">
        <div>
          <p className="admin-list-kicker">
            Quản trị
          </p>
          <h1 className="admin-list-title">
            Duyệt yêu cầu nghệ sĩ
          </h1>
          <p className="admin-list-summary">
            Gom các yêu cầu vào một review queue dễ đọc hơn, ưu tiên hành động và
            phần thông tin đối chiếu tài khoản.
          </p>
        </div>
        <div className="admin-toolbar-actions">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo nghệ sĩ, email..."
            className="admin-field sm:w-72"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="admin-select-field"
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="admin-button"
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Yêu cầu</p>
          <p className="admin-stat-value">{visibleRequests.length}</p>
          <p className="admin-stat-note">Đang hiển thị trong hàng chờ</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Chờ duyệt</p>
          <p className="admin-stat-value">{pendingRequestsCount}</p>
          <p className="admin-stat-note">Cần xử lý ngay</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Đã duyệt</p>
          <p className="admin-stat-value">{approvedRequestsCount}</p>
          <p className="admin-stat-note">Đã hoàn tất duyệt</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Liên kết user</p>
          <p className="admin-stat-value">{linkedRequestsCount}</p>
          <p className="admin-stat-note">Có tài khoản người dùng hợp lệ</p>
        </div>
      </div>

      <AdminListNotice message={errorMessage} />

      <AdminListNotice message={accountErrorMessage} />

      <div className="admin-data-panel">
        <div className="admin-data-head px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
          Danh sách yêu cầu
        </div>

        {isPageLoading ? (
          <AdminListLoadingState variant="artist-requests" />
        ) : (
          <div className="divide-y divide-white/5">
            {visibleRequests.length === 0 ? (
            <div className="admin-empty-state">
              Không có yêu cầu hợp lệ gắn với tài khoản người dùng hiện còn tồn tại.
            </div>
            ) : (
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
                    className="admin-row-card flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#171819] px-3 py-3 transition md:hover:border-white/18 sm:px-4"
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
                            className="admin-button admin-button-success"
                          >
                            <FiCheckCircle /> Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="admin-button admin-button-danger"
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
                              className="mt-1 inline-flex items-center gap-1 break-all text-sm text-cyan-300 md:hover:text-cyan-200"
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
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

