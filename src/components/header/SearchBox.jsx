import { useMemo, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  const defaultKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || params.get("keyword") || "";
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = inputRef.current?.value || "";
    const trimmed = value.trim();
    if (!trimmed) return;

    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-md"
      key={defaultKeyword}
    >
      <FiSearch
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/80"
        size={18}
      />
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultKeyword}
        placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
        className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] outline-none ring-0 transition focus:border-cyan-300/70 focus:bg-white/10"
      />
    </form>
  );
}