import { useEffect } from "react";
import useAuthStore from "../../store/auth.store";
import useArtistFollowStore from "../../store/artist-follow.store";
import { emitAuthRequired } from "../../utils/authPrompt";

export default function FollowArtistButton({
  artist,
  className = "",
  size = "md",
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ensureLoaded = useArtistFollowStore((s) => s.ensureLoaded);
  const toggleFollow = useArtistFollowStore((s) => s.toggleFollow);
  const pendingIds = useArtistFollowStore((s) => s.pendingIds);
 const followedArtistIds = useArtistFollowStore((s) => s.followedArtistIds);

  useEffect(() => {
    if (isAuthenticated) {
      ensureLoaded();
    }
  }, [ensureLoaded, isAuthenticated]);

  const artistId =
    artist?.id ?? artist?.artist_id ?? artist?.artistId ?? artist?.artist?.id;
  const normalizedId =
    artistId === undefined || artistId === null ? null : String(artistId);
  const following = normalizedId
    ? followedArtistIds.includes(normalizedId)
    : false;
  const isPending = pendingIds.includes(String(artistId));

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1 text-xs"
      : size === "lg"
        ? "px-6 py-2 text-sm"
        : "px-4 py-1.5 text-sm";

  const baseClasses =
    "rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (!isAuthenticated) {
          emitAuthRequired();
          return;
        }
        toggleFollow(artist);
      }}
      disabled={!artistId || isPending}
      className={`${baseClasses} ${sizeClasses} ${
        following
          ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30"
          : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
      } ${className}`}
    >
      {following ? "Đang theo dõi" : "+ Theo dõi"}
    </button>
  );
}
