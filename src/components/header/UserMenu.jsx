import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiLogOut, FiUser } from "react-icons/fi";
import useAuthStore from "../../store/auth.store";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.display_name || user?.email || "User";
  const profilePath = "/me";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleNavigateProfile = () => {
    setIsOpen(false);
    navigate(profilePath);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="user-btn-secondary px-4 py-2 text-sm font-semibold"
      >
        Đăng nhập
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#1a1a1a] text-sm font-semibold text-white/85 transition md:hover:border-white/30 md:hover:bg-[#242424]"
        aria-label="Mở hồ sơ"
        title={displayName}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {user?.avatar_url ? (
          <OptimizedImage
            src={resolveAssetUrl(user.avatar_url)}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/15 bg-[#121212] p-1.5 text-sm text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          role="menu"
        >
          <button
            type="button"
            onClick={handleNavigateProfile}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition md:hover:bg-white/[0.08]"
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <FiUser className="text-white/70" />
              Trang cá nhân
            </span>
            <FiChevronRight className="text-white/60" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-rose-100 transition md:hover:bg-rose-500/18"
            role="menuitem"
          >
            <FiLogOut className="text-rose-200" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
