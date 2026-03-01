import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";
import useAuthStore from "../../store/auth.store";

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const showSearch = user?.role !== "ARTIST" && user?.role !== "ADMIN";

  return (
    <header
      className="
        relative z-40 flex h-16 items-center gap-3 sm:gap-4
        border-b border-white/10
        bg-[#121212]
        px-4 sm:px-6
      "
    >

      {/* LEFT ACTIONS */}
      <div className="relative flex items-center gap-2">
                <button
          onClick={onMenuClick}
          className="
            group flex h-9 w-9 items-center justify-center rounded-full
            border border-white/10
            bg-white/5
            text-white/80
            transition-all duration-200
            md:hover:border-white/30
            md:hover:bg-white/10
            md:hover:text-white
            active:scale-95
            md:hidden
          "
          title="Mở menu"
          aria-label="Mở menu"
        >
          <FiMenu />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="
            group hidden h-9 w-9 items-center justify-center rounded-full
            border border-white/10
            bg-white/5
            text-white/80
            transition-all duration-200
            md:hover:border-white/30
            md:hover:bg-white/10
            md:hover:text-white
            active:scale-95
            sm:flex
          "
          title="Quay lại"
        >
          <FiChevronLeft className="transition-transform md:group-hover:-translate-x-0.5" />
        </button>

        <button
          onClick={() => navigate(1)}
          className="
            group hidden h-9 w-9 items-center justify-center rounded-full
            border border-white/10
            bg-white/5
            text-white/80
            transition-all duration-200
            md:hover:border-white/30
            md:hover:bg-white/10
            md:hover:text-white
            active:scale-95
            sm:flex
          "
          title="Tiến tới"
        >
          <FiChevronRight className="transition-transform md:group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* SEARCH */}
      {showSearch && (
        <div className="relative ml-2 flex-1 max-w-full sm:ml-4 sm:max-w-xl">
          <SearchBox />
        </div>
      )}

      {/* USER */}
      <div className="relative ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
