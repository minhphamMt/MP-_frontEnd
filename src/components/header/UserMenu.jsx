import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiLogOut } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const displayName = user?.display_name || user?.email || "User";
  return (
    <div className="relative">
      {/* Avatar */}
       <button
        type="button"
        onClick={() => navigate("/me")}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/20"
        aria-label="Mở hồ sơ cá nhân"
        title={displayName}
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {/* Dropdown (UI giả) */}
      <div className="absolute right-0 mt-2 w-40 bg-[#2f2739]
                      rounded shadow-lg text-sm hidden">
        <button
                  type="button"
          onClick={() => navigate("/me")}
          className="w-full flex items-center justify-between gap-2 px-3 py-2
                     hover:bg-[#393243]"
        >
          Hồ sơ
          <FiChevronRight />
        </button>
        <button
          type="button"
          onClick={() => navigate("/me")}
          className="w-full flex items-center justify-between gap-2 px-3 py-2
                     hover:bg-[#393243]"
        >
          Hồ sơ
          <FiChevronRight />
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2
                     hover:bg-[#393243]"
        >
          <FiLogOut />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
