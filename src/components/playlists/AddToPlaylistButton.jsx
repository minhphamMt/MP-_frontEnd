import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiLoader,
  FiMusic,
  FiPlus,
  FiX,
} from "react-icons/fi";
import clsx from "clsx";
import Toast from "../common/Toast";
import {
  addSongToPlaylist,
  createPlaylist,
  getPlaylists,
  getPlaylistById,
} from "../../api/playlist.api";
import { normalizeSongId } from "../../store/player.store";
import useAuthStore from "../../store/auth.store";
import { emitAuthRequired } from "../../utils/authPrompt";

const extractData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

export default function AddToPlaylistButton({
  song,
  triggerClassName = "",
  triggerLabel,
  variant = "icon",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const songId = useMemo(() => normalizeSongId(song) || song?.id, [song]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await getPlaylists({ limit: 100 });
      setPlaylists(extractData(res) || []);
    } catch (err) {
      console.error("Load playlists failed", err);
    } finally {
      setLoading(false);
    }
  };

  const hasSongInPlaylist = (songs = []) =>
  songs.some((item) => String(item?.id) === String(songId));


  const showDuplicateToast = (playlist) => {
    setOpen(false);
    setToastTitle("Thông báo");
    setToastMessage(
      `Bài hát "${song?.title || "Bài hát"}" đã có trong playlist "${
        playlist?.name || playlist?.title || "Playlist"
      }"`
    );
  };
  useEffect(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open]);

  const handleAdd = async (playlist) => {
    if (!playlist?.id || !songId) return;
    const playlistSongs = Array.isArray(playlist?.songs) ? playlist.songs : null;
    try {
        if (!playlistSongs) {
        const detailRes = await getPlaylistById(playlist.id);
        const detail = extractData(detailRes);
        const detailSongs = Array.isArray(detail?.songs) ? detail.songs : [];
        if (hasSongInPlaylist(detailSongs)) {
          showDuplicateToast(playlist);
          return;
        }
      } else if (hasSongInPlaylist(playlistSongs)) {
        showDuplicateToast(playlist);
        return;
      }
      setSaving(true);
      await addSongToPlaylist(playlist.id, { songId });
      setOpen(false);
      setToastTitle("Thành công");
      setToastMessage(
        `Đã thêm bài hát "${song?.title || "Bài hát"}" vào playlist "${
          playlist?.name || playlist?.title || "Playlist"
        }"`
      );
    } catch (err) {
       const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "";
      if (status === 409 || message.toLowerCase().includes("exist")) {
        showDuplicateToast(playlist);
        return;
      }
      console.error("Add to playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlaylist = async () => {
    const trimmedName = newPlaylistName.trim();
    if (!trimmedName) return;
    const normalizedName = trimmedName.toLowerCase();
    const duplicate = playlists.some(
      (playlist) =>
        (playlist?.name || playlist?.title || "")
          .trim()
          .toLowerCase() === normalizedName
    );
    if (duplicate) {
      setToastTitle("Thông báo");
      setToastMessage(`Playlist "${trimmedName}" đã tồn tại.`);
      return;
    }
    try {
      setSaving(true);
      const res = await createPlaylist({ name: trimmedName });
      const created = extractData(res);
      if (created) {
        setPlaylists((prev) => [created, ...prev]);
        setNewPlaylistName("");
         setToastTitle("Thành công");
        setToastMessage(
          `Đã tạo playlist "${created?.name || created?.title || trimmedName}"`
        );
      }
    } catch (err) {
      console.error("Create playlist failed", err);
    } finally {
      setSaving(false);
    }
  };

  const closeToast = () => {
    setToastMessage("");
    setToastTitle("");
  };

  const renderTriggerContent = () => {
    if (variant === "text") {
      return (
        <span className="flex items-center gap-2 font-semibold">
          <FiPlus />
          <span>Thêm vào playlist</span>
        </span>
      );
    }

    return <FiPlus />;
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          if (!isAuthenticated) {
            emitAuthRequired();
            return;
          }
          setOpen(true);
        }}
        disabled={disabled}
        className={clsx(
           "flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition md:hover:border-white/30 md:hover:bg-white/15",
          variant === "icon" ? "h-9 w-9 p-0" : "gap-2 px-3 py-2 text-xs",
          disabled && "cursor-not-allowed opacity-60 md:hover:border-white/15 md:hover:bg-white/5",
          triggerClassName
        )}
        title={disabled ? "Nghệ sĩ chỉ có thể xem tại trang này" : "Thêm vào playlist"}
      >
        {triggerLabel || renderTriggerContent()}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 px-4 py-10"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#151515] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur sm:max-w-2xl sm:p-8"
            >
              <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                    Playlist của bạn
                  </p>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">Chọn playlist để thêm</h3>
                  <p className="text-sm text-white/60">
                    {song?.title ? `Thêm "${song.title}"` : "Chọn playlist"}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition md:hover:bg-white/10"
                  aria-label="Đóng"
                >
                  <FiX />
                </button>
              </div>

              <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#151515]">
                {loading ? (
                  <div className="flex items-center justify-center gap-3 px-4 py-8 text-sm text-white/70">
                    <FiLoader className="animate-spin" />
                    Đang tải playlist...
                  </div>
                ) : playlists.length ? (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handleAdd(pl)}
                      disabled={saving}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition md:hover:bg-white/10 disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                          <FiMusic />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold sm:text-base">
                            {pl.name || pl.title || "Playlist"}
                          </p>
                          <p className="truncate text-xs text-white/50">
                            {pl.songs?.length ? `${pl.songs.length} bài hát` : "Playlist cá nhân"}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className="text-white/50" />
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-8 text-sm text-white/60">
                    Bạn chưa có playlist nào. Hãy tạo mới để lưu bài hát yêu thích.
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[#151515] p-5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Playlist mới</p>
                  <p className="text-xs text-white/60">Thêm nhanh tên playlist rồi bấm tạo</p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <input
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Tên playlist"
                    className="w-full min-w-[220px] rounded-lg border border-white/10 bg-[#1c1c1c] px-3 py-2 text-sm text-white outline-none ring-0 focus:border-emerald-400/60 focus:bg-[#202020]"
                  />
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim() || saving}
                    className="rounded-lg border border-emerald-300/50 bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition md:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Tạo playlist
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

       <Toast title={toastTitle} message={toastMessage} onClose={closeToast} />
    </>
  );
}
