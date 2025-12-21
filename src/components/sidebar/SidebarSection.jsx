export default function SidebarSection({ title, children }) {
  return (
    <div className="mb-6">
      {title && (
        <div className="px-3 mb-2 text-xs uppercase text-white/50">
          {title}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
