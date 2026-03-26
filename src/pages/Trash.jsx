import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import useAuthStore from "../store/auth.store";
import {
  getDeletedItems,
  hardDeleteAlbum,
  hardDeleteArtist,
  hardDeleteGenre,
  hardDeleteSong,
  restoreAlbum,
  restoreArtist,
  restoreGenre,
  restoreSong,
} from "../api/trash.api";
import { UserTrashLoading } from "../components/common/UserLoadingState";
import AdminListNotice from "../components/admin/AdminListNotice";
import { confirmAdminAction } from "../utils/adminDialog";
import { getArtistLabel } from "../utils/artist";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../utils/adminListRequest";

function SkeletonBlock({ className = "" }) {
  return <div className={`ui-skeleton ${className}`.trim()} />;
}

function TrashSectionLoading({ gridClass, columnsCount }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <div
          key={`trash-admin-loading-${columnsCount}-${rowIndex}`}
          className={`flex flex-col gap-4 px-4 py-4 text-sm text-white/80 sm:grid sm:items-center ${gridClass}`}
        >
          {Array.from({ length: Math.max(columnsCount - 1, 1) }).map((__, cellIndex) => (
            <div key={`trash-admin-loading-cell-${rowIndex}-${cellIndex}`} className="flex flex-col gap-2">
              <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8 sm:hidden" />
              <SkeletonBlock className="h-4 w-40 max-w-full rounded-full bg-white/8" />
              {cellIndex === 0 ? (
                <SkeletonBlock className="h-3 w-28 rounded-full bg-white/8" />
              ) : (
                <SkeletonBlock className="h-3 w-20 rounded-full bg-white/8" />
              )}
            </div>
          ))}

          <div className="flex flex-col gap-2 sm:items-end">
            <SkeletonBlock className="h-3 w-16 rounded-full bg-white/8 sm:hidden" />
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <SkeletonBlock className="h-8 w-24 rounded-full bg-white/8" />
              <SkeletonBlock className="h-8 w-28 rounded-full bg-white/8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const formatDateTime = (value) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const emptyState = { songs: [], albums: [], artists: [], genres: [] };

export default function Trash() {
  const role = useAuthStore((state) => state.role);
  const isArtistView = role === "ARTIST";
  const [deletedItems, setDeletedItems] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const heroClassName = isArtistView
    ? "artist-page-shell artist-glass"
    : "admin-page-shell admin-glass rounded-3xl border border-white/10";
  const surfaceClassName = isArtistView
    ? "artist-page-shell artist-glass bg-[rgba(12,19,32,0.94)] shadow-[0_25px_80px_rgba(2,6,18,0.42)]"
    : "bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]";
  const headingMetaClassName = isArtistView
    ? "text-[11px] uppercase tracking-[0.35em] text-slate-300/48"
    : "text-[11px] uppercase tracking-[0.35em] text-white/50";
  const sectionMetaClassName = isArtistView
    ? "text-xs text-slate-300/52"
    : "text-xs text-white/50";
  const tableHeaderClassName = isArtistView
    ? "text-[11px] uppercase tracking-[0.3em] text-slate-300/42"
    : "text-[11px] uppercase tracking-[0.3em] text-white/40";
  const mobileLabelClassName = isArtistView
    ? "text-[10px] uppercase tracking-[0.2em] text-slate-300/40 sm:hidden"
    : "text-[10px] uppercase tracking-[0.2em] text-white/40 sm:hidden";
  const rowClassName = isArtistView
    ? "text-sm text-slate-100/82"
    : "text-sm text-white/80";
  const restoreButtonClassName = isArtistView
    ? "inline-flex items-center gap-1 rounded-full border border-sky-300/30 bg-sky-400/12 px-3 py-1 text-xs text-sky-100 transition md:hover:bg-sky-400/20"
    : "inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200 transition md:hover:bg-emerald-400/20";
  const emptyTextClassName = isArtistView
    ? "text-sm text-slate-200/62"
    : "text-sm text-white/60";
  const detailTitleClassName = isArtistView ? "text-slate-50" : "text-white";
  const detailSubtleClassName = isArtistView
    ? "text-xs text-slate-300/56"
    : "text-xs text-white/50";
  const valueSubtleClassName = isArtistView
    ? "text-xs text-slate-300/62"
    : "text-xs text-white/60";

  const sections = useMemo(
    () => [
      {
        key: "songs",
        title: "Bài hát",
        description: "Những bài hát đã bị xóa mềm.",
        columns: ["Bài hát", "Nghệ sĩ", "Ngày xóa", "Hành động"],
        renderCells: (song) => [
          <>
            <p className={detailTitleClassName}>{song.title}</p>
            <p className={detailSubtleClassName}>
              {getArtistLabel(song, song.artist_name || "Chưa có nghệ sĩ")}
            </p>
          </>,
          <span className={valueSubtleClassName}>
            {getArtistLabel(song, song.artist_name || "") || "-"}
          </span>,
          <span className={valueSubtleClassName}>{formatDateTime(song.deleted_at)}</span>,
        ],
      },
      {
        key: "albums",
        title: "Album",
        description: "Danh sách album đang ở thùng rác.",
        columns: ["Album", "Nghệ sĩ", "Ngày xóa", "Hành động"],
        renderCells: (album) => [
          <>
            <p className={detailTitleClassName}>{album.title}</p>
            <p className={detailSubtleClassName}>
              {getArtistLabel(album, album.artist_name || "Chưa có nghệ sĩ")}
            </p>
          </>,
          <span className={valueSubtleClassName}>
            {getArtistLabel(album, album.artist_name || "") || "-"}
          </span>,
          <span className={valueSubtleClassName}>{formatDateTime(album.deleted_at)}</span>,
        ],
      },
      {
        key: "artists",
        title: "Nghệ sĩ",
        description: "Hồ sơ nghệ sĩ đã bị xóa mềm.",
        columns: ["Nghệ sĩ", "Bí danh", "Ngày xóa", "Hành động"],
        renderCells: (artist) => [
          <>
            <p className={detailTitleClassName}>{artist.name}</p>
            <p className={detailSubtleClassName}>{artist.alias || artist.realname || "Chưa cập nhật"}</p>
          </>,
          <span className={valueSubtleClassName}>{artist.alias || artist.realname || "-"}</span>,
          <span className={valueSubtleClassName}>{formatDateTime(artist.deleted_at)}</span>,
        ],
      },
      {
        key: "genres",
        title: "Thể loại",
        description: "Chỉ quản trị viên mới nhìn thấy thể loại đã xóa.",
        columns: ["Thể loại", "Ngày xóa", "Hành động"],
        renderCells: (genre) => [
          <span className={detailTitleClassName}>{genre.name}</span>,
          <span className={valueSubtleClassName}>{formatDateTime(genre.deleted_at)}</span>,
        ],
      },
    ],
    [detailSubtleClassName, detailTitleClassName, valueSubtleClassName]
  );

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      const res = await withAdminListTimeout(() => getDeletedItems());
      const payload = res?.data?.data ?? res?.data ?? emptyState;
      setDeletedItems({
        songs: payload.songs || [],
        albums: payload.albums || [],
        artists: payload.artists || [],
        genres: payload.genres || [],
      });
      setErrorMessage("");
    } catch (error) {
      if (isAdminListTimeoutError(error)) {
        console.warn("Load deleted items timed out");
      } else {
        console.error("Load deleted items failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("thùng rác"));
      setDeletedItems(emptyState);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const restoreHandlers = {
    songs: restoreSong,
    albums: restoreAlbum,
    artists: restoreArtist,
    genres: restoreGenre,
  };

  const hardDeleteHandlers = {
    songs: hardDeleteSong,
    albums: hardDeleteAlbum,
    artists: hardDeleteArtist,
    genres: hardDeleteGenre,
  };

  const handleRestore = async (type, item) => {
    const confirmed = await confirmAdminAction({
      title: "Khôi phục bản ghi",
      message: `Khôi phục ${
        type === "songs"
          ? "bài hát"
          : type === "albums"
            ? "album"
            : type === "artists"
              ? "nghệ sĩ"
              : "thể loại"
      } "${item.name || item.title}"?`,
      confirmText: "Khôi phục",
      cancelText: "Hủy",
    });
    if (!confirmed) return;
    try {
      await restoreHandlers[type](item.id);
      await loadDeletedItems();
    } catch (error) {
      console.error("Restore item failed", error);
      setErrorMessage("Không thể khôi phục bản ghi.");
    }
  };

  const handleHardDelete = async (type, item) => {
    const confirmed = await confirmAdminAction({
      title: "Xóa vĩnh viễn",
      message: `Bạn chắc chắn muốn xóa vĩnh viễn "${
        item.name || item.title
      }"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await hardDeleteHandlers[type](item.id);
      await loadDeletedItems();
    } catch (error) {
      console.error("Hard delete item failed", error);
      setErrorMessage("Không thể xóa vĩnh viễn bản ghi.");
    }
  };

  return (
    <div className="space-y-6">
      <section className={`p-6 sm:p-8 ${heroClassName}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={headingMetaClassName}>
              {role === "ADMIN" ? "Quản trị" : "Nghệ sĩ"}
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">Thùng rác</h1>
            <p className="mt-2 text-sm text-white/65">
              {role === "ADMIN"
                ? "Xem toàn bộ bản ghi đã bị xóa mềm và quản lý khôi phục."
                : "Chỉ hiển thị nội dung bạn đã xóa mềm."}
            </p>
          </div>
          <button
            onClick={loadDeletedItems}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
              isArtistView
                ? "artist-btn-secondary"
                : "border border-white/10 bg-white/5 text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
            }`}
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </section>

      <AdminListNotice message={errorMessage} />

      {sections.map((section) => {
        const items = deletedItems[section.key] || [];
        if (section.key === "genres" && role !== "ADMIN") return null;
        const gridClass =
          section.columns.length === 3
            ? "sm:grid-cols-[1.6fr_0.8fr_0.8fr]"
            : "sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr]";

        return (
          <section
            key={section.key}
            className={`overflow-hidden rounded-3xl border border-white/10 ${surfaceClassName}`}
          >
            <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                <p className={sectionMetaClassName}>{section.description}</p>
              </div>
              <div className={sectionMetaClassName}>{items.length} bản ghi</div>
            </div>

            <div
              className={`hidden grid-cols-1 gap-3 px-4 py-3 sm:grid ${tableHeaderClassName} ${gridClass}`}
            >
              {section.columns.map((column, index) => (
                <span
                  key={column}
                  className={index === section.columns.length - 1 ? "text-right" : ""}
                >
                  {column}
                </span>
              ))}
            </div>

	            <div className="divide-y divide-white/5">
	              {!isArtistView && loading ? (
	                <TrashSectionLoading
	                  gridClass={gridClass}
	                  columnsCount={section.columns.length}
	                />
	              ) : null}
	              {loading && isArtistView &&
	                (isArtistView ? (
	                  <div className="px-4 py-4">
	                    <UserTrashLoading sections={1} rows={3} />
                  </div>
                ) : (
                  <div className={`px-4 py-6 ${emptyTextClassName}`}>Đang tải dữ liệu...</div>
                ))}
              {!loading && items.length === 0 && (
                <div className={`px-4 py-6 ${emptyTextClassName}`}>Chưa có bản ghi nào.</div>
              )}
              {!loading &&
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-4 px-4 py-4 ${rowClassName} sm:grid sm:items-center ${gridClass}`}
                  >
                    {section.renderCells(item).map((cell, index) => (
                      <div key={`${item.id}-${index}`} className="flex flex-col gap-1">
                        <span className={mobileLabelClassName}>
                          {section.columns[index]}
                        </span>
                        {cell}
                      </div>
                    ))}
                    <div className="flex flex-col gap-2 sm:items-end">
                      <span className={mobileLabelClassName}>
                        {section.columns[section.columns.length - 1]}
                      </span>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <button
                          onClick={() => handleRestore(section.key, item)}
                          className={restoreButtonClassName}
                        >
                          <FiRotateCcw /> Khôi phục
                        </button>
                        <button
                          onClick={() => handleHardDelete(section.key, item)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition md:hover:bg-rose-500/20"
                        >
                          <FiTrash2 /> Xóa vĩnh viễn
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
