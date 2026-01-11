import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/useAuthStore";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Mail, 
  Shield, 
  ArrowRight,
  Clock,
  AlertCircle,
  UserCheck,
  Lock,
  Home
} from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  
  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("Hệ thống đang xác thực tài khoản...");
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const [countdown, setCountdown] = useState(5);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token)
        .then((response) => {
          setStatus("success");
          setMessage(language === 'VI' 
            ? "Xác thực thành công! Tài khoản của bạn đã sẵn sàng." 
            : "Verification successful! Your account is now ready."
          );
          // Get email from response if available
          if (response?.data?.email) {
            setEmail(response.data.email);
          }
          
          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/login");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        })
        .catch((err) => {
          setStatus("error");
          const errorMsg = err.response?.data?.message || 
            (language === 'VI' 
              ? "Liên kết xác thực không hợp lệ hoặc đã hết hạn." 
              : "Verification link is invalid or has expired."
            );
          setMessage(errorMsg);
        });
    } else {
      setStatus("error");
      setMessage(language === 'VI' 
        ? "Thiếu mã xác thực. Vui lòng kiểm tra lại email." 
        : "Missing verification token. Please check your email."
      );
    }
  }, [searchParams, verifyEmail, navigate, language]);

  const messages = {
    loading: {
      title: language === 'VI' ? "Đang xác thực..." : "Verifying...",
      description: language === 'VI' 
        ? "Đang xác thực tài khoản của bạn với hệ thống" 
        : "Verifying your account with the system"
    },
    success: {
      title: language === 'VI' ? "Xác thực thành công!" : "Verification Successful!",
      description: language === 'VI' 
        ? "Tài khoản của bạn đã được xác thực thành công" 
        : "Your account has been successfully verified"
    },
    error: {
      title: language === 'VI' ? "Xác thực thất bại" : "Verification Failed",
      description: language === 'VI' 
        ? "Không thể xác thực tài khoản" 
        : "Unable to verify your account"
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://portal.ut.edu.vn/images/logo_full.png"
                alt="UTH Logo"
                className="h-12"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">UTH-ConfMS</h1>
                <p className="text-sm text-gray-600">
                  {language === 'VI' 
                    ? 'Hệ thống quản lý hội nghị nghiên cứu khoa học'
                    : 'Scientific Conference Management System'
                  }
                </p>
              </div>
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
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
                      {language === 'VI' ? 'Xác thực Email' : 'Email Verification'}
                    </h2>
                    <p className="text-sm text-gray-600">UTH-ConfMS Security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">
                    {language === 'VI' ? 'Tại sao cần xác thực?' : 'Why Verify?'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' ? 'Bảo mật tài khoản' : 'Account security'}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' ? 'Ngăn chặn đăng ký giả mạo' : 'Prevent fake registrations'}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {language === 'VI' ? 'Nhận thông báo quan trọng' : 'Receive important notifications'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              {status === "success" && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    {language === 'VI' ? 'Bước tiếp theo' : 'Next Steps'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      {language === 'VI' ? 'Đăng nhập vào hệ thống' : 'Login to the system'}
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      {language === 'VI' ? 'Cập nhật hồ sơ cá nhân' : 'Update your profile'}
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      {language === 'VI' ? 'Bắt đầu nộp bài báo' : 'Start submitting papers'}
                    </li>
                  </ul>
                </div>
              )}

              {/* Help Section */}
              {status === "error" && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200 p-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    {language === 'VI' ? 'Cần hỗ trợ?' : 'Need Help?'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-red-600">1</span>
                      </div>
                      {language === 'VI' 
                        ? 'Kiểm tra liên kết không quá 24 giờ tuổi'
                        : 'Ensure link is less than 24 hours old'
                      }
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-red-600">2</span>
                      </div>
                      {language === 'VI' 
                        ? 'Không nhấn vào liên kết nhiều lần'
                        : 'Do not click link multiple times'
                      }
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-red-600">3</span>
                      </div>
                      {language === 'VI' 
                        ? 'Liên hệ support nếu vấn đề tiếp diễn'
                        : 'Contact support if issue persists'
                      }
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Verification Status */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {messages[status].title}
                        </h2>
                        <p className="text-white/80">
                          {messages[status].description}
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

                {/* Status Content */}
                <div className="p-8">
                  <div className="text-center">
                    {/* Status Icon */}
                    <div className="mb-8">
                      {status === "loading" && (
                        <div className="relative">
                          <div className="w-32 h-32 mx-auto">
                            <Loader2 className="w-full h-full text-[#2C7A7B] animate-spin" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-12 h-12 text-white bg-[#2C7A7B] rounded-full p-2" />
                          </div>
                        </div>
                      )}
                      {status === "success" && (
                        <div className="relative">
                          <div className="w-32 h-32 mx-auto">
                            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                              <CheckCircle className="w-20 h-20 text-green-600" />
                            </div>
                          </div>
                        </div>
                      )}
                      {status === "error" && (
                        <div className="relative">
                          <div className="w-32 h-32 mx-auto">
                            <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                              <XCircle className="w-20 h-20 text-red-600" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Display (if available) */}
                    {email && (
                      <div className="mb-6 max-w-md mx-auto">
                        <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{email}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {language === 'VI' 
                            ? 'Email đã được xác thực thành công'
                            : 'Email has been successfully verified'
                          }
                        </p>
                      </div>
                    )}

                    {/* Status Message */}
                    <div className="mb-8">
                      <div className={`text-lg font-medium mb-3 ${
                        status === 'success' ? 'text-green-700' :
                        status === 'error' ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        {message}
                      </div>
                      
                      {status === "loading" && (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {language === 'VI' 
                              ? 'Vui lòng đợi trong giây lát...' 
                              : 'Please wait a moment...'
                            }
                          </span>
                        </div>
                      )}

                      {status === "success" && (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {language === 'VI' 
                              ? `Tự động chuyển hướng sau ${countdown} giây...`
                              : `Redirecting in ${countdown} seconds...`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                      {status !== "loading" && (
                        <>
                          <button
                            onClick={() => handleNavigate("/login")}
                            className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <Lock className="w-5 h-5" />
                            {language === 'VI' ? 'Đăng nhập ngay' : 'Login Now'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                          
                          <button
                            onClick={() => handleNavigate("/")}
                            className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-[#2C7A7B] text-[#2C7A7B] rounded-lg font-bold hover:bg-[#2C7A7B] hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <Home className="w-5 h-5" />
                            {language === 'VI' ? 'Trang chủ' : 'Home Page'}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Additional Info */}
                    {status === "success" && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900 mb-2">
                              {language === 'VI' ? 'Bạn đã sẵn sàng!' : 'You are all set!'}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {language === 'VI'
                                ? 'Tài khoản của bạn đã được xác thực đầy đủ. Bây giờ bạn có thể:'
                                : 'Your account is fully verified. You can now:'
                              }
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                              <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                {language === 'VI' ? 'Nộp bài báo đến hội nghị' : 'Submit papers to conferences'}
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                {language === 'VI' ? 'Đăng ký làm phản biện' : 'Register as reviewer'}
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                {language === 'VI' ? 'Theo dõi tiến trình bài báo' : 'Track paper progress'}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {status === "error" && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                        <div className="flex items-start gap-4">
                          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900 mb-2">
                              {language === 'VI' ? 'Không thể xác thực' : 'Unable to Verify'}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {language === 'VI'
                                ? 'Nếu bạn gặp vấn đề liên tục, vui lòng:'
                                : 'If you continue experiencing issues, please:'
                              }
                            </p>
                            <ul className="mt-2 space-y-2 text-sm text-gray-600">
                              <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                {language === 'VI' 
                                  ? 'Yêu cầu gửi lại email xác thực'
                                  : 'Request a new verification email'
                                }
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                {language === 'VI' 
                                  ? 'Liên hệ bộ phận hỗ trợ'
                                  : 'Contact support team'
                                }
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                {language === 'VI' 
                                  ? 'Kiểm tra email đã đăng ký'
                                  : 'Check your registered email'
                                }
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
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

export default VerifyEmail;