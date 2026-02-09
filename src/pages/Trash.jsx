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

const formatDateTime = (value) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const emptyState = { songs: [], albums: [], artists: [], genres: [] };

export default function Trash() {
  const role = useAuthStore((state) => state.role);
  const [deletedItems, setDeletedItems] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const sections = useMemo(
    () => [
      {
        key: "songs",
        title: "Bài hát",
        description: "Những bài hát đã bị xoá mềm.",
        columns: ["Bài hát", "Nghệ sĩ", "Ngày xoá", "Hành động"],
        renderCells: (song) => [
          <>
            <p className="text-white">{song.title}</p>
            <p className="text-xs text-white/50">
              {song.artist_name || "Chưa có nghệ sĩ"}
            </p>
          </>,
          <span className="text-xs text-white/60">
            {song.artist_name || "-"}
          </span>,
          <span className="text-xs text-white/60">
            {formatDateTime(song.deleted_at)}
          </span>,
        ],
      },
      {
        key: "albums",
        title: "Album",
        description: "Danh sách album đang ở thùng rác.",
        columns: ["Album", "Nghệ sĩ", "Ngày xoá", "Hành động"],
        renderCells: (album) => [
          <>
            <p className="text-white">{album.title}</p>
            <p className="text-xs text-white/50">
              {album.artist_name || "Chưa có nghệ sĩ"}
            </p>
          </>,
          <span className="text-xs text-white/60">
            {album.artist_name || "-"}
          </span>,
          <span className="text-xs text-white/60">
            {formatDateTime(album.deleted_at)}
          </span>,
        ],
      },
      {
        key: "artists",
        title: "Nghệ sĩ",
        description: "Hồ sơ nghệ sĩ đã bị xoá mềm.",
        columns: ["Nghệ sĩ", "Bí danh", "Ngày xoá", "Hành động"],
        renderCells: (artist) => [
          <>
            <p className="text-white">{artist.name}</p>
            <p className="text-xs text-white/50">
              {artist.alias || artist.realname || "Chưa cập nhật"}
            </p>
          </>,
          <span className="text-xs text-white/60">
            {artist.alias || artist.realname || "-"}
          </span>,
          <span className="text-xs text-white/60">
            {formatDateTime(artist.deleted_at)}
          </span>,
        ],
      },
      {
        key: "genres",
        title: "Thể loại",
        description: "Chỉ quản trị viên mới nhìn thấy thể loại đã xoá.",
        columns: ["Thể loại", "Ngày xoá", "Hành động"],
        renderCells: (genre) => [
          <span className="text-white">{genre.name}</span>,
          <span className="text-xs text-white/60">
            {formatDateTime(genre.deleted_at)}
          </span>,
        ],
      },
    ],
    []
  );

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      const res = await getDeletedItems();
      const payload = res?.data?.data ?? res?.data ?? emptyState;
      setDeletedItems({
        songs: payload.songs || [],
        albums: payload.albums || [],
        artists: payload.artists || [],
        genres: payload.genres || [],
      });
      setErrorMessage("");
    } catch (error) {
      console.error("Load deleted items failed", error);
      setErrorMessage("Không thể tải danh sách thùng rác.");
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
    const confirmed = window.confirm(
      `Khôi phục ${type === "songs" ? "bài hát" : type === "albums" ? "album" : type === "artists" ? "nghệ sĩ" : "thể loại"} "${item.name || item.title}"?`
    );
    if (!confirmed) return;
    try {
      await restoreHandlers[type](item.id);
      await loadDeletedItems();
    } catch (error) {
      console.error("Restore item failed", error);
      alert("Không thể khôi phục bản ghi.");
    }
  };

  const handleHardDelete = async (type, item) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xoá vĩnh viễn "${item.name || item.title}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;
    try {
      await hardDeleteHandlers[type](item.id);
      await loadDeletedItems();
    } catch (error) {
      console.error("Hard delete item failed", error);
      alert("Không thể xoá vĩnh viễn bản ghi.");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            {role === "ADMIN" ? "Quản trị" : "Nghệ sĩ"}
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Thùng rác
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {role === "ADMIN"
              ? "Xem toàn bộ bản ghi đã bị xoá mềm và quản lý khôi phục."
              : "Chỉ hiển thị nội dung bạn đã xoá mềm."}
          </p>
        </div>
        <button
          onClick={loadDeletedItems}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {sections.map((section) => {
        const items = deletedItems[section.key] || [];
        if (section.key === "genres" && role !== "ADMIN") return null;
        const gridClass =
          section.columns.length === 3
            ? "sm:grid-cols-[1.6fr_0.8fr_0.8fr]"
            : "sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr]";
        return (
          <div
            key={section.key}
            className="overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {section.title}
                </h2>
                <p className="text-xs text-white/50">{section.description}</p>
              </div>
              <div className="text-xs text-white/50">
                {items.length} bản ghi
              </div>
            </div>

            <div
              className={`hidden grid-cols-1 gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/40 sm:grid ${gridClass}`}
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
              {loading && (
                <div className="px-4 py-6 text-sm text-white/60">
                  Đang tải dữ liệu...
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className="px-4 py-6 text-sm text-white/60">
                  Chưa có bản ghi nào.
                </div>
              )}
              {!loading &&
                items.map((item) => (
                  <div
                    key={item.id}
                     className={`flex flex-col gap-4 px-4 py-4 text-sm text-white/80 sm:grid sm:items-center ${gridClass}`}
                  >
                    {section.renderCells(item).map((cell, index, cells) => (
                      <div
                        key={`${item.id}-${index}`}
                       className={`flex flex-col gap-1 ${
                          index === cells.length - 1 ? "sm:text-right" : ""
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 sm:hidden">
                          {section.columns[index]}
                        </span>
                        {cell}
                      </div>
                    ))}
                     <div className="flex flex-col gap-2 sm:items-end">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 sm:hidden">
                        {section.columns[section.columns.length - 1]}
                      </span>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button
                        onClick={() => handleRestore(section.key, item)}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-400/20"
                      >
                        <FiRotateCcw /> Khôi phục
                      </button>
                      <button
                        onClick={() => handleHardDelete(section.key, item)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <FiTrash2 /> Xoá vĩnh viễn
                      </button>
                       </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}