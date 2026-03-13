import { Link } from "react-router-dom";
import { getArtistLabel, normalizeArtists } from "../../utils/artist";
import { stripUnderlineClasses } from "../../utils/linkClass";

export default function ArtistNames({
  item,
  artists,
  fallback = "Nghệ sĩ",
  className = "",
  linkClassName = "",
  stopPropagation = false,
  onNavigate,
}) {
  const resolvedArtists = normalizeArtists(artists ?? item);
  const cleanedLinkClassName = stripUnderlineClasses(linkClassName);

  if (!resolvedArtists.length) {
    const label = getArtistLabel(item, fallback);
    return <span className={className}>{label || fallback}</span>;
  }

  return (
    <span className={className}>
      {resolvedArtists.map((artist, index) => {
        const name = artist?.name || fallback;
        const key = artist?.id ? `artist-${artist.id}` : `artist-${index}-${name}`;

        const handleClick = (event) => {
          if (stopPropagation) {
            event.stopPropagation();
          }
          onNavigate?.(event);
        };

        return (
          <span key={key}>
            {artist?.id ? (
              <Link
                to={`/artist/${artist.id}`}
                onClick={handleClick}
                className={[
                  "no-underline hover:no-underline focus:no-underline",
                  cleanedLinkClassName,
                ].join(" ")}
              >
                {name}
              </Link>
            ) : (
              <span>{name}</span>
            )}
            {index < resolvedArtists.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </span>
  );
}
