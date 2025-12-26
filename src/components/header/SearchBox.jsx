import { FiSearch } from "react-icons/fi";

export default function SearchBox() {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/80"
        size={18}
      />
      <input
        type="text"
        placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
        className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] outline-none ring-0 transition focus:border-cyan-300/70 focus:bg-white/10"
      />
    </div>
  );
}