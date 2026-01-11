import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  ArrowLeft,
  Shield,
  Globe,
  BookOpen,
  GraduationCap,
  Phone,
  Building
} from "lucide-react";
import Header from "../../../components/Header";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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

  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getStrengthColor = (strength) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength <= 25) return language === 'VI' ? 'Rất yếu' : 'Very Weak';
    if (strength <= 50) return language === 'VI' ? 'Yếu' : 'Weak';
    if (strength <= 75) return language === 'VI' ? 'Khá' : 'Fair';
    return language === 'VI' ? 'Mạnh' : 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.includes('@')) {
      newErrors.email = language === 'VI' ? 'Email không hợp lệ' : 'Invalid email address';
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = language === 'VI' ? 'Mật khẩu phải có ít nhất 8 ký tự' : 'Password must be at least 8 characters';
    }

    // Password confirmation
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = language === 'VI' ? 'Mật khẩu không khớp' : 'Passwords do not match';
    }

    // Agreement
    if (!agreement) {
      newErrors.agreement = language === 'VI' ? 'Vui lòng đồng ý với điều khoản' : 'Please agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signup({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        institution: formData.institution.trim(),
        phone: formData.phone.trim()
      });

      // Success message
      const successMsg = language === 'VI' 
        ? 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
        : 'Registration successful! Please check your email to verify your account.';
      
      alert(successMsg);
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data);
      const serverMessage = error.response?.data?.message || 
        (language === 'VI' ? "Đăng ký thất bại, vui lòng thử lại!" : "Registration failed, please try again!");
      
      // Set server errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(serverMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] to-gray-50">
      <Header />

      <main className="relative min-h-[calc(100vh-64px)] py-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231A365D' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4">
          {/* Language Toggle & Back Button */}
          <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">
                {language === 'VI' ? 'Quay lại đăng nhập' : 'Back to Login'}
              </span>
            </Link>
            
            <button
              onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-[#2C7A7B] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language}</span>
            </button>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Information */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1A365D] to-[#2C7A7B] flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        UTH-ConfMS
                      </h2>
                      <p className="text-gray-600">
                        {language === 'VI' 
                          ? 'Hệ thống quản lý hội nghị nghiên cứu khoa học'
                          : 'Scientific Conference Management System'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">
                      {language === 'VI' ? 'Lợi ích khi đăng ký' : 'Benefits of Registration'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          {language === 'VI' ? 'Nộp bài báo đến các hội nghị' : 'Submit papers to conferences'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          {language === 'VI' ? 'Theo dõi tiến trình phản biện' : 'Track review progress'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          {language === 'VI' ? 'Nhận thông báo quan trọng' : 'Receive important notifications'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          {language === 'VI' ? 'Quản lý hồ sơ học thuật' : 'Manage academic profile'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Requirements */}
                <div className="bg-gradient-to-br from-[#F7FAFC] to-gray-50 rounded-2xl border border-gray-200 p-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#2C7A7B]" />
                    {language === 'VI' ? 'Yêu cầu hệ thống' : 'System Requirements'}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-[#2C7A7B] rounded-full" />
                      {language === 'VI' ? 'Email đại học/cơ quan' : 'University/Organization email'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-[#2C7A7B] rounded-full" />
                      {language === 'VI' ? 'Họ tên thật' : 'Real full name'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-[#2C7A7B] rounded-full" />
                      {language === 'VI' ? 'Mật khẩu mạnh (8+ ký tự)' : 'Strong password (8+ characters)'}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Registration Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <UserPlus className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {language === 'VI' ? 'Đăng ký tài khoản mới' : 'Register New Account'}
                          </h2>
                          <p className="text-white/80">
                            {language === 'VI' 
                              ? 'Tham gia hệ thống quản lý hội nghị UTH'
                              : 'Join UTH Conference Management System'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="w-16 opacity-90">
                        <img
                          src="https://portal.ut.edu.vn/images/logo_full.png"
                          className="w-full"
                          alt="UTH Logo"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4" />
                          {language === 'VI' ? 'Họ và tên đầy đủ' : 'Full Name'} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pl-11 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.full_name 
                                ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                            }`}
                            placeholder={language === 'VI' ? "Nguyễn Văn A" : "John Smith"}
                            required
                            disabled={isLoading}
                          />
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        {errors.full_name && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.full_name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4" />
                          Email *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pl-11 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.email 
                                ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                            }`}
                            placeholder={language === 'VI' ? "nguyenvana@uth.edu.vn" : "your.email@uth.edu.vn"}
                            required
                            disabled={isLoading}
                          />
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Institution */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Building className="w-4 h-4" />
                          {language === 'VI' ? 'Cơ quan/Tổ chức' : 'Institution/Organization'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B] transition-all"
                            placeholder={language === 'VI' ? "Đại học UTH" : "UTH University"}
                            disabled={isLoading}
                          />
                          <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4" />
                          {language === 'VI' ? 'Số điện thoại' : 'Phone Number'}
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B] transition-all"
                            placeholder={language === 'VI' ? "+84 123 456 789" : "+1 234 567 8900"}
                            disabled={isLoading}
                          />
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Lock className="w-4 h-4" />
                          {language === 'VI' ? 'Mật khẩu' : 'Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.password 
                                ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                            }`}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {/* Password Strength Meter */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {language === 'VI' ? 'Độ mạnh mật khẩu:' : 'Password strength:'}
                            </span>
                            <span className={`font-medium ${
                              passwordStrength <= 25 ? 'text-red-600' :
                              passwordStrength <= 50 ? 'text-orange-600' :
                              passwordStrength <= 75 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {language === 'VI' 
                              ? 'Yêu cầu: 8+ ký tự, chữ hoa, số, ký tự đặc biệt'
                              : 'Requirements: 8+ chars, uppercase, number, special char'
                            }
                          </p>
                        </div>
                        
                        {errors.password && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Lock className="w-4 h-4" />
                          {language === 'VI' ? 'Xác nhận mật khẩu' : 'Confirm Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.password_confirmation 
                                ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]'
                            }`}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password_confirmation && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.password_confirmation}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreement}
                          onChange={(e) => setAgreement(e.target.checked)}
                          className="w-5 h-5 text-[#2C7A7B] rounded focus:ring-[#2C7A7B] mt-0.5"
                          disabled={isLoading}
                        />
                        <div className="text-sm text-gray-700">
                          <p>
                            {language === 'VI' 
                              ? 'Tôi đồng ý với '
                              : 'I agree to the '
                            }
                            <Link to="/terms" className="text-[#2C7A7B] hover:underline font-medium">
                              {language === 'VI' ? 'Điều khoản dịch vụ' : 'Terms of Service'}
                            </Link>
                            {language === 'VI' 
                              ? ' và '
                              : ' and '
                            }
                            <Link to="/privacy" className="text-[#2C7A7B] hover:underline font-medium">
                              {language === 'VI' ? 'Chính sách bảo mật' : 'Privacy Policy'}
                            </Link>
                            {language === 'VI' 
                              ? ' của UTH-ConfMS.'
                              : ' of UTH-ConfMS.'
                            }
                          </p>
                          {errors.agreement && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {errors.agreement}
                            </p>
                          )}
                        </div>
                      </label>
                      
                      <p className="text-xs text-gray-500">
                        {language === 'VI'
                          ? 'Tài khoản phải được xác thực qua email trước khi sử dụng đầy đủ tính năng.'
                          : 'Account must be verified via email before full feature access.'
                        }
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !agreement}
                      className="w-full py-3.5 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg hover:shadow-[#2C7A7B]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {language === 'VI' ? 'Đang tạo tài khoản...' : 'Creating account...'}
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          {language === 'VI' ? 'Đăng ký tài khoản' : 'Create Account'}
                        </>
                      )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-gray-600">
                        {language === 'VI' ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
                        <Link
                          to="/login"
                          className="text-[#2C7A7B] hover:text-[#1A365D] font-bold hover:underline"
                        >
                          {language === 'VI' ? 'Đăng nhập ngay' : 'Login here'}
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;