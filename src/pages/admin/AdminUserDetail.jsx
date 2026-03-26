import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiClock,
  FiEdit2,
  FiHeadphones,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminUserDetail } from "../../api/admin.api";
import OptimizedImage from "../../components/common/OptimizedImage";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay } from "../../utils/date";

const LISTENING_LIMIT = 6;
const SEARCH_LIMIT = 8;
const ACTIVITY_PREVIEW_LIMIT = 3;

const getUserAvatar = (user) =>
  user?.avatar_url ||
  user?.avatar ||
  user?.photo ||
  user?.photo_url ||
  user?.image ||
  user?.image_url ||
  user?.profile_image ||
  user?.profile_photo;

const formatDateTime = (value, fallback = "Chưa cập nhật") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null;
  }

  const duration = Math.max(Number(value), 0);
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const getMetaPage = (meta) =>
  meta?.page ?? meta?.currentPage ?? meta?.pageNumber ?? meta?.current_page ?? 1;

const getMetaTotalPages = (meta) =>
  meta?.totalPages ?? meta?.total_pages ?? meta?.lastPage ?? meta?.last_page ?? null;

const hasPreviousPage = (meta) => getMetaPage(meta) > 1;

const hasNextPage = (meta, items) => {
  if (!meta) return false;

  const page = getMetaPage(meta);
  const totalPages = getMetaTotalPages(meta);
  if (totalPages) return page < totalPages;

  const explicitNext = meta.hasNext ?? meta.has_next ?? meta.has_more;
  if (typeof explicitNext === "boolean") return explicitNext;

  const total = meta.total ?? meta.totalItems ?? meta.count;
  const limit = meta.limit ?? meta.perPage ?? meta.per_page ?? items.length;
  if (total && limit) return page * limit < total;

  return false;
};

const resolveTotal = (meta, items) =>
  meta?.total ?? meta?.totalItems ?? meta?.count ?? items.length;

const getRoleTone = (role) => {
  if (role === "ADMIN") return "admin-chip admin-chip-info";
  if (role === "ARTIST") return "admin-chip admin-chip-warning";
  return "admin-chip";
};

const getStatusTone = (isActive) =>
  isActive ? "admin-chip admin-chip-success" : "admin-chip admin-chip-danger";

const getArtistNames = (song) => {
  if (song?.artist_name) return song.artist_name;
  if (song?.artist?.name) return song.artist.name;
  if (typeof song?.artist === "string") return song.artist;
  if (Array.isArray(song?.artists)) {
    return song.artists
      .map((artist) => artist?.name || artist?.display_name || artist)
      .filter(Boolean)
      .join(", ");
  }
  return "Chưa cập nhật";
};

const normalizeListeningItem = (entry) => {
  const song = entry?.song || entry?.track || entry?.item || entry;
  return {
    id:
      song?.id ??
      song?.song_id ??
      song?.songId ??
      entry?.song_id ??
      entry?.songId ??
      entry?.id,
    title: song?.title || song?.name || "Bài hát",
    artist: getArtistNames(song),
    album: song?.album_title || song?.album?.title || "Chưa cập nhật",
    cover:
      song?.cover_url ||
      song?.cover ||
      song?.thumbnail ||
      song?.image ||
      song?.album?.cover_url,
    listenedAt:
      entry?.listened_at ||
      entry?.created_at ||
      entry?.createdAt ||
      song?.listened_at ||
      song?.listen_time,
    duration: song?.duration,
  };
};

const normalizeSearchItem = (entry) => ({
  id: entry?.id ?? `${entry?.keyword || entry?.query || entry?.searched_at || ""}`,
  keyword: entry?.keyword || entry?.query || entry?.term || entry?.search_term || "",
  searchedAt:
    entry?.searched_at ||
    entry?.created_at ||
    entry?.createdAt ||
    entry?.updated_at,
  resultType:
    entry?.type || entry?.entity_type || entry?.entityType || entry?.target_type,
});

const PaginationBar = ({ meta, items, loading, onPrevious, onNext }) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
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

export default function AdminUserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [listeningHistory, setListeningHistory] = useState({ items: [], meta: null });
  const [searchHistory, setSearchHistory] = useState({ items: [], meta: null });
  const [listeningPage, setListeningPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
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

        const detail = await getAdminUserDetail(id, {
          listening_page: listeningPage,
          listening_limit: LISTENING_LIMIT,
          search_page: searchPage,
          search_limit: SEARCH_LIMIT,
        });

        if (!detail.profile) {
          setUser(null);
          setListeningHistory({ items: [], meta: null });
          setSearchHistory({ items: [], meta: null });
          setErrorMessage("Không tìm thấy người dùng.");
          return;
        }

        setUser(detail.profile);
        setListeningHistory(detail.listeningHistory);
        setSearchHistory(detail.searchHistory);
        setErrorMessage("");
      } catch (error) {
        console.error("Load admin user detail failed", error);
        setUser(null);
        setListeningHistory({ items: [], meta: null });
        setSearchHistory({ items: [], meta: null });
        setErrorMessage("Không thể tải chi tiết người dùng.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, listeningPage, searchPage]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const listeningItems = useMemo(
    () => listeningHistory.items.map(normalizeListeningItem),
    [listeningHistory.items]
  );

  const searchItems = useMemo(
    () => searchHistory.items.map(normalizeSearchItem),
    [searchHistory.items]
  );

  const listeningPreviewItems = useMemo(
    () => listeningItems.slice(0, ACTIVITY_PREVIEW_LIMIT),
    [listeningItems]
  );

  const searchPreviewItems = useMemo(
    () => searchItems.slice(0, ACTIVITY_PREVIEW_LIMIT),
    [searchItems]
  );

  const statCards = useMemo(
    () => [
      {
        label: "Vai trò",
        value: user?.role || "-",
        tone: getRoleTone(user?.role),
      },
      {
        label: "Trạng thái",
        value: user?.is_active ? "Đang hoạt động" : "Bị khóa",
        tone: getStatusTone(user?.is_active),
      },
      {
        label: "Lượt nghe đã tải",
        value: `${resolveTotal(listeningHistory.meta, listeningItems)}`,
        tone: "admin-chip admin-chip-success",
      },
      {
        label: "Tìm kiếm đã tải",
        value: `${resolveTotal(searchHistory.meta, searchItems)}`,
        tone: "admin-chip admin-chip-warning",
      },
    ],
    [listeningHistory.meta, listeningItems, searchHistory.meta, searchItems, user]
  );

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="admin-button admin-button-ghost"
        >
          <FiChevronLeft /> Quay lại danh sách người dùng
        </button>

        <div className="admin-toolbar-actions">
          <button
            onClick={() => loadDetail({ silent: true })}
            disabled={loading || refreshing}
            className="admin-button"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} /> Làm mới
          </button>
          {user?.id && (
            <button
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
              className="admin-button admin-button-primary"
            >
              <FiEdit2 /> Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
      )}

      {!loading && errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {!loading && user && (
        <>
          <div className="admin-detail-shell">
            <div className="admin-detail-header">
              <div className="admin-detail-heading">
                <p className="admin-list-kicker">Hồ sơ người dùng</p>
                <h1 className="admin-list-title">
                  {user.display_name || user.name || "Người dùng"}
                </h1>
                <p className="admin-list-summary">
                  Theo dõi nhanh trạng thái tài khoản, lịch sử nghe và lịch sử tìm kiếm
                  trong một bố cục gọn hơn và dễ quét hơn.
                </p>
              </div>
            </div>

            <div className="admin-detail-grid is-two-column">
              <section className="admin-detail-panel flex h-full flex-col">
                <p className="admin-detail-panel-title">Hồ sơ tài khoản</p>
                <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start">
                  <div className="admin-detail-media is-square is-avatar">
                    {getUserAvatar(user) ? (
                      <OptimizedImage
                        src={resolveAssetUrl(getUserAvatar(user))}
                        alt={user.display_name || user.email || "User avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-white/40">
                        <FiUser />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={getRoleTone(user.role)}>{user.role || "USER"}</span>
                      <span className={getStatusTone(user.is_active)}>
                        {user.is_active ? "Đang hoạt động" : "Bị khóa"}
                      </span>
                    </div>

                    <div className="admin-detail-meta-grid">
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Tên hiển thị</p>
                        <p className="admin-detail-meta-value">
                          {user.display_name || user.name || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Email</p>
                        <p className="admin-detail-meta-value">
                          {user.email || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">User ID</p>
                        <p className="admin-detail-meta-value">{user.id}</p>
                      </div>
                      <div className="admin-detail-meta-card">
                        <p className="admin-detail-meta-label">Auth provider</p>
                        <p className="admin-detail-meta-value">
                          {user.auth_provider || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="admin-detail-panel flex h-full flex-col">
                <p className="admin-detail-panel-title">Tổng quan tài khoản</p>
                <p className="admin-detail-panel-note">
                  Những chỉ số và mốc thời gian quan trọng được gom lại để theo dõi nhanh.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {statCards.map((card) => (
                    <div key={card.label} className="admin-detail-meta-card">
                      <p className="admin-detail-meta-label">{card.label}</p>
                      <div className="mt-3">
                        <span className={card.tone}>{card.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 admin-detail-meta-grid">
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Firebase UID</p>
                    <p className="admin-detail-meta-value">
                      {user.firebase_uid || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Ngày tạo</p>
                    <p className="admin-detail-meta-value">
                      {formatDateTime(user.created_at, formatDateDisplay(user.created_at))}
                    </p>
                  </div>
                  <div className="admin-detail-meta-card">
                    <p className="admin-detail-meta-label">Cập nhật gần nhất</p>
                    <p className="admin-detail-meta-value">
                      {formatDateTime(user.updated_at, formatDateDisplay(user.updated_at))}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-2">
            <section className="admin-detail-panel flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                    <FiHeadphones />
                    <span>Lịch sử nghe</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-white">Hoạt động phát nhạc</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="admin-chip admin-chip-success">
                    {resolveTotal(listeningHistory.meta, listeningItems)} mục
                  </span>
                  <button
                    onClick={() => navigate(`/admin/users/${user.id}/listening-history`)}
                    className="admin-button admin-button-ghost"
                  >
                    Xem tất cả
                  </button>
                </div>
              </div>

              {!listeningPreviewItems.length ? (
                <div className="admin-empty-state mt-5 rounded-2xl border border-dashed border-white/10 bg-[#151617]">
                  Người dùng này chưa có lịch sử nghe.
                </div>
              ) : (
                <div className="mt-5 flex-1 space-y-3">
                  {listeningPreviewItems.map((item) => (
                    <div
                      key={`${item.id}-${item.listenedAt || item.title}`}
                      className="admin-detail-list-card"
                    >
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
                        <p className="truncate font-semibold text-white">{item.title}</p>
                        <p className="truncate text-sm text-white/60">{item.artist}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/45">
                          <span className="admin-chip">Album: {item.album}</span>
                          {formatDuration(item.duration) && (
                            <span className="admin-chip">{formatDuration(item.duration)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/50 sm:text-right">
                        <FiClock className="shrink-0" />
                        <span>{formatDateTime(item.listenedAt)}</span>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </section>

            <section className="admin-detail-panel flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                    <FiSearch />
                    <span>Lịch sử tìm kiếm</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-white">Từ khóa đã tra cứu</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="admin-chip admin-chip-warning">
                    {resolveTotal(searchHistory.meta, searchItems)} mục
                  </span>
                  <button
                    onClick={() => navigate(`/admin/users/${user.id}/search-history`)}
                    className="admin-button admin-button-ghost"
                  >
                    Xem tất cả
                  </button>
                </div>
              </div>

              {!searchPreviewItems.length ? (
                <div className="admin-empty-state mt-5 rounded-2xl border border-dashed border-white/10 bg-[#151617]">
                  Người dùng này chưa có lịch sử tìm kiếm.
                </div>
              ) : (
                <div className="mt-5 flex-1 space-y-3">
                  {searchPreviewItems.map((item) => (
                    <div
                      key={`${item.id}-${item.keyword || item.searchedAt}`}
                      className="rounded-3xl border border-white/10 bg-[#151617] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/45">
                            <FiSearch />
                            <span>{item.resultType || "keyword"}</span>
                          </div>
                          <p className="mt-3 break-words text-base font-semibold text-white">
                            {item.keyword || "Không có từ khóa"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/50 sm:text-right">
                          <FiClock className="shrink-0" />
                          <span>{formatDateTime(item.searchedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </section>
          </div>

          <section className="admin-detail-panel">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="admin-detail-meta-card">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70">
                  <FiMail />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Email xác thực
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {user.email || "Chưa cập nhật"}
                </p>
              </div>

              <div className="admin-detail-meta-card">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70">
                  <FiShield />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Quyền hiện tại
                </p>
                <p className="mt-1 text-sm text-white/80">{user.role || "USER"}</p>
              </div>

              <div className="admin-detail-meta-card">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70">
                  <FiUser />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Tên hiển thị
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {user.display_name || user.name || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
