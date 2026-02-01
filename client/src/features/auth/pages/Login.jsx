import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users
} from "lucide-react";
import Header from "../../../components/Header";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login({
        email: email.trim(),
        password: password
      });

      if (user) {
        const role = user.role_names?.[0];

        // Điều hướng dựa trên role
        if (role === "ADMIN") {
          navigate("/admin/conferences");
        } else if (role === "CHAIR") {
          navigate("/chair/submissions");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        (language === 'VI' ? "Sai tài khoản hoặc mật khẩu" : "Incorrect email or password");
      console.error("Lỗi đăng nhập:", errorMsg);

      // Hiển thị thông báo lỗi đẹp hơn
      const errorContainer = document.getElementById('login-error');
      const errorText = document.getElementById('error-text');
      if (errorContainer && errorText) {
        errorText.textContent = errorMsg;
        errorContainer.classList.remove('hidden');
      }
    }
  };

  const handleDemoLogin = (role) => {
    // Demo accounts for testing
    const demoAccounts = {
      AUTHOR: { email: "author@demo.uth.edu.vn", password: "demo123" },
      REVIEWER: { email: "reviewer@demo.uth.edu.vn", password: "demo123" },
      CHAIR: { email: "chair@demo.uth.edu.vn", password: "demo123" },
      ADMIN: { email: "admin@demo.uth.edu.vn", password: "demo123" }
    };

    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].password);
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth endpoint
    // We use window.location.href because it's an external redirect
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/sso/google/login`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A365D]/5 via-white to-[#2C7A7B]/5">
      <Header />

      <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A365D' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Info & Demo */}
            <div className="space-y-8">
              {/* Language Toggle */}
              <div className="flex justify-end">
                <button
                  onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-[#2C7A7B] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">{language}</span>
                </button>
              </div>

              {/* Welcome Section */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1A365D] to-[#2C7A7B] flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {language === 'VI' ? 'Hệ thống UTH-ConfMS' : 'UTH-ConfMS System'}
                    </h1>
                    <p className="text-gray-600">
                      {language === 'VI'
                        ? 'Hệ thống quản lý hội nghị nghiên cứu khoa học'
                        : 'Scientific Conference Management System'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#2C7A7B]" />
                    <span className="text-gray-700">
                      {language === 'VI' ? 'Quản lý bài báo học thuật' : 'Academic paper management'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#2C7A7B]" />
                    <span className="text-gray-700">
                      {language === 'VI' ? 'Phản biện mù đôi với AI hỗ trợ' : 'Double-blind review with AI assistance'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#2C7A7B]" />
                    <span className="text-gray-700">
                      {language === 'VI' ? 'Quy trình hội nghị từ A-Z' : 'End-to-end conference workflow'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Accounts */}
              <div className="bg-gradient-to-br from-[#F7FAFC] to-gray-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2C7A7B]" />
                  {language === 'VI' ? 'Tài khoản Demo' : 'Demo Accounts'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'VI'
                    ? 'Thử nghiệm hệ thống với các vai trò khác nhau:'
                    : 'Test the system with different roles:'
                  }
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { role: 'AUTHOR', label: language === 'VI' ? 'Tác giả' : 'Author', color: 'bg-blue-100 text-blue-700' },
                    { role: 'REVIEWER', label: language === 'VI' ? 'Phản biện' : 'Reviewer', color: 'bg-green-100 text-green-700' },
                    { role: 'CHAIR', label: language === 'VI' ? 'Chủ tịch' : 'Chair', color: 'bg-purple-100 text-purple-700' },
                    { role: 'ADMIN', label: language === 'VI' ? 'Quản trị' : 'Admin', color: 'bg-red-100 text-red-700' }
                  ].map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleDemoLogin(item.role)}
                      className={`px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity ${item.color}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  ⚠️ {language === 'VI' ? 'Dữ liệu demo, không lưu thay đổi' : 'Demo data, changes not saved'}
                </p>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {language === 'VI' ? 'Đăng nhập hệ thống' : 'System Login'}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {language === 'VI' ? 'Truy cập vào UTH-ConfMS' : 'Access UTH-ConfMS'}
                        </p>
                      </div>
                    </div>
                    <div className="w-16">
                      <img
                        src="https://portal.ut.edu.vn/images/logo_full.png"
                        className="w-full opacity-90"
                        alt="UTH Logo"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">
                        {language === 'VI' ? 'Hội nghị Nghiên cứu Khoa học' : 'Scientific Research Conference'}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-white/30" />
                    <div className="text-sm">
                      UTH-ConfMS v1.0
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                <div id="login-error" className="hidden bg-red-50 border-l-4 border-red-500 p-4 mx-8 mt-6 rounded-r">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 text-sm font-medium" id="error-text"></span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4" />
                      {language === 'VI' ? 'Email đăng nhập' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B] transition-all"
                        placeholder={language === 'VI' ? "nguyenvana@uth.edu.vn" : "your.email@uth.edu.vn"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Key className="w-4 h-4" />
                      {language === 'VI' ? 'Mật khẩu' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B] transition-all"
                        placeholder={language === 'VI' ? "••••••••" : "••••••••"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#2C7A7B] rounded focus:ring-[#2C7A7B]"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' ? 'Ghi nhớ đăng nhập' : 'Remember me'}
                      </span>
                    </label>
                    <Link
                      to="/forgotpassword"
                      className="text-sm text-[#2C7A7B] hover:text-[#1A365D] hover:underline font-medium"
                    >
                      {language === 'VI' ? 'Quên mật khẩu?' : 'Forgot password?'}
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg hover:shadow-[#2C7A7B]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {language === 'VI' ? 'Đang xác thực...' : 'Authenticating...'}
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        {language === 'VI' ? 'Đăng nhập hệ thống' : 'Login to System'}
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        {language === 'VI' ? 'hoặc' : 'or'}
                      </span>
                    </div>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    {language === 'VI' ? 'Tiếp tục với Google' : 'Continue with Google'}
                  </button>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      {language === 'VI' ? 'Chưa có tài khoản?' : "Don't have an account?"}
                    </p>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#2C7A7B] text-[#2C7A7B] rounded-lg font-bold hover:bg-[#2C7A7B] hover:text-white transition-all duration-300"
                    >
                      <UserPlus className="w-5 h-5" />
                      {language === 'VI' ? 'Đăng ký tài khoản mới' : 'Register New Account'}
                    </Link>
                  </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {language === 'VI'
                        ? 'Hệ thống chỉ dành cho thành viên UTH và cộng tác viên'
                        : 'System for UTH members and collaborators only'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      © 2024 UTH University • {language === 'VI' ? 'Bảo mật nghiêm ngặt' : 'Strict Security'} • SSL/TLS Encrypted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Thêm icon Globe nếu chưa import
const Globe = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default Login;