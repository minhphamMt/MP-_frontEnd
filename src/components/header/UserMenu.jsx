import { FiLogOut } from "react-icons/fi";

export default function UserMenu() {
  return (
    <div className="relative">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-400 cursor-pointer" />

      {/* Dropdown (UI giả) */}
      <div className="absolute right-0 mt-2 w-40 bg-[#2f2739]
                      rounded shadow-lg text-sm hidden">
        <button
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
