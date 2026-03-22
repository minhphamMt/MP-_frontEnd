export default function SidebarSection({
  title,
  children,
  collapsed = false,
  tone = "default",
}) {
  const isArtistTone = tone === "artist";

  return (
    <div className={collapsed ? "mb-5 space-y-2" : "mb-6 space-y-3"}>
      {title ? (
        collapsed ? (
          <div className={`mx-auto h-px w-8 ${isArtistTone ? "bg-sky-200/[0.16]" : "bg-white/10"}`} />
        ) : (
          <div className="px-2">
            <div
              className={`text-[11px] uppercase tracking-[0.24em] ${
                isArtistTone ? "text-slate-300/48" : "text-white/45"
              }`}
            >
              {title}
            </div>
          </div>
        )
      ) : null}
      <div className={collapsed ? "space-y-2" : "space-y-1"}>{children}</div>
    </div>
  );
}
