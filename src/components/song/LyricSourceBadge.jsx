import { getLyricSourceState } from "../../utils/lyrics";

export default function LyricSourceBadge({
  item,
  variant = "admin",
  label = "short",
  className = "",
}) {
  const state = getLyricSourceState(item);
  const baseClassName = variant === "artist" ? "artist-lyrics-chip" : "admin-lyrics-chip";
  const text = label === "full" ? state.label : state.shortLabel;

  return (
    <span
      className={`${baseClassName} is-${state.tone} ${className}`.trim()}
      title={state.label}
    >
      {text}
    </span>
  );
}
