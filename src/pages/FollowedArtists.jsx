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
    <div className="user-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50 sm:text-[11px]">
            Thư viện
          </p>

            <h1 className="text-xl font-semibold text-white sm:text-3xl">
            Nghệ sĩ theo dõi
          </h1>

            <p className="mt-1 text-xs text-white/60 sm:text-sm">
            {followedArtists.length} nghệ sĩ đã theo dõi
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/playlists")}
          className="user-btn-secondary self-start px-4 py-2 text-xs font-semibold sm:self-auto sm:text-sm"
        >
          ← Quay lại thư viện
        </button>
      </header>

      <section className="space-y-4">
        {loading ? (
          <div className="user-surface p-6 text-sm text-white/60">
            Đang tải nghệ sĩ theo dõi...
          </div>
        ) : followedArtists.length ? (
          <ArtistFollowSection
            artists={followedArtists}
            cardVariant="library"
           gridClassName="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          />
        ) : (
          <div className="user-surface p-6 text-center text-sm text-white/60">
            Bạn chưa theo dõi nghệ sĩ nào.
            <br />
            Hãy khám phá và theo dõi nghệ sĩ bạn yêu thích 🎧
          </div>
        )}
      </section>
    </div>
  );
}
