import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import { toast } from "react-hot-toast";
import { 
  Mail, 
  ArrowLeft, 
  Key, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Globe,
  Send,
  Clock,
  Smartphone,
  UserCheck
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  
  // Giả sử useAuthStore có forgotPassword
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSendRequest = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      const errorMsg = language === 'VI' 
        ? "Vui lòng nhập địa chỉ email"
        : "Please enter your email address";
      toast.error(errorMsg);
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      
      const successMsg = language === 'VI'
        ? "Liên kết khôi phục mật khẩu đã được gửi đến email của bạn!"
        : "Password reset link has been sent to your email!";
      toast.success(successMsg);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
        (language === 'VI' 
          ? "Email không tồn tại trong hệ thống" 
          : "Email not found in system");
      toast.error(errorMsg);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] to-gray-50">
      {/* Header với logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://portal.ut.edu.vn/images/logo_full.png"
                alt="UTH Logo"
                className="h-12"
              />
              
            </div>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative min-h-[calc(100vh-80px)]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A365D' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">
                  {language === 'VI' ? 'Quay lại đăng nhập' : 'Back to Login'}
                </span>
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Information */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1A365D] to-[#2C7A7B] flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {language === 'VI' ? 'Bảo mật tài khoản' : 'Account Security'}
                      </h2>
                      <p className="text-sm text-gray-600">
                        UTH-ConfMS
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">
                      {language === 'VI' ? 'Quy trình khôi phục' : 'Recovery Process'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#2C7A7B]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#2C7A7B]">1</span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {language === 'VI' ? 'Nhập email đăng ký' : 'Enter registered email'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#2C7A7B]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#2C7A7B]">2</span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {language === 'VI' ? 'Kiểm tra email nhận liên kết' : 'Check email for reset link'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#2C7A7B]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#2C7A7B]">3</span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {language === 'VI' ? 'Đặt mật khẩu mới' : 'Set new password'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="bg-gradient-to-br from-[#F7FAFC] to-gray-50 rounded-2xl border border-gray-200 p-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#2C7A7B]" />
                    {language === 'VI' ? 'Mẹo bảo mật' : 'Security Tips'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' 
                          ? 'Liên kết có hiệu lực trong 24 giờ'
                          : 'Link valid for 24 hours only'
                        }
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' 
                          ? 'Không chia sẻ email xác nhận'
                          : 'Do not share confirmation emails'
                        }
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' 
                          ? 'Kiểm tra thư mục spam nếu không thấy'
                          : 'Check spam folder if not received'
                        }
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Password Reset Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Key className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {language === 'VI' 
                              ? 'Khôi phục mật khẩu' 
                              : 'Password Recovery'
                            }
                          </h2>
                          <p className="text-white/80">
                            {language === 'VI' 
                              ? 'Nhận liên kết đặt lại mật khẩu qua email'
                              : 'Receive password reset link via email'
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

                  {!isSubmitted ? (
                    /* Password Reset Request Form */
                    <form onSubmit={handleSendRequest} className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <p className="text-sm text-blue-700">
                            {language === 'VI'
                              ? 'Nhập địa chỉ email đã đăng ký để nhận liên kết khôi phục mật khẩu.'
                              : 'Enter your registered email address to receive a password recovery link.'
                            }
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Mail className="w-4 h-4" />
                            {language === 'VI' ? 'Email đăng ký' : 'Registered Email'} *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B] transition-all"
                              placeholder={language === 'VI' ? "nguyenvana@uth.edu.vn" : "your.email@uth.edu.vn"}
                              required
                              disabled={isLoading}
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === 'VI'
                              ? 'Sử dụng email bạn đã đăng ký với hệ thống'
                              : 'Use the email you registered with the system'
                            }
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !email.trim()}
                        className="w-full py-3.5 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg hover:shadow-[#2C7A7B]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {language === 'VI' ? 'Đang xử lý...' : 'Processing...'}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            {language === 'VI' ? 'Gửi liên kết khôi phục' : 'Send Recovery Link'}
                          </>
                        )}
                      </button>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            {language === 'VI'
                              ? 'Liên kết có hiệu lực trong 24 giờ'
                              : 'Link valid for 24 hours'
                            }
                          </span>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Success Message */
                    <div className="p-8">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {language === 'VI' 
                            ? 'Yêu cầu đã được gửi!' 
                            : 'Request Sent!'
                          }
                        </h3>
                        
                        <div className="max-w-md mx-auto space-y-4 mb-8">
                          <p className="text-gray-700">
                            {language === 'VI'
                              ? 'Chúng tôi đã gửi liên kết khôi phục mật khẩu đến:'
                              : 'We have sent a password recovery link to:'
                            }
                          </p>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-center gap-2">
                              <Mail className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{email}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {language === 'VI'
                              ? 'Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.'
                              : 'Please check your inbox and follow the instructions.'
                            }
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                          <button
                            onClick={() => setIsSubmitted(false)}
                            className="px-6 py-3 border-2 border-[#2C7A7B] text-[#2C7A7B] rounded-lg font-bold hover:bg-[#2C7A7B] hover:text-white transition-all"
                          >
                            {language === 'VI' ? 'Gửi lại email' : 'Resend Email'}
                          </button>
                          <button
                            onClick={handleBackToLogin}
                            className="px-6 py-3 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            {language === 'VI' ? 'Quay lại đăng nhập' : 'Back to Login'}
                          </button>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700">
                              <p className="font-medium mb-1">
                                {language === 'VI' ? 'Không nhận được email?' : "Didn't receive the email?"}
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>{language === 'VI' ? 'Kiểm tra thư mục spam' : 'Check spam/junk folder'}</li>
                                <li>{language === 'VI' ? 'Xác nhận đúng địa chỉ email' : 'Verify correct email address'}</li>
                                <li>
                                  {language === 'VI' 
                                    ? 'Chờ vài phút và thử lại'
                                    : 'Wait a few minutes and try again'
                                  }
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Support Contact */}
                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'VI' 
                          ? 'Cần hỗ trợ thêm? Liên hệ bộ phận IT hỗ trợ'
                          : 'Need further assistance? Contact IT support'
                        }
                      </p>
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <a 
                          href="mailto:support@uth-confms.edu.vn" 
                          className="flex items-center gap-2 text-[#2C7A7B] hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          phulhm1749@ut.edu.vn
                        </a>
                        <div className="w-px h-4 bg-gray-300" />
                        <a 
                          href="tel:+842834565678" 
                          className="flex items-center gap-2 text-[#2C7A7B] hover:underline"
                        >
                          <Smartphone className="w-4 h-4" />
                          (028) 3456 5678
                        </a>
                      </div>
                    </div>
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

export default ForgotPassword;