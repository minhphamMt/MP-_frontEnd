import { useEffect, useState } from "react";
import { FiChevronLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { deleteAlbum, getAlbumById } from "../../api/album.api";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay } from "../../utils/date";
import OptimizedImage from "../../components/common/OptimizedImage";
import { confirmAdminAction } from "../../utils/adminDialog";
import { getArtistLabel } from "../../utils/artist";

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
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/albums")}
          className="admin-button admin-button-ghost"
        >
          <FiChevronLeft /> Quay lại danh sách album
        </button>
        {album?.id && (
          <div className="admin-toolbar-actions">
            <button
              onClick={() => navigate(`/admin/albums/${album.id}/edit`)}
              className="admin-button admin-button-ghost"
            >
              <FiEdit2 /> Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="admin-button admin-button-danger"
            >
              <FiTrash2 /> Xóa mềm
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
      )}

      {!loading && errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {!loading && album && (
        <div className="admin-detail-shell">
          <div className="admin-detail-header">
            <div className="admin-detail-heading">
              <p className="admin-list-kicker">Chi tiết album</p>
              <h1 className="admin-list-title">{album.title || "Album chưa đặt tên"}</h1>
            </div>
          </div>

          <div className="admin-detail-grid is-two-column">
            <section className="admin-detail-panel">
              <p className="admin-detail-panel-title">Ảnh album</p>
              <div className="mt-4">
                {album.cover_url || album.cover ? (
                  <div className="admin-detail-media is-square">
                    <OptimizedImage
                      src={resolveAssetUrl(album.cover_url || album.cover)}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="admin-detail-placeholder">Chưa có ảnh album</div>
                )}
              </div>
            </section>

            <section className="admin-detail-panel">
              <p className="admin-detail-panel-title">Thông tin chính</p>
              <div className="mt-4 admin-detail-meta-grid">
                <div className="admin-detail-meta-card">
                  <p className="admin-detail-meta-label">Tên album</p>
                  <p className="admin-detail-meta-value">{album.title || "-"}</p>
                </div>
                <div className="admin-detail-meta-card">
                  <p className="admin-detail-meta-label">Nghệ sĩ</p>
                  <p className="admin-detail-meta-value">
                    {getArtistLabel(album, album.artist?.name || album.artist_name || "") || "-"}
                  </p>
                </div>
                <div className="admin-detail-meta-card">
                  <p className="admin-detail-meta-label">Ngày phát hành</p>
                  <p className="admin-detail-meta-value">
                    {formatDateDisplay(album.release_date)}
                  </p>
                </div>
                <div className="admin-detail-meta-card">
                  <p className="admin-detail-meta-label">Album ID</p>
                  <p className="admin-detail-meta-value">{album.id}</p>
                </div>
                <div className="admin-detail-meta-card">
                  <p className="admin-detail-meta-label">Zing ID</p>
                  <p className="admin-detail-meta-value">{album.zing_album_id || "-"}</p>
                </div>
                <div className="admin-detail-meta-card">
                  <p className="admin-detail-meta-label">Số bài hát</p>
                  <p className="admin-detail-meta-value">{album.songs?.length || 0}</p>
                </div>
              </div>
            </section>
          </div>

          <section className="admin-detail-panel">
            <p className="admin-detail-panel-title">Danh sách bài hát</p>
            {album.songs?.length > 0 ? (
              <div className="mt-4 admin-detail-list">
                {album.songs.map((song) => (
                  <div key={song.id} className="admin-detail-list-card">
                    <div className="admin-detail-list-thumb">
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{song.title}</p>
                      <p className="truncate text-sm text-white/58">
                        {getArtistLabel(song, album.artist?.name || album.artist_name || "") || "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty-state mt-4 rounded-2xl border border-dashed border-white/10 bg-[#151617]">
                Album này chưa có bài hát nào.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
