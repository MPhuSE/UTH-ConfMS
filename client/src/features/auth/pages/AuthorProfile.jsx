import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Edit2,
  Save,
  X,
  Globe,
  Phone,
  Building,
} from "lucide-react";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function AuthorProfile() {
  const {
    user,
    checkAuth,
    isCheckingAuth,
    updateProfile,
  } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    affiliation: "",
    phone_number: "",
    website_url: "",
  });

  
  useEffect(() => {
    checkAuth();
  }, []);

  // Sync user → form
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        affiliation: user.affiliation || "",
        phone_number: user.phone_number || "",
        website_url: user.website_url || "",
      });
    }
  }, [user]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600 font-medium animate-pulse">
        Đang xác thực thông tin...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <p className="mb-4">Vui lòng đăng nhập để xem thông tin</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg"
        >
          Đến trang đăng nhập
        </button>
      </div>
    );
  }

  // Save profile
  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      alert("Họ và tên không được để trống");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(formData);
      console.log("Cập nhật thanh cong");
      setEditMode(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert(err.response?.data?.detail || "Không thể cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

 
  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || "",
      affiliation: user.affiliation || "",
      phone_number: user.phone_number || "",
      website_url: user.website_url || "",
    });
    setEditMode(false);
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.full_name
  )}&background=0D9488&color=fff&size=200`;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-32 h-32 rounded-full border-4 border-teal-50 shadow-sm mx-auto object-cover"
          />
          {user.is_verified && (
            <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
              <Shield size={14} fill="currentColor" />
            </div>
          )}
        </div>

        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {user.full_name}
        </h2>

        <div className="flex justify-center gap-2 mt-1">
          {user.role_names?.map((role) => (
            <span
              key={role}
              className="px-3 py-0.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full uppercase tracking-wider"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
        {!editMode ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info icon={User} label="Họ và tên" value={user.full_name} />
              <Info icon={Mail} label="Email hệ thống" value={user.email} />
              <Info
                icon={Building}
                label="Cơ quan/Trường"
                value={user.affiliation || "Chưa cập nhật"}
              />
              <Info
                icon={Phone}
                label="Số điện thoại"
                value={user.phone_number || "Chưa cập nhật"}
              />
              <Info
                icon={Globe}
                label="Website"
                value={user.website_url || "Chưa cập nhật"}
              />
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold"
            >
              <Edit2 size={18} /> Chỉnh sửa hồ sơ
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <InputGroup
              label="Họ và tên"
              value={formData.full_name}
              onChange={(v) =>
                setFormData({ ...formData, full_name: v })
              }
            />
            <InputGroup
              label="Cơ quan / Đơn vị"
              value={formData.affiliation}
              onChange={(v) =>
                setFormData({ ...formData, affiliation: v })
              }
            />
            <InputGroup
              label="Số điện thoại"
              value={formData.phone_number}
              onChange={(v) =>
                setFormData({ ...formData, phone_number: v })
              }
            />
            <InputGroup
              label="Website cá nhân"
              value={formData.website_url}
              onChange={(v) =>
                setFormData({ ...formData, website_url: v })
              }
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>

              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <X size={18} /> Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="text-teal-600" size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase">{label}</p>
        <p className="text-gray-800 font-semibold">{value}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
      />
    </div>
  );
}
