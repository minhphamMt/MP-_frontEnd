import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtistFollowSection from "../components/playlists/ArtistFollowSection";
import useAuthStore from "../store/auth.store";
import useArtistFollowStore from "../store/artist-follow.store";

export default function FollowedArtists() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const followedArtists = useArtistFollowStore((s) => s.followedArtists);
  const loadFollowedArtists = useArtistFollowStore(
    (s) => s.loadFollowedArtists
  );
  const clearFollowedArtists = useArtistFollowStore(
    (s) => s.clearFollowedArtists
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadArtists = async () => {
      if (!user?.id) {
        clearFollowedArtists();
        if (active) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await loadFollowedArtists();
      } finally {
        if (active) setLoading(false);
      }
    };

    loadArtists();

    return () => {
      active = false;
    };
  }, [clearFollowedArtists, loadFollowedArtists, user?.id]);

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thư viện
            </p>
           <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Nghệ sĩ theo dõi
            </h1>
            <p className="text-sm text-white/60">
              {followedArtists.length} nghệ sĩ đã theo dõi
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/playlists")}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            ← Quay lại thư viện
          </button>
        </div>
      </div>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur">
            Đang tải nghệ sĩ theo dõi...
          </div>
        ) : (
          <ArtistFollowSection artists={followedArtists} />
        )}
      </section>
    </div>
  );
}