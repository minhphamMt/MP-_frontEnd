import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiClock, FiRefreshCw, FiSearch } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminUserDetail } from "../../api/admin.api";
import AdminListLoadingState from "../../components/admin/AdminListLoadingState";
import AdminListNotice from "../../components/admin/AdminListNotice";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../../utils/adminListRequest";
import {
  USER_ACTIVITY_PAGE_LIMIT,
  formatDateTime,
  getMetaPage,
  hasNextPage,
  hasPreviousPage,
  normalizeSearchItem,
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

export default function AdminUserSearchHistory() {
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
            listening_page: 1,
            listening_limit: 1,
            search_page: page,
            search_limit: USER_ACTIVITY_PAGE_LIMIT,
          })
        );

        if (!detail.profile) {
          setUser(null);
          setHistory({ items: [], meta: null });
          setErrorMessage("Không tìm thấy người dùng.");
          return;
        }

        setUser(detail.profile);
        setHistory(detail.searchHistory);
        setErrorMessage("");
      } catch (error) {
        if (isAdminListTimeoutError(error)) {
          console.warn("Load user search history timed out");
        } else {
          console.error("Load user search history failed", error);
        }
        setUser(null);
        setHistory({ items: [], meta: null });
        setErrorMessage(getAdminListFallbackMessage("lịch sử tìm kiếm"));
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

  const items = useMemo(() => history.items.map(normalizeSearchItem), [history.items]);
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
          Lịch sử tìm kiếm của {user?.display_name || user?.name || "người dùng"}
        </h1>
        <p className="admin-list-summary">
          Danh sách đầy đủ các từ khóa đã tra cứu, hiển thị theo kiểu list đồng bộ với các
          trang quản trị mới.
        </p>
      </div>

      {!loading && !errorMessage && (
        <div className="admin-stat-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Tổng lượt tìm kiếm</p>
            <p className="admin-stat-value">{resolveTotal(history.meta, items)}</p>
            <p className="admin-stat-note">Tổng số mục đã tải từ hệ thống</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Trang hiện tại</p>
            <p className="admin-stat-value">{getMetaPage(history.meta)}</p>
            <p className="admin-stat-note">Mỗi trang hiển thị {USER_ACTIVITY_PAGE_LIMIT} mục</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Tìm kiếm gần nhất</p>
            <p className="admin-stat-value text-base sm:text-xl">
              {latestItem ? formatDateTime(latestItem.searchedAt) : "Chưa có"}
            </p>
            <p className="admin-stat-note">Mốc tìm kiếm gần đây nhất của người dùng</p>
          </div>
        </div>
      )}

      {loading && <AdminListLoadingState variant="search-history" />}

      {!loading && <AdminListNotice message={errorMessage} />}

      {!loading && !errorMessage && (
        <div className="admin-data-panel">
          <div className="admin-data-head flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="admin-section-label">Từ khóa đã tra cứu</p>
              <p className="mt-2 text-sm text-white/55">
                Theo dõi các keyword đã tìm cùng thời điểm phát sinh trong lịch sử người dùng.
              </p>
            </div>
            <span className="admin-chip admin-chip-warning">
              {resolveTotal(history.meta, items)} mục
            </span>
          </div>

          {!items.length ? (
            <div className="admin-empty-state">Người dùng này chưa có lịch sử tìm kiếm.</div>
          ) : (
            <>
              <div className="divide-y divide-white/6">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.keyword || item.searchedAt}`}
                    className="admin-row-card flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/45">
                        <FiSearch />
                        <span>{item.resultType || "keyword"}</span>
                      </div>
                      <p className="mt-3 break-words text-base font-semibold text-white">
                        {item.keyword || "Không có từ khóa"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <FiClock className="shrink-0" />
                      <span>{formatDateTime(item.searchedAt)}</span>
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
