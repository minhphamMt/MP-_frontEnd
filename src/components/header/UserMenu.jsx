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
  const resolveAvatarUrl = (url) => resolveAssetUrl(url);

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
    navigate("/me");
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
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
      >
        Đăng nhập
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/20"
        aria-label="Mở hồ sơ cá nhân"
        title={displayName}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {user?.avatar_url ? (
          <OptimizedImage
            src={resolveAvatarUrl(user.avatar_url)}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#2b2433] text-sm text-white shadow-lg"
          role="menu"
        >
          <button
            type="button"
            onClick={handleNavigateProfile}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/10"
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
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-200 transition hover:bg-white/10"
            role="menuitem"
          >
            <FiLogOut className="text-red-200" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
