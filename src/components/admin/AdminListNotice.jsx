export default function AdminListNotice({ message }) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
      {message}
    </div>
  );
}
