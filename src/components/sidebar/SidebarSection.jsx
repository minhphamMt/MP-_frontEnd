export default function SidebarSection({ title, children }) {
  return (
    <div className="mb-6 space-y-3">
      {title && (
        <div className="px-2">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">{title}</div>
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
