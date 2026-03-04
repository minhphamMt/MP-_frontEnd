import { useEffect, useState } from "react";
import { FiChevronLeft, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { deleteAlbum, getAlbumById } from "../../api/album.api";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay } from "../../utils/date";
import OptimizedImage from "../../components/common/OptimizedImage";
import { confirmAdminAction } from "../../utils/adminDialog";

const getSongCover = (song) =>
  song?.cover_url || song?.cover || song?.thumbnail || song?.image;

export default function AdminAlbumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAlbum = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy album.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getAlbumById(id);
      const detail = res?.data?.data ?? res?.data ?? null;
      if (!detail) {
        setErrorMessage("Không tìm thấy album.");
        setAlbum(null);
        return;
      }
      setAlbum(detail);
      setErrorMessage("");
    } catch (error) {
      console.error("Load album detail failed", error);
      setAlbum(null);
      setErrorMessage("Không thể tải chi tiết album.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const handleDelete = async () => {
    if (!album?.id) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm album",
      message: `Bạn có chắc muốn xóa mềm album "${album.title || album.id}"?`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteAlbum(album.id);
      navigate("/admin/albums", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã xóa mềm album." } },
      });
    } catch (error) {
      console.error("Delete album failed", error);
      setErrorMessage("Không thể xóa mềm album.");
    }
  };

  return (
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/albums")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
        >
          <FiChevronLeft /> Quay lại danh sách album
        </button>
        {album?.id && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(`/admin/albums/${album.id}/edit`)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition md:hover:bg-white/10 sm:text-sm"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200 transition md:hover:bg-rose-500/20 sm:text-sm"
            >
              <FiTrash2 /> Xóa mềm
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-[#181818] px-4 py-6 text-sm text-white/60">
          Đang tải dữ liệu...
        </div>
      )}

      {!loading && errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {!loading && album && (
        <div className="admin-glass rounded-3xl border border-white/10 bg-[#181818] p-6 text-xs text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:text-sm">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold text-white sm:text-sm">Ảnh album</p>
              <div className="mt-4">
                {album.cover_url || album.cover ? (
                  <OptimizedImage
                    src={resolveAssetUrl(album.cover_url || album.cover)}
                    alt={album.title}
                    className="h-60 w-full rounded-2xl bg-black/40 object-contain shadow-lg"
                  />
                ) : (
                  <div className="flex h-60 items-center justify-center rounded-2xl bg-white/10 text-xs text-white/60 sm:text-sm">
                    Chưa có ảnh album
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-xs text-white/70 sm:text-sm">
              <p className="text-xs font-semibold text-white sm:text-sm">Thông tin</p>
              <div className="mt-4 space-y-3">
                <p>
                  <span className="text-white/60">Tên album:</span>{" "}
                  <span className="text-white">{album.title || "-"}</span>
                </p>
                <p>
                  <span className="text-white/60">Nghệ sĩ:</span>{" "}
                  <span className="text-white">{album.artist?.name || album.artist_name || "-"}</span>
                </p>
                <p>
                  <span className="text-white/60">Ngày phát hành:</span>{" "}
                  <span className="text-white">{formatDateDisplay(album.release_date)}</span>
                </p>
                <p>
                  <span className="text-white/60">ID:</span>{" "}
                  <span className="text-white">{album.id}</span>
                </p>
              </div>
            </div>
          </div>

          {album.songs?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-white sm:text-sm">Danh sách bài hát</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {album.songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 sm:text-sm"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-black/40">
                      {getSongCover(song) || album.cover_url ? (
                        <OptimizedImage
                          src={resolveAssetUrl(
                            getSongCover(song) || album.cover_url || album.cover
                          )}
                          alt={song.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-white/50">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{song.title}</p>
                      <p className="truncate text-xs text-white/50">
                        {song.artist_name || album.artist?.name || album.artist_name || "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

