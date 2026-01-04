import { useState, useRef, useEffect } from "react";
import { Shield } from "lucide-react";
import { useAuthStore } from "../app/store/useAuthStore";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.full_name || "User"
  )}&background=0D9488&color=fff&size=32`;

  // Close menu when click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      <div className="font-bold text-xl text-teal-700">UTH-ConfMS</div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center gap-2 rounded-full focus:outline-none"
        >
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-8 h-8 rounded-full border-2 border-teal-200 object-cover"
          />
          {user?.is_verified && (
            <Shield className="text-blue-500" size={16} fill="currentColor" />
          )}
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <Link
              to="/dashboard/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setOpenMenu(false)}
            >
              Xem profile
            </Link>
            <Link
              to="/dashboard/change-password"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setOpenMenu(false)}
            >
              Đổi mật khẩu
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
