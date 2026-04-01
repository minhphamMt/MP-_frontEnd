import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiMusic,
  FiSave,
} from "react-icons/fi";
import { getAlbums } from "../../api/album.api";
import {
  createSong,
  getArtistSongs,
  getSongById,
  updateSong,
} from "../../api/song.api";
import { getMyArtistProfile } from "../../api/artist.api";
import DateInputField from "../../components/common/DateInputField";
import OptimizedImage from "../../components/common/OptimizedImage";
import SourceFileCard from "../../components/common/SourceFileCard";
import LyricSourceBadge from "../../components/song/LyricSourceBadge";
import LyricSourceFileCard from "../../components/song/LyricSourceFileCard";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDateDisplay, normalizeDateInputValue } from "../../utils/date";
import {
  COVER_UPLOAD_FOLDER,
  MUSIC_UPLOAD_FOLDER,
  uploadFileToFirebase,
} from "../../utils/firebaseUpload";
import {
  getLyricSourceFileName,
  getLyricSourceState,
  getLyricsPath,
  LYRIC_SOURCE_ACCEPT,
  LYRIC_SOURCE_FOLDER,
  prepareLyricSourceUploadFile,
  validateLyricSourceFile,
} from "../../utils/lyrics";
import { formatDuration } from "../../utils/song";

const emptyForm = {
  title: "",
  album_id: "",
  release_date: "",
  duration: null,
  cover_url: "",
  audio_path: "",
  lyrics_path: "",
  has_lyrics_in_db: false,
};

export default function ArtistSongForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [artistId, setArtistId] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [lyricFile, setLyricFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const extractDurationFromFile = useCallback(async (file) => {
    if (!file) return null;

    return new Promise((resolve, reject) => {
      const fileUrl = URL.createObjectURL(file);
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const value = Number.isFinite(audio.duration) ? Math.round(audio.duration) : null;
        URL.revokeObjectURL(fileUrl);
        resolve(value);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        reject(new Error("Không thể đọc thời lượng audio."));
      };
      audio.src = fileUrl;
    });
  }, []);

  useEffect(() => {
    const loadArtistProfile = async () => {
      try {
        const res = await getMyArtistProfile();
        const artist = res?.data?.data ?? res?.data ?? null;
        setArtistId(artist?.id ?? null);
      } catch (err) {
        console.error("Load artist profile failed", err);
        setArtistId(null);
      }
    };

    loadArtistProfile();
  }, []);

  const loadAlbums = useCallback(async () => {
    if (!artistId) return;
    try {
      const res = await getAlbums({ artist_id: artistId, limit: 200 });
      const data = res?.data?.data || [];
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load artist albums failed", err);
      setAlbums([]);
    }
  }, [artistId]);

  const loadSong = useCallback(async () => {
    if (!isEdit) return;

    try {
      setLoading(true);
      let song = null;

      try {
        const res = await getSongById(id);
        song = res?.data?.data ?? res?.data ?? null;
      } catch (err) {
        if (!artistId) throw err;
        const res = await getArtistSongs(artistId);
        const payload = res?.data?.data || res?.data || {};
        const list = payload?.songs || payload?.data || payload || [];
        song = Array.isArray(list)
          ? list.find((item) => String(item?.id) === String(id))
          : null;
      }

      if (!song) {
        throw new Error("Song not found");
      }

      setFormValues({
        title: song?.title || song?.name || "",
        album_id: song?.album_id ?? song?.album?.id ?? "",
        release_date: normalizeDateInputValue(
          song?.release_date || song?.releaseDate || ""
        ),
        duration: song?.duration ?? null,
        cover_url: song?.cover_url ?? song?.cover ?? "",
        audio_path:
          song?.audio_path ||
          song?.audio_url ||
          song?.audio ||
          song?.source ||
          "",
        lyrics_path:
          song?.lyrics_path ||
          song?.lyricsPath ||
          song?.lyrics_url ||
          "",
        has_lyrics_in_db:
          Boolean(song?.has_lyrics_in_db ?? song?.hasLyricsInDb ?? false),
      });
    } catch (err) {
      console.error("Load song failed", err);
      setError("Không thể tải thông tin bài hát.");
    } finally {
      setLoading(false);
    }
  }, [artistId, id, isEdit]);

  useEffect(() => {
    loadAlbums();
    loadSong();
  }, [loadAlbums, loadSong]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAudioFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    setAudioFile(file);
    if (!file) return;

    try {
      const duration = await extractDurationFromFile(file);
      setFormValues((prev) => ({ ...prev, duration }));
      setError("");
    } catch (err) {
      console.error("Extract duration failed", err);
      setError("Không thể đọc thời lượng từ file audio. Hãy thử file MP3 khác.");
    }
  };

  const handleLyricFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setLyricFile(null);
      return;
    }

    const validation = validateLyricSourceFile(file);
    if (!validation.valid) {
      setLyricFile(null);
      setError(validation.error);
      event.target.value = "";
      return;
    }

    setLyricFile(file);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.title.trim()) {
      setError("Vui lòng nhập tên bài hát.");
      return;
    }

    try {
      setLoading(true);
      setUploading(Boolean(audioFile || coverFile || lyricFile));

      const uploadedAudioUrl = audioFile
        ? await uploadFileToFirebase(audioFile, MUSIC_UPLOAD_FOLDER)
        : null;
      const uploadedCoverUrl = coverFile
        ? await uploadFileToFirebase(coverFile, COVER_UPLOAD_FOLDER)
        : null;
      const preparedLyricFile = lyricFile
        ? await prepareLyricSourceUploadFile(lyricFile)
        : null;
      const uploadedLyricUrl = preparedLyricFile
        ? await uploadFileToFirebase(preparedLyricFile, LYRIC_SOURCE_FOLDER)
        : null;

      const payload = {
        title: formValues.title.trim(),
        album_id: formValues.album_id || null,
        release_date: formValues.release_date || null,
        duration: formValues.duration ? Number(formValues.duration) : null,
        cover_url: uploadedCoverUrl || formValues.cover_url || null,
        audio_path: uploadedAudioUrl || formValues.audio_path || null,
        lyrics_path: uploadedLyricUrl || getLyricsPath(formValues) || null,
      };

      if (isEdit) {
        await updateSong(id, payload);
      } else {
        await createSong(payload);
      }

      navigate("/artist/songs");
    } catch (err) {
      console.error("Save song failed", err);
      setError("Lưu bài hát thất bại. Hãy thử lại.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    return formValues.cover_url ? resolveAssetUrl(formValues.cover_url) : "";
  }, [coverFile, formValues.cover_url]);

  const selectedAlbum = useMemo(
    () => albums.find((album) => String(album.id) === String(formValues.album_id)),
    [albums, formValues.album_id]
  );
  const releaseDateDisplay = useMemo(
    () => formatDateDisplay(formValues.release_date, "Chưa chọn ngày phát hành"),
    [formValues.release_date]
  );

  const lyricSourceState = useMemo(
    () => getLyricSourceState(formValues),
    [formValues]
  );

  const lyricSourceFileName = useMemo(() => {
    if (lyricFile?.name) return lyricFile.name;
    return getLyricSourceFileName(formValues) || "";
  }, [formValues, lyricFile]);

  useEffect(() => {
    if (!coverFile || !coverPreview) return undefined;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  return (
    <div className="artist-list-page">
      <section className="artist-detail-shell">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="artist-label">Song Editor</p>
            <h1 className="mt-2 text-3xl font-black text-white">
              {isEdit ? "Chỉnh sửa bài hát" : "Tạo bài hát mới"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/songs")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiArrowLeft />
            Quay lại danh sách
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="artist-detail-grid is-two-column artist-song-editor-grid"
      >
        <div className="artist-song-editor-fields space-y-6">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Thông tin bài hát</p>
            <div className="mt-5 space-y-4">
              <label className="artist-detail-label is-full">
                Tên bài hát <span className="text-rose-300">*</span>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: Hành trình mới"
                  className="artist-input mt-2"
                  required
                />
              </label>

              <label className="artist-detail-label is-full">
                Album
                <select
                  name="album_id"
                  value={formValues.album_id}
                  onChange={handleChange}
                  className="artist-select ui-select mt-2"
                >
                  <option value="">Chọn album (tùy chọn)</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="artist-detail-label is-full">
                Ngày phát hành
                <DateInputField
                  name="release_date"
                  value={formValues.release_date}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, release_date: value }))
                  }
                  className="artist-input mt-2"
                />
              </label>

              <div className="artist-preview-meta-card">
                <strong>Thời lượng bài hát</strong>
                <span>
                  {formValues.duration
                    ? formatDuration(formValues.duration)
                    : "Sẽ tự động tính sau khi chọn file audio"}
                </span>
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Ảnh bìa</p>
            <div className="artist-upload-cluster mt-5">
              <SourceFileCard
                variant="artist"
                type="image"
                file={coverFile}
                url={formValues.cover_url}
                emptyLabel="Chưa có ảnh bìa"
                helperText="PNG/JPG • Chọn ảnh bìa để tải lên"
                existingText="PNG/JPG • Đang dùng artwork hiện tại"
                pendingText="PNG/JPG • Ảnh mới sẽ được tải lên khi lưu"
              />

              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{coverFile ? "Ảnh mới đã chọn" : "Tải ảnh bìa từ máy"}</strong>
                  <span>{coverFile?.name || "PNG/JPG"}</span>
                </div>
                <label className="artist-file-trigger" htmlFor="artist-song-cover-upload">
                  {coverFile ? "Đổi ảnh" : "Chọn ảnh"}
                </label>
                <input
                  id="artist-song-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                  className="artist-file-input"
                />
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Audio</p>
            <div className="artist-upload-cluster mt-5">
              <SourceFileCard
                variant="artist"
                type="audio"
                file={audioFile}
                url={formValues.audio_path}
                emptyLabel="Chưa có file audio"
                helperText="MP3/WAV • Chọn file nhạc để tải lên Firebase"
                existingText="AUDIO • Đang dùng file audio hiện tại"
                pendingText="AUDIO • File mới sẽ được tải lên khi lưu"
              />

              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{audioFile ? "Audio mới đã chọn" : "Tải file nhạc lên Firebase"}</strong>
                  <span>{audioFile?.name || "MP3/WAV"}</span>
                </div>
                <label className="artist-file-trigger" htmlFor="artist-song-audio-upload">
                  {audioFile ? "Đổi file" : "Chọn file"}
                </label>
                <input
                  id="artist-song-audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="artist-file-input"
                />
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="artist-detail-panel-title">Nguồn lyric</p>
                <p className="artist-detail-panel-note">
                  Artist chỉ tải file source lên Firebase. Admin sẽ kiểm tra và import
                  file <code>.lrc</code> vào DB khi cần.
                </p>
              </div>
              <LyricSourceBadge item={formValues} variant="artist" />
            </div>

            <div className="artist-upload-cluster mt-5">
              <div className="artist-file-dropzone">
                <div className="artist-file-name">
                  <strong>{lyricFile ? "Lyric source mới đã chọn" : "Tải file lyric source"}</strong>
                  <span>{lyricSourceFileName || "TXT/LRC"}</span>
                </div>
                <label className="artist-file-trigger" htmlFor="artist-song-lyrics-upload">
                  {lyricFile ? "Đổi file" : "Chọn file"}
                </label>
                <input
                  id="artist-song-lyrics-upload"
                  type="file"
                  accept={LYRIC_SOURCE_ACCEPT}
                  onChange={handleLyricFileChange}
                  className="artist-file-input"
                />
              </div>

              <div className="artist-preview-meta-grid">
                <div className="artist-preview-meta-card">
                  <strong>Định dạng hỗ trợ</strong>
                  <span>Chấp nhận file .txt hoặc .lrc, lưu vào uploads/lyric/.</span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Trạng thái hiện tại</strong>
                  <span>{lyricSourceState.label}</span>
                </div>
              </div>

              <LyricSourceFileCard
                item={formValues}
                file={lyricFile}
                variant="artist"
                helperText={
                  lyricFile
                    ? "File sẽ được lưu lên Firebase khi nhấn lưu"
                    : "Mở/tải lại dưới dạng UTF-8"
                }
                onError={setError}
              />
            </div>
          </section>
        </div>

        <div className="artist-preview-stack artist-song-editor-preview lg:sticky lg:top-4">
          <section className="artist-detail-panel">
            <p className="artist-detail-panel-title">Xem trước</p>
            <div className="artist-preview-stage is-cover mt-5">
              {coverPreview && (
                <>
                  <div
                    className="artist-preview-backdrop"
                    style={{ backgroundImage: `url(${coverPreview})` }}
                  />
                  <div className="artist-preview-overlay" />
                </>
              )}
              {coverPreview ? (
                <div className="artist-preview-canvas">
                  <OptimizedImage
                    src={coverPreview}
                    alt="Ảnh bìa bài hát"
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="artist-preview-empty">
                  <FiMusic className="text-4xl text-white/45" />
                  <div className="artist-preview-caption">
                    <strong>Chưa có ảnh bìa</strong>
                    <span>Thêm ảnh bìa để hoàn thiện bài hát</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="artist-preview-caption">
                <strong>{formValues.title || "Tên bài hát"}</strong>
                <span>
                  {[
                    formValues.duration
                      ? `Thời lượng: ${formatDuration(formValues.duration)}`
                      : "Chưa có thời lượng",
                    formValues.release_date
                      ? `Phát hành: ${releaseDateDisplay}`
                      : "Chưa có ngày phát hành",
                  ].join(" • ")}
                </span>
              </div>

              <div className="artist-preview-meta-grid">
                <div className="artist-preview-meta-card">
                  <strong>Album</strong>
                  <span>{selectedAlbum?.title || "Phát hành đơn lẻ"}</span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Audio</strong>
                  <span>
                    {audioFile
                      ? "File audio mới từ máy"
                      : formValues.audio_path
                        ? "Đang dùng file audio hiện tại"
                        : "Chưa có nguồn audio"}
                  </span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Lyric source</strong>
                  <span>
                    {lyricFile?.name ||
                      lyricSourceState.label ||
                      "Chưa có lyric source"}
                  </span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Ngày phát hành</strong>
                  <span>{releaseDateDisplay}</span>
                </div>
                <div className="artist-preview-meta-card">
                  <strong>Import lyric</strong>
                  <span>Chỉ admin mới có thể validate và import .lrc vào DB.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="artist-detail-panel">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || uploading}
              className="artist-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {loading || uploading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bài hát"}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
