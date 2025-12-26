export default function SidebarSection({ title, children }) {
  return (
    <div className="mb-6 space-y-2">
      {title && (
        <div className="px-3 text-[11px] uppercase tracking-[0.2em] text-white/50">
          {title}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}