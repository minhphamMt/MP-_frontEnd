import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiDisc,
  FiEdit2,
  FiMusic,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import { deleteAlbum, getAlbumById } from "../../api/album.api";
import { getMyArtistProfile } from "../../api/artist.api";
import OptimizedImage from "../../components/common/OptimizedImage";
import useAuthStore from "../../store/auth.store";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay } from "../../utils/date";
import { getArtistLabel } from "../../utils/artist";
import { confirmAdminAction } from "../../utils/adminDialog";
import { formatDuration } from "../../utils/song";
import { formatTotalDuration, stripHtml } from "../artistDetail.shared";

const statusLabelMap = {
  approved: "Đã duyệt",
  pending: "Chờ duyệt",
  draft: "Nháp",
  rejected: "Từ chối",
  blocked: "Bị chặn",
};

const statusClassMap = {
  approved: "border-sky-300/30 bg-sky-400/12 text-sky-100",
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  draft: "border-slate-400/30 bg-slate-500/10 text-slate-100",
  rejected: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  blocked: "border-red-400/30 bg-red-500/10 text-red-100",
};

const resolveArtistId = (artist) =>
  artist?.id ?? artist?.artist_id ?? artist?.artistId ?? null;

const getSongCover = (song, albumCover) =>
  song?.cover_url || song?.cover || song?.thumbnail || song?.image || albumCover || "";

function MetricCard({ icon, label, value }) {
  const IconComponent = icon;

  return (
    <article className="artist-kpi p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
        {IconComponent ? <IconComponent className="text-white/70" /> : null}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-xl font-bold text-white">{value}</p>
    </article>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 py-3 last:border-none last:pb-0">
      <span className="text-sm text-white/55">{label}</span>
      <span className="text-sm font-semibold text-white">{value || "-"}</span>
    </div>
  );
}

export default function ArtistAlbumDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [album, setAlbum] = useState(null);
  const [artistProfile, setArtistProfile] = useState(user?.artist ?? null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const ensureArtistProfile = useCallback(async () => {
    const fallbackArtistId =
      resolveArtistId(artistProfile) ||
      resolveArtistId(user?.artist) ||
      user?.artist_id ||
      null;

    if (fallbackArtistId) return fallbackArtistId;

    try {
      const res = await getMyArtistProfile();
      const artist = res?.data?.data ?? res?.data ?? null;

      if (artist) {
        setArtistProfile(artist);
        if (user) {
          updateUser({
            ...user,
            artist,
          });
        }
      }

      return resolveArtistId(artist);
    } catch (error) {
      console.error("Load artist profile failed", error);
      return null;
    }
  }, [artistProfile, updateUser, user]);

  const loadAlbum = useCallback(async () => {
    if (!id) {
      setAlbum(null);
      setErrorMessage("Không tìm thấy album.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const currentArtistId = await ensureArtistProfile();
      const res = await getAlbumById(id);
      const payload = res?.data?.data ?? res?.data ?? null;

      if (!payload) {
        setAlbum(null);
        setErrorMessage("Không tìm thấy album.");
        return;
      }

      const ownerArtistId =
        payload?.artist_id ?? payload?.artist?.id ?? payload?.artistId ?? null;

      if (
        currentArtistId &&
        ownerArtistId &&
        String(currentArtistId) !== String(ownerArtistId)
      ) {
        setAlbum(null);
        setErrorMessage("Bạn không có quyền xem chi tiết album này.");
        return;
      }

      const normalizedAlbum = {
        ...payload,
        id: payload?.id ?? payload?.album_id ?? payload?.albumId ?? id,
        title: payload?.title ?? payload?.name ?? "Album",
        cover_url: payload?.cover_url || payload?.cover || "",
        artist_id: ownerArtistId,
        artist_name: getArtistLabel(
          payload,
          payload?.artist_name ||
            payload?.artist?.name ||
            artistProfile?.name ||
            user?.display_name ||
            ""
        ),
        songs: Array.isArray(payload?.songs)
          ? payload.songs.map((song) => ({
              ...song,
              artist_name: getArtistLabel(
                song,
                song?.artist_name || payload?.artist_name || payload?.artist?.name || ""
              ),
            }))
          : [],
      };

      setAlbum(normalizedAlbum);
    } catch (error) {
      console.error("Load artist album detail failed", error);
      setAlbum(null);
      setErrorMessage("Không thể tải chi tiết album.");
    } finally {
      setLoading(false);
    }
  }, [artistProfile?.name, ensureArtistProfile, id, user?.display_name]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const songs = useMemo(() => album?.songs || [], [album?.songs]);
  const totalDuration = useMemo(
    () => songs.reduce((sum, song) => sum + Number(song?.duration || 0), 0),
    [songs]
  );
  const coverUrl = resolveAssetUrl(album?.cover_url || "");
  const status = `${album?.status || ""}`.toLowerCase();
  const statusLabel = statusLabelMap[status] || album?.status || "Chưa cập nhật";
  const statusClass =
    statusClassMap[status] || "border-white/10 bg-white/5 text-white/75";
  const artistMeta = album?.artist || artistProfile || user?.artist || null;
  const releaseDateText = album?.release_date
    ? formatDateDisplay(album.release_date)
    : "Chưa cập nhật";
  const artistSummary = useMemo(() => {
    const summary =
      artistMeta?.short_bio ||
      artistMeta?.shortBio ||
      (artistMeta?.bio ? stripHtml(artistMeta.bio) : "");

    return summary ? summary.slice(0, 220).trim() : "";
  }, [artistMeta?.bio, artistMeta?.shortBio, artistMeta?.short_bio]);

  const handleDelete = async () => {
    if (!album?.id || deleting) return;

    const confirmed = await confirmAdminAction({
      title: "Xóa mềm album",
      message: `Album "${album.title || album.id}" sẽ được chuyển vào thùng rác. Bạn có muốn tiếp tục không?`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteAlbum(album.id);
      navigate("/artist/albums", { replace: true });
    } catch (error) {
      console.error("Delete artist album failed", error);
      setErrorMessage("Không thể xóa album lúc này.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="artist-page-shell artist-glass ui-skeleton h-[220px] rounded-[32px]" />
        <div className="artist-page-shell artist-glass ui-skeleton h-[180px] rounded-[32px]" />
        <div className="artist-page-shell artist-glass ui-skeleton h-[320px] rounded-[32px]" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="space-y-6">
        <section className="artist-page-shell artist-glass p-6 sm:p-8">
          <button
            type="button"
            onClick={() => navigate("/artist/albums")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiArrowLeft />
            Quay lại danh sách album
          </button>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-6 text-center">
            <p className="artist-label">Album Detail</p>
            <h1 className="mt-3 text-2xl font-black text-white">
              Không mở được album
            </h1>
            <p className="mt-3 text-sm text-white/65">
              {errorMessage || "Album này hiện không sẵn sàng trong workspace của bạn."}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : null}

      <section className="artist-page-shell artist-glass overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="artist-label">Album Detail</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              {album.title}
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Xem nhanh thông tin phát hành, tracklist và tình trạng hiện tại của album.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/artist/albums")}
              className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <FiArrowLeft />
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => navigate(`/artist/albums/${album.id}/edit`)}
              className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <FiEdit2 />
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="artist-btn-danger inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiTrash2 />
              {deleting ? "Đang xóa..." : "Xóa mềm"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
            {coverUrl ? (
              <OptimizedImage
                src={coverUrl}
                alt={album.title}
                className="aspect-square h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[linear-gradient(135deg,rgba(56,189,248,0.22),rgba(59,130,246,0.14),rgba(5,10,18,0.96))] text-white/45">
                <FiDisc className="text-5xl" />
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full border px-3 py-1 ${statusClass}`}>
                {statusLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                {songs.length} bài hát
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                {releaseDateText}
              </span>
              {album?.zing_album_id ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  Zing ID: {album.zing_album_id}
                </span>
              ) : null}
            </div>

            <div>
              <p className="text-sm text-white/55">Nghệ sĩ phát hành</p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {album.artist_name || artistMeta?.name || "Đang cập nhật"}
              </h2>
              {artistSummary ? (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/68">
                  {artistSummary}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={FiMusic}
                label="Bài hát"
                value={`${songs.length}`}
              />
              <MetricCard
                icon={FiClock}
                label="Thời lượng"
                value={formatTotalDuration(totalDuration)}
              />
              <MetricCard
                icon={FiCalendar}
                label="Phát hành"
                value={releaseDateText}
              />
              <MetricCard
                icon={FiTag}
                label="Trạng thái"
                value={statusLabel}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="artist-page-shell artist-glass p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="artist-label">Tổng quan</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Thông tin album</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
          <article className="artist-soft-card p-5">
            <InfoRow label="Tên album" value={album.title} />
            <InfoRow
              label="Nghệ sĩ"
              value={album.artist_name || artistMeta?.name || "-"}
            />
            <InfoRow label="Ngày phát hành" value={releaseDateText} />
            <InfoRow label="Tổng bài hát" value={`${songs.length} bài hát`} />
            <InfoRow
              label="Tổng thời lượng"
              value={formatTotalDuration(totalDuration)}
            />
            <InfoRow label="Album ID" value={album.id} />
            {album?.zing_album_id ? (
              <InfoRow label="Zing album ID" value={album.zing_album_id} />
            ) : null}
          </article>

          <article className="artist-soft-card p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              Ghi chú
            </p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/68">
              <p>
                Trang này được tách riêng cho nghệ sĩ để bạn xem chi tiết album trong
                workspace mà không phải đi qua trang public của user.
              </p>
              <p>
                Nếu cần chỉnh tên, ngày phát hành, ảnh bìa hoặc Zing ID, bạn có thể
                dùng nút <span className="font-semibold text-white">Chỉnh sửa</span>{" "}
                ở phía trên.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="artist-page-shell artist-glass p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="artist-label">Tracklist</p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Bài hát trong album
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Danh sách track hiện có trong album và đường dẫn sửa nhanh từng bài.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            {songs.length} bài hát
          </span>
        </div>

        {songs.length === 0 ? (
          <div className="artist-soft-card mt-5 p-5 text-sm text-white/70">
            Album này hiện chưa có bài hát nào.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
            <div className="hidden grid-cols-[56px_minmax(0,2fr)_minmax(0,1fr)_96px_120px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-white/45 lg:grid">
              <span className="text-center">#</span>
              <span>Bài hát</span>
              <span>Nghệ sĩ</span>
              <span className="text-center">Thời gian</span>
              <span className="text-right">Tác vụ</span>
            </div>

            <div className="divide-y divide-white/8">
              {songs.map((song, index) => {
                const songStatus = `${song?.status || ""}`.toLowerCase();
                const songStatusLabel =
                  statusLabelMap[songStatus] || song?.status || null;
                const songStatusClass =
                  statusClassMap[songStatus] ||
                  "border-white/10 bg-white/5 text-white/70";

                return (
                  <article
                    key={song?.id || song?.song_id || `${song?.title}-${index}`}
                    className="grid min-w-0 grid-cols-[1fr_auto] gap-3 px-4 py-3 lg:grid-cols-[56px_minmax(0,2fr)_minmax(0,1fr)_96px_120px] lg:items-center"
                  >
                    <div className="hidden justify-center lg:flex">
                      <span className="text-sm font-semibold text-white/55">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        {getSongCover(song, album?.cover_url) ? (
                          <OptimizedImage
                            src={resolveAssetUrl(getSongCover(song, album?.cover_url))}
                            alt={song?.title || "Song cover"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/45">
                            <FiMusic />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {song?.title || "Chưa cập nhật"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55 lg:hidden">
                          <span className="truncate">
                            {song?.artist_name || album.artist_name || "-"}
                          </span>
                          <span>{formatDuration(song?.duration)}</span>
                        </div>
                        {songStatusLabel ? (
                          <span
                            className={`mt-2 inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] ${songStatusClass}`}
                          >
                            {songStatusLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="hidden min-w-0 text-sm text-white/60 lg:block">
                      <p className="truncate">
                        {song?.artist_name || album.artist_name || "-"}
                      </p>
                    </div>

                    <div className="hidden text-center text-sm text-white/50 lg:block">
                      {formatDuration(song?.duration)}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      {song?.id || song?.song_id ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/artist/songs/${song?.id || song?.song_id}/edit`)
                          }
                          className="artist-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
                        >
                          <FiEdit2 />
                          Sửa
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
