import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtistFollowSection from "../components/playlists/ArtistFollowSection";
import useAuthStore from "../store/auth.store";
import useArtistFollowStore from "../store/artist-follow.store";

export default function FollowedArtists() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const {
    followedArtists,
    loadFollowedArtists,
    clearFollowedArtists,
  } = useArtistFollowStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchArtists = async () => {
      if (!user?.id) {
        clearFollowedArtists();
        if (mounted) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await loadFollowedArtists();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchArtists();

    return () => {
      mounted = false;
    };
  }, [user?.id, loadFollowedArtists, clearFollowedArtists]);

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e]
        px-4 py-6 sm:px-8
        space-y-6 sm:space-y-8
      "
    >
      {/* HEADER – GIỮ NGUYÊN */}
      <header
        className="
          rounded-3xl border border-white/10
          bg-white/5 backdrop-blur-xl
          p-5 sm:p-6
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        "
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thư viện
            </p>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white">
              Nghệ sĩ theo dõi
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-white/60">
              {followedArtists.length} nghệ sĩ đã theo dõi
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/playlists")}
            className="
              self-start sm:self-auto
              rounded-full border border-white/20
              px-4 py-2
              text-xs sm:text-sm font-semibold
              text-white/80
              transition
              hover:border-white/40 hover:text-white
              active:scale-95
            "
          >
            ← Quay lại thư viện
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section>
        {loading ? (
          <div
            className="
              rounded-2xl border border-white/10
              bg-white/5 backdrop-blur
              p-6
              text-sm text-white/60
              animate-pulse
            "
          >
            Đang tải nghệ sĩ theo dõi...
          </div>
        ) : followedArtists.length ? (
          /**
           * ✅ KHÔNG max-width
           * ✅ KHÔNG căn giữa
           * ✅ Cho grid fill toàn bộ chiều ngang
           * → Giống Spotify / Zing
           */
          <div className="w-full">
            <ArtistFollowSection artists={followedArtists} />
          </div>
        ) : (
          <div
            className="
              rounded-2xl border border-white/10
              bg-white/5 backdrop-blur
              p-6 text-center
              text-sm text-white/60
            "
          >
            Bạn chưa theo dõi nghệ sĩ nào.
            <br />
            Hãy khám phá và theo dõi nghệ sĩ bạn yêu thích 🎧
          </div>
        )}
      </section>
    </div>
  );
}
