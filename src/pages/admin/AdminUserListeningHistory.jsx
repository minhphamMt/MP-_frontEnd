import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiClock, FiHeadphones, FiRefreshCw } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminUserDetail } from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import OptimizedImage from "../../components/common/OptimizedImage";
import { resolveAssetUrl } from "../../utils/asset";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../../utils/adminListRequest";
import {
  USER_ACTIVITY_PAGE_LIMIT,
  formatDateTime,
  formatDuration,
  getMetaPage,
  hasNextPage,
  hasPreviousPage,
  normalizeListeningItem,
  resolveTotal,
} from "./adminUserActivity.shared";

function PaginationBar({ meta, items, loading, onPrevious, onNext }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/6 px-5 py-4">
      <p className="text-xs text-white/45">
        Trang {getMetaPage(meta)}
        {resolveTotal(meta, items) ? ` • ${resolveTotal(meta, items)} mục` : ""}
      </p>
      <div className="admin-toolbar-actions">
        <button
          onClick={onPrevious}
          disabled={loading || !hasPreviousPage(meta)}
          className="admin-button admin-button-ghost"
        >
          Trước
        </button>
        <button
          onClick={onNext}
          disabled={loading || !hasNextPage(meta, items)}
          className="admin-button admin-button-ghost"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default function AdminUserListeningHistory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState({ items: [], meta: null });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDetail = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setErrorMessage("Không tìm thấy người dùng.");
        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const detail = await withAdminListTimeout(() =>
          getAdminUserDetail(id, {
            listening_page: page,
            listening_limit: USER_ACTIVITY_PAGE_LIMIT,
            search_page: 1,
            search_limit: 1,
          })
        );

        if (!detail.profile) {
          setUser(null);
          setHistory({ items: [], meta: null });
          setErrorMessage("Không tìm thấy người dùng.");
          return;
        }

        setUser(detail.profile);
        setHistory(detail.listeningHistory);
        setErrorMessage("");
      } catch (error) {
        if (isAdminListTimeoutError(error)) {
          console.warn("Load user listening history timed out");
        } else {
          console.error("Load user listening history failed", error);
        }
        setUser(null);
        setHistory({ items: [], meta: null });
        setErrorMessage(getAdminListFallbackMessage("lịch sử nghe"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, page]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const items = useMemo(() => history.items.map(normalizeListeningItem), [history.items]);
  const latestItem = items[0];

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(`/admin/users/${id}`)}
          className="admin-button admin-button-ghost"
        >
          <FiChevronLeft /> Quay lại chi tiết người dùng
        </button>
        <button
          onClick={() => loadDetail({ silent: true })}
          disabled={loading || refreshing}
          className="admin-button"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      <div className="space-y-3">
        <p className="admin-list-kicker">Người dùng</p>
        <h1 className="admin-list-title">
          Lịch sử nghe của {user?.display_name || user?.name || "người dùng"}
        </h1>
      </div>

      {!loading && !errorMessage && (
        <div className="admin-stat-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Tổng lượt nghe</p>
            <p className="admin-stat-value">{resolveTotal(history.meta, items)}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Trang hiện tại</p>
            <p className="admin-stat-value">{getMetaPage(history.meta)}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Lần nghe gần nhất</p>
            <p className="admin-stat-value text-base sm:text-xl">
              {latestItem ? formatDateTime(latestItem.listenedAt) : "Chưa có"}
            </p>
          </div>
        </div>
      )}

      {loading && <AdminListLoadingState variant="listening-history" />}

      {!loading && <AdminListNotice message={errorMessage} />}

      {!loading && !errorMessage && (
        <div className="admin-data-panel">
          <div className="admin-data-head flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="admin-section-label">Hoạt động phát nhạc</p>
              <p className="mt-2 text-sm text-white/55">
                Bao gồm tên bài hát, nghệ sĩ, album và thời điểm phát gần nhất.
              </p>
            </div>
            <span className="admin-chip admin-chip-success">
              {resolveTotal(history.meta, items)} mục
            </span>
          </div>

          {!items.length ? (
            <div className="admin-empty-state">Người dùng này chưa có lịch sử nghe.</div>
          ) : (
            <>
              <div className="divide-y divide-white/6">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.listenedAt || item.title}`}
                    className="admin-row-card grid gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(180px,0.8fr)_minmax(220px,1fr)_110px_170px] xl:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="admin-detail-list-thumb">
                        {item.cover ? (
                          <OptimizedImage
                            src={resolveAssetUrl(item.cover)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/40">
                            <FiHeadphones />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-white/45">Bài hát</p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Nghệ sĩ
                      </p>
                      <p className="mt-2 truncate text-sm font-medium text-white/82">
                        {item.artist}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Album
                      </p>
                      <p className="mt-2 truncate text-sm font-medium text-white/82">
                        {item.album}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Thời lượng
                      </p>
                      <p className="mt-2 text-sm font-medium text-white/82">
                        {formatDuration(item.duration) || "-"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/50 xl:justify-end">
                      <FiClock className="shrink-0" />
                      <span>{formatDateTime(item.listenedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <PaginationBar
                meta={history.meta}
                items={items}
                loading={loading || refreshing}
                onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
                onNext={() => setPage((prev) => prev + 1)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
