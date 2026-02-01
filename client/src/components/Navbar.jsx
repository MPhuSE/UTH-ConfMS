import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Shield } from "lucide-react";
import { useAuthStore } from "../app/store/useAuthStore";
import { Link } from "react-router-dom";
import { tenantService } from "../services/tenantService";

export default function Navbar() {
  const { user, logout, tenantSlug, setTenantSlug } = useAuthStore();
  const [openMenu, setOpenMenu] = useState(false);
  const [myTenants, setMyTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (user) {
      loadMyTenants();
    }
  }, [user]);

  const loadMyTenants = async () => {
    try {
      setLoadingTenants(true);
      const data = await tenantService.getMyMemberships();
      setMyTenants(data.tenants || []);

      // Mặc định chọn tenant đầu tiên nếu chưa chọn cái nào
      if (!tenantSlug && data.tenants?.length > 0) {
        setTenantSlug(data.tenants[0].slug);
      }
    } catch (error) {
      console.error("Error loading tenants:", error);
    } finally {
      setLoadingTenants(false);
    }
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.full_name || "User"
  )}&background=0D9488&color=fff&size=32`;

  const activeTenant = myTenants.find(t => t.slug === tenantSlug);

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
    <div className="flex justify-between items-center bg-white shadow px-6 py-3 sticky top-0 z-[100]">
      <div className="font-extrabold text-2xl tracking-tight text-teal-700">UTH-ConfMS</div>

      <div className="flex items-center gap-4">
        {/* Tenant Switcher */}
        {myTenants.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold border border-teal-100 hover:bg-teal-100 transition-all cursor-pointer shadow-sm group">
              <Building2 className="w-4 h-4 text-teal-600" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase text-teal-500 font-bold opacity-70">Cơ sở / Đơn vị</span>
                <select
                  className="bg-transparent focus:outline-none appearance-none pr-6 cursor-pointer text-teal-900"
                  value={tenantSlug || ""}
                  onChange={(e) => setTenantSlug(e.target.value)}
                >
                  {myTenants.map(t => (
                    <option key={t.id} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>
              <ChevronDown className="w-4 h-4 text-teal-400 group-hover:text-teal-600 transition-colors absolute right-2" />
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-2 rounded-full focus:outline-none hover:ring-4 hover:ring-teal-50 transition-all p-0.5"
          >
            <div className="relative">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover"
              />
              {user?.is_verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                  <Shield className="text-blue-500 w-3 h-3" fill="currentColor" />
                </div>
              )}
            </div>
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-1 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                onClick={() => setOpenMenu(false)}
              >
                Xem hồ sơ
              </Link>
              <Link
                to="/dashboard/change-password"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                onClick={() => setOpenMenu(false)}
              >
                Đổi mật khẩu
              </Link>
              <div className="h-px bg-gray-50 my-1 mx-2" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
