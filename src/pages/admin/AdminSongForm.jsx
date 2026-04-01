import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiChevronLeft, FiRefreshCw, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  importAdminSongLyrics,
  listAdminSongs,
  listGenres,
  updateAdminSong,
  validateAdminSongLyrics,
} from "../../api/admin.api";
import { deleteSong, getSongById } from "../../api/song.api";
import DateInputField from "../../components/common/DateInputField";
import OptimizedImage from "../../components/common/OptimizedImage";
import Toast from "../../components/common/Toast";
import SourceFileCard from "../../components/common/SourceFileCard";
import LyricSourceBadge from "../../components/song/LyricSourceBadge";
import LyricSourceFileCard from "../../components/song/LyricSourceFileCard";
import { resolveAssetUrl } from "../../utils/asset";
import { confirmAdminAction } from "../../utils/adminDialog";
import { getArtistLabel } from "../../utils/artist";
import { normalizeDateInputValue } from "../../utils/date";
import { uploadFileToFirebase } from "../../utils/firebaseUpload";
import {
  formatLyricPreviewTime,
  getLyricSourceFileName,
  getLyricSourceState,
  getLyricsPath,
  hasLyricsInDb,
  isLrcLyricSource,
  LYRIC_SOURCE_ACCEPT,
  LYRIC_SOURCE_FOLDER,
  prepareLyricSourceUploadFile,
  validateLyricSourceFile,
} from "../../utils/lyrics";

const normalizeGenreValue = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) {
    return genres.map((genre) => (typeof genre === "string" ? genre : genre?.name)).filter(Boolean);
  }
  if (typeof genres === "string") {
    return genres.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getSongCover = (song) =>
  song?.cover_url || song?.cover || song?.thumbnail || song?.image || song?.album_cover;

const STATUS_OPTIONS = [
  { value: "", label: "Không đổi" },
  { value: "pending", label: "pending" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
];

const getStatusLabel = (status) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return "Chưa cập nhật";
  }
};

const extractActionData = (response) => response?.data?.data ?? response?.data ?? null;

export default function AdminSongForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({ title: "", message: "" });
  const [song, setSong] = useState(null);
  const [genres, setGenres] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [lyricFile, setLyricFile] = useState(null);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [updatingLyricsSource, setUpdatingLyricsSource] = useState(false);
  const [validatingLyrics, setValidatingLyrics] = useState(false);
  const [importingLyrics, setImportingLyrics] = useState(false);
  const [lyricValidation, setLyricValidation] = useState(null);
  const [formValues, setFormValues] = useState({
    title: "",
    artist_id: "",
    album_id: "",
    status: "",
    release_date: "",
    genres: [],
    cover_url: "",
    lyrics_path: "",
  });

  const applySongDetail = (detail) => {
    setSong(detail);
    setFormValues({
      title: detail?.title || "",
      artist_id: detail?.artist_id ? `${detail.artist_id}` : "",
      album_id: detail?.album_id ? `${detail.album_id}` : "",
      status: detail?.status || "",
      release_date: normalizeDateInputValue(detail?.release_date),
      genres: normalizeGenreValue(detail?.genres),
      cover_url: getSongCover(detail) || "",
      lyrics_path: detail?.lyrics_path || detail?.lyricsPath || detail?.lyrics_url || "",
    });
  };

  const loadGenres = async () => {
    try {
      const res = await listGenres({ page: 1, limit: 200 });
      const payload = res?.data?.data ?? res?.data ?? [];
      setGenres(Array.isArray(payload) ? payload : payload.items || payload.genres || []);
    } catch (error) {
      console.error("Load genres failed", error);
      setGenres([]);
    }
  };

  const loadSong = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy bài hát.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getSongById(id);
      const payload = res?.data?.data ?? res?.data ?? null;
      const detail = payload?.song || payload;
      if (!detail) throw new Error("Song detail is empty");
      applySongDetail(detail);
      setErrorMessage("");
    } catch (error) {
      try {
        const fallbackRes = await listAdminSongs({ page: 1, limit: 100, keyword: id, q: id });
        const payload = fallbackRes?.data?.data ?? fallbackRes?.data ?? [];
        const list = Array.isArray(payload) ? payload : payload.items || payload.songs || [];
        const detail = list.find((item) => `${item.id}` === `${id}`);
        if (!detail) {
          setErrorMessage("Không thể tải thông tin bài hát.");
          setSong(null);
          return;
        }
        applySongDetail(detail);
        setErrorMessage("");
      } catch (fallbackError) {
        console.error("Load song failed", fallbackError);
        setErrorMessage("Không thể tải thông tin bài hát.");
        setSong(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLyricFile(null);
    setLyricValidation(null);
    loadGenres();
    loadSong();
  }, [id]);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    if (formValues.cover_url) return resolveAssetUrl(formValues.cover_url);
    if (song && getSongCover(song)) return resolveAssetUrl(getSongCover(song));
    return null;
  }, [coverFile, formValues.cover_url, song]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  const currentSongValues = useMemo(() => ({ ...song, ...formValues }), [song, formValues]);
  const lyricSourceState = useMemo(() => getLyricSourceState(currentSongValues), [currentSongValues]);
  const lyricSourceFileName = useMemo(
    () => (lyricFile?.name ? lyricFile.name : getLyricSourceFileName(currentSongValues) || ""),
    [currentSongValues, lyricFile]
  );
  const currentLyricsPath = useMemo(() => getLyricsPath(currentSongValues), [currentSongValues]);
  const sourceIsLrc = useMemo(() => isLrcLyricSource(currentSongValues), [currentSongValues]);
  const lyricsImported = useMemo(() => hasLyricsInDb(currentSongValues), [currentSongValues]);
  const hasPendingLyricUpload = Boolean(lyricFile);
  const validationMatchesCurrentSource = Boolean(
    lyricValidation?.lyrics_path && lyricValidation.lyrics_path === currentLyricsPath
  );
  const canImportValidatedLyrics = Boolean(
    sourceIsLrc && validationMatchesCurrentSource && lyricValidation && !hasPendingLyricUpload
  );
  const lyricWarnings = Array.isArray(lyricValidation?.warnings) ? lyricValidation.warnings : [];
  const lyricRawPreview = Array.isArray(lyricValidation?.raw_preview) ? lyricValidation.raw_preview : [];
  const lyricParsedPreview = Array.isArray(lyricValidation?.preview) ? lyricValidation.preview : [];

  const { visibleGenres, canToggleGenres } = useMemo(() => {
    const maxVisibleGenres = 8;
    if (showAllGenres) return { visibleGenres: genres, canToggleGenres: genres.length > maxVisibleGenres };
    const activeSet = new Set(formValues.genres);
    const activeGenres = genres.filter((genre) => activeSet.has(genre.name));
    const inactiveGenres = genres.filter((genre) => !activeSet.has(genre.name));
    return {
      visibleGenres: [...activeGenres, ...inactiveGenres].slice(0, maxVisibleGenres),
      canToggleGenres: genres.length > maxVisibleGenres,
    };
  }, [formValues.genres, genres, showAllGenres]);

  const handleToggleGenre = (name) => {
    setFormValues((prev) => {
      const exists = prev.genres.includes(name);
      return { ...prev, genres: exists ? prev.genres.filter((genre) => genre !== name) : [...prev.genres, name] };
    });
  };

  const handleLyricFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setLyricFile(null);
      setLyricValidation(null);
      return;
    }
    const validation = validateLyricSourceFile(file);
    if (!validation.valid) {
      setLyricFile(null);
      setLyricValidation(null);
      setErrorMessage(validation.error);
      event.target.value = "";
      return;
    }
    setLyricFile(file);
    setLyricValidation(null);
    setErrorMessage("");
  };

  const handleReplaceLyricSource = async () => {
    if (!id || !lyricFile) {
      setToast({
        title: "Thiếu dữ liệu",
        message: "Vui lòng chọn file lyric source trước khi cập nhật.",
      });
      return;
    }
    try {
      setUpdatingLyricsSource(true);
      setErrorMessage("");
      const preparedLyricFile = await prepareLyricSourceUploadFile(lyricFile);
      const uploadedLyricUrl = await uploadFileToFirebase(preparedLyricFile, LYRIC_SOURCE_FOLDER);
      await updateAdminSong(id, { lyrics_path: uploadedLyricUrl });
      setFormValues((prev) => ({ ...prev, lyrics_path: uploadedLyricUrl }));
      setSong((prev) =>
        prev ? { ...prev, lyrics_path: uploadedLyricUrl, lyricsPath: uploadedLyricUrl, lyrics_url: uploadedLyricUrl } : prev
      );
      setLyricFile(null);
      setLyricValidation(null);
      setToast({ title: "Thành công", message: "Đã cập nhật lyric source cho bài hát." });
    } catch (error) {
      console.error("Update lyric source failed", error);
      setErrorMessage("Không thể cập nhật lyric source.");
    } finally {
      setUpdatingLyricsSource(false);
    }
  };

  const handleValidateLyrics = async () => {
    if (!id) return;
    if (hasPendingLyricUpload) {
      setToast({
        title: "Source chưa lưu",
        message: "Hãy cập nhật lyric source mới trước khi validate.",
      });
      return;
    }
    if (!sourceIsLrc) {
      setToast({
        title: "Không thể validate",
        message: "Chỉ file .lrc đã lưu mới có thể validate và import vào DB.",
      });
      return;
    }
    try {
      setValidatingLyrics(true);
      setErrorMessage("");
      const res = await validateAdminSongLyrics(id, {});
      const data = extractActionData(res);
      setLyricValidation(data);
      setToast({
        title: "Validate thành công",
        message: `Đã phân tích ${data?.line_count ?? data?.preview?.length ?? 0} dòng lyric.`,
      });
    } catch (error) {
      console.error("Validate song lyrics failed", error);
      setLyricValidation(null);
      setErrorMessage(
        error?.response?.data?.message || "Không thể validate file lyric .lrc hiện tại."
      );
    } finally {
      setValidatingLyrics(false);
    }
  };

  const handleImportLyrics = async () => {
    if (!id) return;
    if (hasPendingLyricUpload) {
      setToast({
        title: "Source chưa lưu",
        message: "Hãy cập nhật lyric source mới trước khi import.",
      });
      return;
    }
    if (!canImportValidatedLyrics) {
      setToast({
        title: "Chưa sẵn sàng import",
        message: "Hãy validate LRC source hiện tại trước khi import.",
      });
      return;
    }
    try {
      setImportingLyrics(true);
      setErrorMessage("");
      const res = await importAdminSongLyrics(id, {});
      const data = extractActionData(res);
      const importedFlag = Boolean(data?.has_lyrics_in_db ?? data?.hasLyricsInDb ?? true);
      setLyricValidation((prev) => ({ ...(prev || {}), ...(data || {}), raw_preview: data?.raw_preview ?? prev?.raw_preview ?? [] }));
      setSong((prev) =>
        prev ? { ...prev, has_lyrics_in_db: importedFlag, hasLyricsInDb: importedFlag, lyrics_path: data?.lyrics_path ?? prev.lyrics_path } : prev
      );
      if (data?.lyrics_path) setFormValues((prev) => ({ ...prev, lyrics_path: data.lyrics_path }));
      setToast({
        title: "Lyrics imported",
        message: `Đã import ${data?.imported_count ?? data?.preview?.length ?? 0} dòng lyric vào DB.`,
      });
    } catch (error) {
      console.error("Import song lyrics failed", error);
      setErrorMessage(
        error?.response?.data?.message || "Không thể import lyric từ file .lrc hiện tại."
      );
    } finally {
      setImportingLyrics(false);
    }
  };

  const handleSubmit = async () => {
    if (!id || !song) return;
    if (!formValues.title.trim()) {
      setErrorMessage("Vui lòng nhập tên bài hát.");
      return;
    }
    try {
      setSaving(true);
      setErrorMessage("");
      const preparedLyricFile = lyricFile ? await prepareLyricSourceUploadFile(lyricFile) : null;
      const uploadedLyricUrl = preparedLyricFile ? await uploadFileToFirebase(preparedLyricFile, LYRIC_SOURCE_FOLDER) : null;
      let payload = {
        title: formValues.title || undefined,
        artist_id: formValues.artist_id || null,
        album_id: formValues.album_id || null,
        status: formValues.status || undefined,
        release_date: formValues.release_date || null,
        genres: formValues.genres,
        cover_url: formValues.cover_url || null,
        lyrics_path: uploadedLyricUrl || getLyricsPath(formValues) || null,
      };
      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        Object.entries(payload).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") return;
          if (Array.isArray(value)) {
            value.filter(Boolean).forEach((item) => formData.append(key, item));
            return;
          }
          formData.append(key, value);
        });
        payload = formData;
      }
      await updateAdminSong(id, payload);
      navigate("/admin/songs", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã cập nhật bài hát." } },
      });
    } catch (error) {
      console.error("Update song failed", error);
      setErrorMessage("Không thể cập nhật bài hát.");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!id || !song) return;
    const confirmed = await confirmAdminAction({
      title: "Xóa mềm bài hát",
      message: `Bạn có chắc muốn xóa mềm bài hát "${song.title}"?`,
      confirmText: "Xóa mềm",
      cancelText: "Hủy",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteSong(id);
      navigate("/admin/songs", {
        replace: true,
        state: { toast: { title: "Thành công", message: "Đã xóa mềm bài hát." } },
      });
    } catch (error) {
      console.error("Soft delete song failed", error);
      setErrorMessage("Không thể xóa mềm bài hát.");
    }
  };

  const isBusy = saving || loading || updatingLyricsSource || validatingLyrics || importingLyrics;

  return (
    <div className="admin-page-shell admin-list-page min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <button onClick={() => navigate("/admin/songs")} className="admin-button admin-button-ghost">
        <FiChevronLeft /> Quay lại danh sách
      </button>
      <div className="admin-detail-shell">
        <div className="admin-detail-header">
          <div className="admin-detail-heading">
            <p className="admin-list-kicker">Quản trị</p>
            <h1 className="admin-list-title">Chỉnh sửa bài hát</h1>
          </div>
          <button onClick={handleSubmit} disabled={isBusy} className="admin-button admin-button-primary">
            {saving ? "Đang lưu..." : "Lưu cập nhật"}
          </button>
        </div>
        {errorMessage && (
          <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100 sm:text-sm">
            {errorMessage}
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="admin-loading-state admin-detail-panel">Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-4">
              <div className="admin-detail-grid is-two-column">
                <div className="admin-detail-panel">
                  <p className="admin-detail-panel-title">Ảnh bìa và thông tin nhanh</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {coverPreview ? (
                      <div className="admin-detail-media is-square">
                        <OptimizedImage src={coverPreview} alt={formValues.title || "Song cover"} className="h-full w-full bg-black/40 object-cover" />
                      </div>
                    ) : (
                      <div className="admin-detail-placeholder">Chưa có ảnh bài hát</div>
                    )}
                    <div className="admin-detail-meta-grid">
                      <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Bài hát</p><p className="admin-detail-meta-value">{song?.title || "Chưa cập nhật"}</p></div>
                      <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Album</p><p className="admin-detail-meta-value">{song?.album_title || "Single"}</p></div>
                      <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Nghệ sĩ</p><p className="admin-detail-meta-value">{getArtistLabel(song, song?.artist_name || "") || "-"}</p></div>
                      <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Trạng thái</p><p className="admin-detail-meta-value">{getStatusLabel(song?.status)}</p></div>
                      <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Lyric source</p><div className="mt-2"><LyricSourceBadge item={currentSongValues} variant="admin" /></div></div>
                      <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Lyrics trong DB</p><p className="admin-detail-meta-value">{lyricsImported ? "Đã import" : "Chưa import"}</p></div>
                    </div>
                    <SourceFileCard variant="admin" type="image" file={coverFile} url={formValues.cover_url} emptyLabel="Chưa có ảnh bìa" helperText="PNG/JPG • Chọn ảnh bìa để cập nhật" existingText="PNG/JPG • Đang dùng artwork hiện tại" pendingText="PNG/JPG • Ảnh mới sẽ được áp dụng khi lưu" />
                    <input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} className="admin-upload-field" />
                  </div>
                </div>
                <div className="admin-detail-panel">
                  <p className="admin-detail-panel-title">Thông tin chỉnh sửa</p>
                  <div className="mt-4 admin-detail-form-grid">
                    <label className="admin-detail-label is-full">
                      Tên bài hát
                      <input value={formValues.title} onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))} className="admin-field" />
                    </label>
                    <label className="admin-detail-label">
                      Trạng thái
                      <select value={formValues.status} onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value }))} className="admin-select-field">
                        {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                    <label className="admin-detail-label">
                      Ngày phát hành
                      <DateInputField
                        value={formValues.release_date}
                        onChange={(value) =>
                          setFormValues((prev) => ({ ...prev, release_date: value }))
                        }
                        className="admin-field"
                      />
                    </label>
                  </div>
                  <div className="mt-5">
                    <p className="admin-detail-panel-title">Thể loại</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {visibleGenres.map((genre) => {
                        const isActive = formValues.genres.includes(genre.name);
                        return <button key={genre.id} type="button" onClick={() => handleToggleGenre(genre.name)} className={`admin-toggle-chip ${isActive ? "is-active" : ""}`}>{genre.name}</button>;
                      })}
                    </div>
                    {canToggleGenres && (
                      <div className="mt-3">
                        <button type="button" onClick={() => setShowAllGenres((prev) => !prev)} className="admin-button admin-button-ghost">
                          {showAllGenres ? "Thu gọn" : "Xem thêm"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <section className="admin-detail-panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="admin-detail-panel-title">Nguồn lyric</p>
                    <p className="admin-detail-panel-note">
                      Source file phải được tải lên Firebase thư mục <code>uploads/lyric/</code>. Upload, validate và import lyric chỉ thực hiện tại màn chỉnh sửa này.
                    </p>
                  </div>
                  <LyricSourceBadge item={currentSongValues} variant="admin" />
                </div>
                <div className="mt-4 space-y-4">
                  <input type="file" accept={LYRIC_SOURCE_ACCEPT} onChange={handleLyricFileChange} className="admin-upload-field" />
                  <div className="admin-detail-meta-grid">
                    <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">File hiện tại</p><p className="admin-detail-meta-value">{lyricSourceFileName || (lyricSourceState.key === "db_only" ? "Đã có lyrics trong DB" : "Chưa có lyric source")}</p></div>
                    <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Loại source</p><p className="admin-detail-meta-value">{lyricSourceState.label}</p></div>
                    <div className="admin-detail-meta-card"><p className="admin-detail-meta-label">Lyrics DB</p><p className="admin-detail-meta-value">{lyricsImported ? "Đã có lyric trong DB" : "Chưa import lyric"}</p></div>
                  </div>
                  <LyricSourceFileCard item={currentSongValues} file={lyricFile} variant="admin" helperText={lyricFile ? "File mới từ máy. Cần cập nhật source trước khi validate/import" : currentLyricsPath ? "Mở/tải lại dưới dạng UTF-8" : "Chưa có file lyric source"} onError={setErrorMessage} />
                  <div className="admin-lyrics-review-grid">
                    <div className="admin-lyrics-source-box">
                      <p className="admin-detail-panel-title">Cập nhật lyric source</p>
                      <p className="admin-detail-panel-note">
                        {lyricFile ? "Source mới đang chờ upload. Bấm cập nhật lyric source để lưu trước khi validate/import." : currentLyricsPath ? "Có thể thay source hiện tại bằng file .txt hoặc .lrc khác." : "Chọn file .txt hoặc .lrc rồi cập nhật source cho bài hát này."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={handleReplaceLyricSource} disabled={isBusy || !lyricFile} className="admin-button admin-button-primary">
                          <FiUploadCloud /> {updatingLyricsSource ? "Đang cập nhật source..." : "Cập nhật lyric source"}
                        </button>
                      </div>
                    </div>
                    <div className="admin-lyrics-source-box">
                      <p className="admin-detail-panel-title">Validate và import LRC</p>
                      <p className="admin-detail-panel-note">
                        {hasPendingLyricUpload ? "Bạn đang có source mới chưa lưu. Hãy cập nhật source trước khi validate/import." : sourceIsLrc ? "Validate source hiện tại trước. Sau khi validate thành công mới import vào DB." : lyricsImported && !currentLyricsPath ? "Bài hát này đã có lyrics trong DB. Nếu cần thay mới, hãy upload một file .lrc và validate/import lại." : "Chỉ file .lrc đã lưu mới có thể validate và import vào DB."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={handleValidateLyrics} disabled={isBusy || hasPendingLyricUpload || !sourceIsLrc} className="admin-button">
                          <FiRefreshCw /> {validatingLyrics ? "Đang validate..." : "Validate LRC"}
                        </button>
                        <button type="button" onClick={handleImportLyrics} disabled={isBusy || !canImportValidatedLyrics} className="admin-button admin-button-success">
                          <FiCheckCircle /> {importingLyrics ? "Đang import..." : "Import To DB"}
                        </button>
                      </div>
                      {!currentLyricsPath && !lyricsImported && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                          Bài hát này chưa có lyric source.
                        </div>
                      )}
                    </div>
                  </div>
                  {lyricWarnings.length > 0 && (
                    <div className="admin-lyrics-warning-list">
                      <p className="admin-detail-panel-title">Warnings</p>
                      <div className="mt-3 space-y-2">
                        {lyricWarnings.map((warning, index) => <div key={`${warning}-${index}`} className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{warning}</div>)}
                      </div>
                    </div>
                  )}
                  {(lyricRawPreview.length > 0 || lyricParsedPreview.length > 0) && (
                    <div className="admin-lyrics-preview-grid">
                      <div className="admin-lyrics-preview-block">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="admin-detail-panel-title">Raw preview</p>
                          <span className="text-xs text-white/45">{lyricValidation?.line_count ?? lyricRawPreview.length} dòng</span>
                        </div>
                        <div className="admin-lyrics-raw-preview mt-4">
                          {lyricRawPreview.length ? lyricRawPreview.map((line, index) => <pre key={`${index}-${line}`} className="admin-lyrics-code-line">{line}</pre>) : <p className="text-sm text-white/50">Không có raw preview.</p>}
                        </div>
                      </div>
                      <div className="admin-lyrics-preview-block">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="admin-detail-panel-title">Parsed preview</p>
                          <span className="text-xs text-white/45">{lyricValidation?.imported_count ? `${lyricValidation.imported_count} dòng đã import` : `${lyricParsedPreview.length} dòng hiển thị`}</span>
                        </div>
                        <div className="admin-lyrics-lines mt-4">
                          {lyricParsedPreview.length ? lyricParsedPreview.map((line, index) => (
                            <div key={`${line.line_number || index}-${line.start_time || index}`} className="admin-lyrics-line-card">
                              <div className="admin-lyrics-line-times"><span>#{line.line_number || index + 1}</span><span>{formatLyricPreviewTime(line.start_time)} - {formatLyricPreviewTime(line.end_time)}</span></div>
                              <p className="admin-lyrics-line-text">{line.text || "(trống)"}</p>
                            </div>
                          )) : <p className="text-sm text-white/50">Không có parsed preview.</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
        <div className="admin-detail-actions">
          <button onClick={handleSoftDelete} disabled={isBusy} className="admin-button admin-button-danger">
            <FiTrash2 /> Xóa mềm
          </button>
          <button onClick={() => navigate("/admin/songs")} className="admin-button admin-button-ghost">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={isBusy} className="admin-button admin-button-primary">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
      <Toast title={toast.title} message={toast.message} onClose={() => setToast({ title: "", message: "" })} />
    </div>
  );
}
