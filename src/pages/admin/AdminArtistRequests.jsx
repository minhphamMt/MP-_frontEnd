import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiExternalLink,
  FiRefreshCw,
  FiSave,
  FiSlash,
  FiX,
} from "react-icons/fi";
import {
  listArtistRequests,
  listUsers,
  updateArtistRequest,
} from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import { extractApiErrorMessage, extractApiFieldError } from "../../utils/apiError";
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

const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== "all");

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

const buildRequestForm = (request, statusOverride = null) => ({
  id: request?.id,
  artist_name: request?.artist_name || "",
  bio: request?.bio || "",
  avatar_url: request?.avatar_url || "",
  proof_link: request?.proof_link || "",
  status: statusOverride || request?.status || "pending",
  reject_reason: statusOverride === "approved" ? "" : request?.reject_reason || "",
});

const buildRequestPayload = (form) => ({
  artist_name: form.artist_name.trim(),
  bio: form.bio.trim(),
  avatar_url: form.avatar_url.trim(),
  proof_link: form.proof_link.trim(),
  status: form.status,
  reject_reason: form.status === "rejected" ? form.reject_reason.trim() : "",
});

const isRejectReasonRequiredError = (message) =>
  typeof message === "string" &&
  message.toLowerCase().includes("reject_reason") &&
  message.toLowerCase().includes("required");

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
  const [editor, setEditor] = useState(null);
  const [editorErrors, setEditorErrors] = useState({});
  const [savingRequestId, setSavingRequestId] = useState(null);

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

  const handleRefresh = async () => {
    await Promise.all([loadRequests(), loadUsers()]);
  };

  const openEditor = (request, statusOverride = null) => {
    setExpandedRequestId(request.id);
    setEditor(buildRequestForm(request, statusOverride));
    setEditorErrors({});
  };

  const closeEditor = () => {
    setEditor(null);
    setEditorErrors({});
  };

  const handleEditorChange = (field) => (event) => {
    const { value } = event.target;
    setEditor((current) =>
      current ? { ...current, [field]: value } : current
    );
    setEditorErrors((current) => ({ ...current, [field]: "", form: "" }));
  };

  const handleQuickStatusChange = async (request, status) => {
    if (status === "rejected") {
      openEditor(request, "rejected");
      return;
    }

    try {
      setSavingRequestId(request.id);
      setErrorMessage("");
      await updateArtistRequest(request.id, {
        status,
        ...(status === "approved" ? { reject_reason: "" } : {}),
      });
      if (editor?.id === request.id) {
        closeEditor();
      }
      await handleRefresh();
    } catch (error) {
      console.error("Update artist request status failed", error);
      setErrorMessage(
        extractApiErrorMessage(error, "Không thể cập nhật trạng thái yêu cầu.")
      );
    } finally {
      setSavingRequestId(null);
    }
  };

  const handleSaveEditor = async () => {
    if (!editor?.id) return;

    if (editor.status === "rejected" && !editor.reject_reason.trim()) {
      setEditorErrors({
        reject_reason: "Vui lòng nhập lý do từ chối.",
      });
      return;
    }

    try {
      setSavingRequestId(editor.id);
      setEditorErrors({});
      setErrorMessage("");
      await updateArtistRequest(editor.id, buildRequestPayload(editor));
      closeEditor();
      await handleRefresh();
    } catch (error) {
      console.error("Save artist request failed", error);
      const apiMessage = extractApiErrorMessage(
        error,
        "Không thể lưu yêu cầu nghệ sĩ."
      );
      const rawApiMessage =
        error?.response?.data?.error || error?.response?.data?.message || "";
      const rejectReasonError = extractApiFieldError(error, ["reject_reason"]);

      if (
        rejectReasonError ||
        isRejectReasonRequiredError(apiMessage) ||
        isRejectReasonRequiredError(rawApiMessage)
      ) {
        setEditorErrors({
          reject_reason: rejectReasonError || "Vui lòng nhập lý do từ chối.",
        });
        return;
      }

      setEditorErrors({ form: apiMessage });
    } finally {
      setSavingRequestId(null);
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
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Chờ duyệt</p>
          <p className="admin-stat-value">{pendingRequestsCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Đã duyệt</p>
          <p className="admin-stat-value">{approvedRequestsCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Liên kết user</p>
          <p className="admin-stat-value">{linkedRequestsCount}</p>
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
                const isEditing = editor?.id === request.id;
                const isSaving = savingRequestId === request.id;

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
                        if (event.target !== event.currentTarget) return;

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
                        {request.status !== "approved" && (
                          <button
                            onClick={() => handleQuickStatusChange(request, "approved")}
                            disabled={isSaving}
                            className="admin-button admin-button-success"
                          >
                            <FiCheckCircle /> Duyệt
                          </button>
                        )}
                        {request.status !== "rejected" && (
                          <button
                            onClick={() => handleQuickStatusChange(request, "rejected")}
                            disabled={isSaving}
                            className="admin-button admin-button-danger"
                          >
                            <FiSlash /> Từ chối
                          </button>
                        )}
                        <button
                          onClick={() => openEditor(request)}
                          disabled={isSaving}
                          className="admin-button admin-button-ghost"
                        >
                          <FiEdit2 /> Sửa
                        </button>
                      </div>

                      {isExpanded && (
                        <div
                          className="border-t border-white/10 pt-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <input
                                  value={editor.artist_name}
                                  onChange={handleEditorChange("artist_name")}
                                  placeholder="Tên nghệ sĩ"
                                  className="admin-field"
                                />
                                <select
                                  value={editor.status}
                                  onChange={handleEditorChange("status")}
                                  className="admin-select-field"
                                >
                                  {EDITABLE_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  value={editor.avatar_url}
                                  onChange={handleEditorChange("avatar_url")}
                                  placeholder="Avatar URL"
                                  className="admin-field"
                                />
                                <input
                                  value={editor.proof_link}
                                  onChange={handleEditorChange("proof_link")}
                                  placeholder="Link chứng minh"
                                  className="admin-field"
                                />
                                <textarea
                                  value={editor.bio}
                                  onChange={handleEditorChange("bio")}
                                  placeholder="Tiểu sử"
                                  className="admin-field admin-detail-textarea sm:col-span-2"
                                  rows={4}
                                />
                                {editor.status === "rejected" && (
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <textarea
                                      value={editor.reject_reason}
                                      onChange={handleEditorChange("reject_reason")}
                                      placeholder="Lý do từ chối"
                                      className="admin-field admin-detail-textarea"
                                      rows={3}
                                    />
                                    {editorErrors.reject_reason && (
                                      <p className="px-1 text-xs text-rose-300">
                                        {editorErrors.reject_reason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {editorErrors.form && (
                                <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
                                  {editorErrors.form}
                                </div>
                              )}

                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  onClick={closeEditor}
                                  disabled={isSaving}
                                  className="admin-button admin-button-ghost"
                                >
                                  <FiX /> Hủy
                                </button>
                                <button
                                  onClick={handleSaveEditor}
                                  disabled={isSaving}
                                  className="admin-button admin-button-primary"
                                >
                                  <FiSave /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                              <DetailItem label="Avatar URL">
                                {request.avatar_url}
                              </DetailItem>
                              <DetailItem label="Lý do từ chối">
                                {request.reject_reason}
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
