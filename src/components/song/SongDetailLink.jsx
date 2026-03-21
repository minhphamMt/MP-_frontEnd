import { FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getSongPath } from "../../utils/entityPath";
import { stripUnderlineClasses } from "../../utils/linkClass";

export function SongDetailLink({
  song,
  className = "",
  children,
  title,
  stopPropagation = true,
  onNavigate,
}) {
  const path = getSongPath(song);
  const cleanedClassName = stripUnderlineClasses(className);

  if (!path) {
    return <span className={cleanedClassName}>{children}</span>;
  }

  return (
    <Link
      to={path}
      title={title || "Xem thông tin bài hát"}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        onNavigate?.(event);
      }}
      className={[
        "block min-w-0 no-underline hover:no-underline focus:no-underline",
        cleanedClassName,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function SongDetailIconButton({
  song,
  className = "",
  title = "Xem thông tin bài hát",
  onNavigate,
}) {
  const path = getSongPath(song);

  if (!path) return null;

  return (
    <Link
      to={path}
      title={title}
      aria-label={title}
      onClick={(event) => {
        event.stopPropagation();
        onNavigate?.(event);
      }}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/65 transition md:hover:bg-white/[0.1] md:hover:text-white",
        className,
      ].join(" ")}
    >
      <FiExternalLink className="text-[14px]" />
    </Link>
  );
}
