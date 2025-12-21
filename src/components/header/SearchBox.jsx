import { FiSearch } from "react-icons/fi";

export default function SearchBox() {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
        size={18}
      />
      <input
        type="text"
        placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
        className="w-full pl-10 pr-4 py-2 rounded-full
                   bg-[#2f2739] text-sm
                   outline-none focus:ring-1 focus:ring-white/20"
      />
    </div>
  );
}
