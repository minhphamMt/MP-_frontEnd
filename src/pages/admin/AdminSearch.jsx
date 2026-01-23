import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { searchAdmin } from "../../api/admin.api";
import { resolveAssetUrl } from "../../utils/asset";

const SEARCH_TABS = [
  "All",
  "Songs",
  "Playlists",
  "Albums",
  "Podcasts & Shows",
  "Artists",
  "Profiles",
];

const getResultImage = (item, type) => {
  if (!item) return "";
  const common =
    item.cover_url ||
    item.cover ||
    item.thumbnail ||
    item.image ||
    item.image_url ||
    item.coverUrl ||
    item.imageUrl;
  if (type === "user" || type === "artist") {
    return (
      item.avatar ||
      item.avatar_url ||
      item.photo ||
      item.photo_url ||
      item.profile_image ||
      item.profile_photo ||
      item.profileImage ||
      item.profilePhoto ||
      common
    );
  }
  return (
    common ||
    item.album_cover ||
    item.albumCover ||
    item.artwork ||
    item.artwork_url
  );
};

export default function AdminSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || params.get("keyword") || "").trim();
  }, [location.search]);

  const normalizedResults = useMemo(() => {
    return results
      .map((item) => {
        let type = item.type || item.entity_type || item.entityType || item.kind;

        if (!type && (item.display_name || item.email)) type = "user";
        if (!type && item.role === "ARTIST") type = "artist";
        if (
          !type &&
          item.title &&
          (item.play_count !== undefined ||
            item.audio_url ||
            item.audio_path ||
            item.duration !== undefined ||
            item.album_id ||
            item.album_title ||
            item.weekly_play_count !== undefined)
        )
          type = "song";
        if (
          !type &&
          item.title &&
          (item.release_date ||
            item.zing_album_id ||
            item.artist_name ||
            item.artist_id)
        )
          type = "album";
        if (!type && item.name) type = "artist";

        const normalizedType = (type || "").toLowerCase();
        if (!["artist", "song", "album", "user"].includes(normalizedType)) {
          return null;
        }

        return {
          ...item,
          type: normalizedType,
          displayLabel:
            item.display_name || item.title || item.name || item.email,
          secondaryLabel:
            item.artist_name || item.email || item.role || item.album_title,
          imageUrl: getResultImage(item, normalizedType),
        };
      })
      .filter(Boolean);
  }, [results]);

  const groupedResults = useMemo(() => {
    const groups = {
      songs: [],
      artists: [],
      albums: [],
      users: [],
    };

    normalizedResults.forEach((item) => {
      if (item.type === "song") groups.songs.push(item);
      if (item.type === "artist") groups.artists.push(item);
      if (item.type === "album") groups.albums.push(item);
      if (item.type === "user") groups.users.push(item);
    });

    return groups;
  }, [normalizedResults]);

  const topResult = useMemo(() => {
    if (groupedResults.songs.length) {
      return { ...groupedResults.songs[0], label: "Song" };
    }
    if (groupedResults.artists.length) {
      return { ...groupedResults.artists[0], label: "Artist" };
    }
    if (groupedResults.albums.length) {
      return { ...groupedResults.albums[0], label: "Album" };
    }
    if (groupedResults.users.length) {
      return { ...groupedResults.users[0], label: "Profile" };
    }
    return null;
  }, [groupedResults]);

  const runSearch = async (rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    try {
      setLoading(true);
      const res = await searchAdmin({
        q: trimmed,
        keyword: trimmed,
        page: 1,
        limit: 50,
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      const itemsSource =
        payload.items || payload.results || payload.data || payload;
      const list = Array.isArray(itemsSource)
        ? itemsSource
        : [
            ...(itemsSource?.songs ?? []),
            ...(itemsSource?.artists ?? []),
            ...(itemsSource?.albums ?? []),
            ...(itemsSource?.users ?? []),
          ];
      setResults(list);
      setErrorMessage("");
    } catch (error) {
      console.error("Search admin failed", error);
      setErrorMessage("Không thể tìm kiếm dữ liệu.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query) return;
    setKeyword(query);
     }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (!debouncedKeyword) {
      setResults([]);
      setErrorMessage("");
      return;
    }
    runSearch(debouncedKeyword);
    if (debouncedKeyword !== query) {
      navigate(`/admin/search?q=${encodeURIComponent(debouncedKeyword)}`, {
        replace: true,
      });
    }
  }, [debouncedKeyword, navigate, query]);

  const handleSubmit = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/admin/search?q=${encodeURIComponent(trimmed)}`);
    runSearch(trimmed);
  };

  const handleResultClick = (item) => {
    if (!item) return;
    const label =
      item.display_name || item.displayLabel || item.name || item.title || "";
    const targetId =
      item.id ??
      item._id ??
      item.song_id ??
      item.songId ??
      item.album_id ??
      item.albumId ??
      item.user_id ??
      item.userId ??
      "";
    const encodedLabel = encodeURIComponent(label);
    if (item.type === "artist") {
      if (targetId) {
        navigate(`/admin/artists/${targetId}/edit`);
        return;
      }
      navigate(`/admin/artists?keyword=${encodedLabel}`);
      return;
    }
    if (item.type === "album") {
      navigate(
        `/admin/albums?keyword=${encodedLabel}${
          targetId ? `&targetId=${targetId}` : ""
        }`
      );
      return;
    }
    if (item.type === "song") {
      navigate(
         `/admin/songs?keyword=${encodedLabel}${
          targetId ? `&targetId=${targetId}` : ""
        }`
      );
      return;
    }
    if (item.type === "user") {
      if (targetId) {
        navigate(`/admin/users/${targetId}/edit`);
        return;
      }
      navigate(`/admin/users?keyword=${encodedLabel}`);
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 pb-12 sm:px-8">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Tìm kiếm quản trị
          </h1>
          <p className="text-sm text-white/60">
            {loading
              ? "Đang tải dữ liệu..."
              : "Khám phá bài hát, nghệ sĩ, album và người dùng phù hợp nhất."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
              placeholder="Nhập từ khoá tìm kiếm..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
            />
            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
            >
              <FiSearch /> Tìm kiếm
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SEARCH_TABS.map((tab) => {
            const isActive = tab === "All";
            return (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-[#2a2a2a] text-white/80 hover:bg-[#333]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      {!!debouncedKeyword &&
        !loading &&
        !groupedResults.songs.length &&
        !groupedResults.artists.length &&
        !groupedResults.albums.length &&
        !groupedResults.users.length && (
          <div className="rounded-2xl border border-white/5 bg-[#181818] p-6 text-white/70">
            Không tìm thấy kết quả phù hợp.
          </div>
        )}
        {(groupedResults.songs.length ||
        groupedResults.artists.length ||
        groupedResults.albums.length ||
        groupedResults.users.length) && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Top result</h2>
            <div className="rounded-2xl border border-white/5 bg-[#181818] p-5 transition hover:bg-[#202020]">
              {topResult ? (
                <button
                  type="button"
                  onClick={() => handleResultClick(topResult)}
                  className="w-full text-left"
                >
                  <div className="space-y-4">
                    {topResult.imageUrl ? (
                      <img
                        src={resolveAssetUrl(topResult.imageUrl)}
                        alt={topResult.displayLabel}
                        className={`h-28 w-28 object-cover ${
                          topResult.type === "artist" || topResult.type === "user"
                            ? "rounded-full"
                            : "rounded-lg"
                        }`}
                      />
                    ) : (
                      <div
                        className={`flex h-28 w-28 items-center justify-center bg-[#2a2a2a] text-xs text-white/60 ${
                          topResult.type === "artist" || topResult.type === "user"
                            ? "rounded-full"
                            : "rounded-lg"
                        }`}
                      >
                        No image
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {topResult.displayLabel}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                        <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                          {topResult.label}
                        </span>
                        <span className="truncate">
                          {topResult.secondaryLabel ||
                            topResult.alias ||
                            topResult.id ||
                            topResult._id}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="text-sm text-white/60">
                  Chưa có kết quả để hiển thị.
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Songs</h2>
            <div className="rounded-2xl border border-white/5 bg-[#181818] p-3">
              {groupedResults.songs.length ? (
                <div className="space-y-1">
                  {groupedResults.songs.slice(0, 5).map((song) => (
                    <button
                      key={song.id || song._id}
                      type="button"
                      onClick={() => handleResultClick(song)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
                    >
                      {song.imageUrl ? (
                        <img
                          src={resolveAssetUrl(song.imageUrl)}
                          alt={song.displayLabel}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a2a2a] text-[10px] text-white/60">
                          No image
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {song.displayLabel}
                        </p>
                        <p className="text-xs text-white/60">
                          {song.secondaryLabel || "Không có thông tin nghệ sĩ"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-white/60">
                  Chưa có bài hát phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!!groupedResults.artists.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Artists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {groupedResults.artists.map((artist) => (
              <button
                key={artist.id || artist._id}
                type="button"
                onClick={() => handleResultClick(artist)}
                className="rounded-2xl border border-white/5 bg-[#181818] p-4 text-left transition hover:bg-[#202020]"
              >
                 <div className="space-y-3">
                  {artist.imageUrl ? (
                    <img
                      src={resolveAssetUrl(artist.imageUrl)}
                      alt={artist.displayLabel}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2a2a2a] text-xs text-white/60">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {artist.displayLabel}
                    </p>
                    <p className="text-xs text-white/60">
                      {artist.secondaryLabel || "Nghệ sĩ"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!!groupedResults.albums.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Albums</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {groupedResults.albums.map((album) => (
              <button
                key={album.id || album._id}
                type="button"
                onClick={() => handleResultClick(album)}
                className="rounded-2xl border border-white/5 bg-[#181818] p-4 text-left transition hover:bg-[#202020]"
              >
                <div className="space-y-3">
                  {album.imageUrl ? (
                    <img
                      src={resolveAssetUrl(album.imageUrl)}
                      alt={album.displayLabel}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[#2a2a2a] text-xs text-white/60">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {album.displayLabel}
                    </p>
                    <p className="text-xs text-white/60">
                      {album.secondaryLabel || "Album"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!!groupedResults.users.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Users</h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {groupedResults.users.map((user) => (
              <button
                key={user.id || user._id}
                type="button"
                onClick={() => handleResultClick(user)}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#181818] px-4 py-3 text-left transition hover:bg-[#202020]"
              >
                {user.imageUrl ? (
                  <img
                    src={resolveAssetUrl(user.imageUrl)}
                    alt={user.displayLabel}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] text-xs text-white/60">
                    No image
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.displayLabel}
                  </p>
                  <p className="text-xs text-white/60">
                    {user.secondaryLabel ||
                      user.alias ||
                      user.id ||
                      user._id}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}