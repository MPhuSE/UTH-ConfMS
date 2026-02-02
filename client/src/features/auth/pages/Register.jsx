import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Globe,
  Building,
  Phone,
  AlertCircle
} from "lucide-react";
import Header from "../../../components/Header";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('VI');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    institution: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [agreement, setAgreement] = useState(false);

  const { signup, isLoading, isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user) navigate("/dashboard");
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) newErrors.email = language === 'VI' ? 'Email không hợp lệ' : 'Invalid email';
    if (formData.password.length < 8) newErrors.password = language === 'VI' ? 'Mật khẩu phải >= 8 ký tự' : 'Password must be >= 8 chars';
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = language === 'VI' ? 'Mật khẩu không khớp' : 'Passwords mismatch';
    if (!formData.full_name.trim()) newErrors.full_name = language === 'VI' ? 'Vui lòng nhập họ tên' : 'Name required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreement) {
      toast.error(language === 'VI' ? 'Vui lòng đồng ý điều khoản' : 'Please agree to terms');
      return;
    }
    if (!validateForm()) return;

    try {
      await signup({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        institution: formData.institution.trim(),
        phone: formData.phone.trim()
      });
      toast.success(language === 'VI' ? "Đăng ký thành công! Vui lòng kiểm tra email." : "Registration successful! Check your email.");
      navigate("/login");
    } catch (error) {
      console.error("Register Error:", error);
      const msg = error.response?.data?.message || (language === 'VI' ? "Đăng ký thất bại" : "Registration failed");
      toast.error(msg);
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-teal-600 mb-2 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                {language === 'VI' ? 'Quay lại đăng nhập' : 'Back to Login'}
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'VI' ? 'Đăng ký tài khoản' : 'Create Account'}
              </h2>
            </div>
            <button
              onClick={() => setLanguage(l => l === 'VI' ? 'EN' : 'VI')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-teal-500 transition-colors text-sm font-medium text-gray-700"
            >
              <Globe className="w-4 h-4" />
              {language}
            </button>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label={language === 'VI' ? 'Họ và tên' : 'Full Name'}
                icon={User}
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
                required
              />
              <InputField
                label="Email"
                icon={Mail}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <InputField
                label={language === 'VI' ? 'Cơ quan/Tổ chức' : 'Institution'}
                icon={Building}
                name="institution"
                value={formData.institution}
                onChange={handleChange}
              />
              <InputField
                label={language === 'VI' ? 'Số điện thoại' : 'Phone'}
                icon={Phone}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'VI' ? 'Mật khẩu' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-11 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'VI' ? 'Xác nhận mật khẩu' : 'Confirm Password'} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-11 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none ${errors.password_confirmation ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-xs text-red-600 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-lg border border-teal-100">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                id="agreement"
              />
              <label htmlFor="agreement" className="text-sm text-gray-700 cursor-pointer select-none">
                {language === 'VI'
                  ? 'Tôi đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của trướng Đại học Giao thông vận tải Thành phố Hồ Chí Minh.'
                  : 'I agree to the Terms of Service and Privacy Policy of UTH.'}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {language === 'VI' ? 'Đăng ký ngay' : 'Register Now'}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} {props.required && '*'}
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        {...props}
        className={`w-full pl-11 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none ${error ? 'border-red-300' : 'border-gray-300'}`}
      />
    </div>
    {error && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
  </div>
);

export default RegisterPage;