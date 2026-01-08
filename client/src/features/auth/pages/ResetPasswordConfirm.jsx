import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import { toast } from "react-hot-toast";

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPasswordConfirm, isLoading } = useAuthStore(); 
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!");
    }

    try {
      await resetPasswordConfirm(token, newPassword);
      toast.success("Mật khẩu đã được cập nhật! Đang chuyển hướng...");
      setTimeout(() => navigate("/"), 2000); 
    } catch (error) {
      toast.error(error.response?.data?.detail || "Link đã hết hạn hoặc không hợp lệ.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans">
      <header className="bg-white px-5 py-2.5 border-b border-gray-300 h-20 flex items-center">
        <img src="https://portal.ut.edu.vn/images/logo_full.png" alt="Logo" className="h-full" />
      </header>

      <main className="flex-1 flex items-center justify-center relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://portal.ut.edu.vn/images/1.jpg')" }}>
        <div className="absolute inset-0 bg-teal-400/30"></div>

        <div className="relative z-10 bg-white rounded-[30px] shadow-2xl w-[760px] max-w-[95%] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* LEFT PANEL */}
            <div className="hidden md:flex flex-col items-center justify-center bg-[#e0f2f1] p-8">
              <img src="https://portal.ut.edu.vn/images/logo_full.png" className="w-56 mb-6" alt="Logo" />
              <p className="text-center text-[#2c5f68] font-bold uppercase tracking-wider">
                Thiết lập mật khẩu mới<br />Hệ thống hội nghị UTH
              </p>
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="px-10 py-12 text-center">
              <h1 className="text-[28px] font-medium text-[#2c5f68] mb-1">Cập nhật mật khẩu</h1>
              <h2 className="text-[18px] font-bold uppercase text-[#c62828] mb-8 italic">Bảo mật tài khoản</h2>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#7c99a0] rounded-md outline-none shadow-inner focus:border-[#00796b] focus:ring-2 focus:ring-[#00796b]/30"
                    placeholder="Nhập mật khẩu ít nhất 6 ký tự"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#7c99a0] rounded-md outline-none shadow-inner focus:border-[#00796b] focus:ring-2 focus:ring-[#00796b]/30"
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full py-2.5 bg-[#0e7c7b] text-white text-sm font-bold uppercase rounded-md shadow-md hover:bg-[#0a6362] transition disabled:opacity-50"
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                </button>
              </form>

              {!token && (
                <p className="mt-4 text-red-500 text-xs italic">* Token không tìm thấy. Vui lòng nhấn lại vào link trong email.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordConfirm;