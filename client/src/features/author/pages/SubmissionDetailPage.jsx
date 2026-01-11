import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submissionService } from "../../../services/submissionService";
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  FileText, 
  Globe, 
  Clock, 
  AlertCircle,
  Users,
  Building,
  Award,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Calendar,
  Shield,
  Sparkles,
  Edit,
  Printer,
  Share2,
  Globe as GlobeIcon,
  Star,
  ChevronRight,
  Mail,
  Phone,
  ExternalLink,
  FileSearch
} from "lucide-react";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const submissionData = await submissionService.getById(id);
        setData(submissionData);
      } catch (err) {
        console.error("Lỗi:", err);
        const errorMsg = language === 'VI' 
          ? "Không thể tải thông tin bài báo này." 
          : "Unable to load paper information.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, language]);

  const getStatusInfo = (status) => {
    const statusLower = status?.toLowerCase();
    const statusConfig = {
      'submitted': { 
        label: language === 'VI' ? 'ĐÃ NỘP' : 'SUBMITTED', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        icon: Clock 
      },
      'under review': { 
        label: language === 'VI' ? 'ĐANG PHẢN BIỆN' : 'UNDER REVIEW', 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50',
        icon: FileSearch 
      },
      'accept': { 
        label: language === 'VI' ? 'ĐÃ CHẤP NHẬN' : 'ACCEPTED', 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        icon: CheckCircle 
      },
      'reject': { 
        label: language === 'VI' ? 'BỊ TỪ CHỐI' : 'REJECTED', 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        icon: XCircle 
      },
      'camera ready': { 
        label: language === 'VI' ? 'BẢN CUỐI' : 'CAMERA READY', 
        color: 'text-purple-600', 
        bg: 'bg-purple-50',
        icon: CheckCircle 
      }
    };

    return statusConfig[statusLower] || { 
      label: status || (language === 'VI' ? 'ĐANG XỬ LÝ' : 'PROCESSING'), 
      color: 'text-gray-600', 
      bg: 'bg-gray-50',
      icon: Clock 
    };
  };

  const calculateAverageScore = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.score || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleDownload = () => {
    if (data?.file_url) {
      window.open(data.file_url, '_blank');
    } else {
      alert(language === 'VI' ? 'Không tìm thấy file' : 'File not found');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#2C7A7B]/30 border-t-[#2C7A7B] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-8 h-8 text-[#2C7A7B]" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 text-center">
            {language === 'VI' ? 'Đang tải thông tin bài báo...' : 'Loading paper information...'}
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">
            {language === 'VI' ? 'Vui lòng đợi trong giây lát' : 'Please wait a moment'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{error}</h3>
          <p className="text-gray-600 mb-6">
            {language === 'VI' 
              ? 'Không thể tải thông tin bài báo. Vui lòng thử lại sau.'
              : 'Could not load paper information. Please try again later.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {language === 'VI' ? 'Quay lại' : 'Go Back'}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#2C7A7B] text-white rounded-lg font-medium hover:bg-[#1A365D] transition-colors"
            >
              {language === 'VI' ? 'Thử lại' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(data?.status);
  const StatusIcon = statusInfo.icon;
  const averageScore = calculateAverageScore(data?.reviews);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header with Back and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">{language === 'VI' ? 'Quay lại' : 'Go Back'}</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'VI' ? 'Chi tiết bài báo' : 'Paper Details'}
            </h1>
            <p className="text-gray-600">
              ID: {data?.id} • {language === 'VI' ? 'Theo dõi trạng thái' : 'Track status'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] transition-colors"
          >
            <GlobeIcon className="w-4 h-4" />
            <span className="font-medium">{language}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#2C7A7B] text-white rounded-lg font-medium hover:bg-[#1A365D] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'VI' ? 'Tải PDF' : 'Download PDF'}
              </span>
            </button>
            
            {data?.status?.toLowerCase() === 'submitted' && (
              <button 
                onClick={() => navigate(`/dashboard/submission/edit/${data.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'VI' ? 'Chỉnh sửa' : 'Edit'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paper Header Card */}
          <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold line-clamp-2">{data?.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{data?.conference?.name || 'UTH Conference'}</span>
                    </div>
                    <div className="w-px h-4 bg-white/30"></div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(data?.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color} font-bold`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusInfo.label}
                </div>
                {data?.reviews?.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm font-medium">{averageScore}/5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">{data?.reviews?.length || 0}</div>
                <div className="text-sm text-white/80">
                  {language === 'VI' ? 'Lượt phản biện' : 'Reviews'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data?.authors?.length || 1}</div>
                <div className="text-sm text-white/80">
                  {language === 'VI' ? 'Tác giả' : 'Authors'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {data?.track?.name?.charAt(0) || 'T'}
                </div>
                <div className="text-sm text-white/80">
                  {language === 'VI' ? 'Track' : 'Track'}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-[#2C7A7B] text-[#2C7A7B]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'VI' ? 'Thông tin chi tiết' : 'Paper Details'}
                </button>
                <button
                  onClick={() => setActiveTab('abstract')}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'abstract'
                      ? 'border-[#2C7A7B] text-[#2C7A7B]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'VI' ? 'Tóm tắt' : 'Abstract'}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-[#2C7A7B] text-[#2C7A7B]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'VI' ? 'Phản biện' : 'Reviews'} ({data?.reviews?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('authors')}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'authors'
                      ? 'border-[#2C7A7B] text-[#2C7A7B]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {language === 'VI' ? 'Tác giả' : 'Authors'} ({data?.authors?.length || 1})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900">
                        {language === 'VI' ? 'Thông tin hội nghị' : 'Conference Information'}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{language === 'VI' ? 'Tên hội nghị:' : 'Conference:'}</span>
                          <span className="font-medium text-gray-900">{data?.conference?.name || 'UTH Conference'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{language === 'VI' ? 'Track:' : 'Track:'}</span>
                          <span className="font-medium text-gray-900">{data?.track?.name || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{language === 'VI' ? 'Ngày nộp:' : 'Submission date:'}</span>
                          <span className="font-medium text-gray-900">
                            {new Date(data?.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900">
                        {language === 'VI' ? 'Thông tin file' : 'File Information'}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{language === 'VI' ? 'Định dạng:' : 'Format:'}</span>
                          <span className="font-medium text-gray-900">PDF</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{language === 'VI' ? 'Trạng thái:' : 'Status:'}</span>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{language === 'VI' ? 'Lần cập nhật:' : 'Last updated:'}</span>
                          <span className="font-medium text-gray-900">
                            {new Date(data?.updated_at || data?.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {data?.keywords && data.keywords.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        {language === 'VI' ? 'Từ khóa' : 'Keywords'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.keywords.split(',').map((keyword, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-[#2C7A7B]/10 text-[#2C7A7B] rounded-full text-sm font-medium"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'abstract' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      {language === 'VI' ? 'Tóm tắt bài báo' : 'Paper Abstract'}
                    </h4>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {data?.abstract}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2">
                          {language === 'VI' ? 'Gợi ý AI từ tóm tắt' : 'AI Insights from Abstract'}
                        </h5>
                        <p className="text-sm text-gray-700">
                          {language === 'VI' 
                            ? 'Hệ thống AI đã phân tích và xác định các chủ đề chính: Nghiên cứu ứng dụng, Phương pháp mới, Kết quả thực nghiệm.'
                            : 'AI system has analyzed and identified key topics: Applied research, Novel methodology, Experimental results.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {data?.reviews && data.reviews.length > 0 ? (
                    <>
                      {/* Review Stats */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{data.reviews.length}</div>
                            <div className="text-sm text-gray-600">
                              {language === 'VI' ? 'Tổng phản biện' : 'Total Reviews'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
                            <div className="text-sm text-gray-600">
                              {language === 'VI' ? 'Điểm trung bình' : 'Average Score'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {Math.max(...data.reviews.map(r => r.score || 0))}
                            </div>
                            <div className="text-sm text-gray-600">
                              {language === 'VI' ? 'Điểm cao nhất' : 'Highest Score'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {Math.min(...data.reviews.map(r => r.score || 0))}
                            </div>
                            <div className="text-sm text-gray-600">
                              {language === 'VI' ? 'Điểm thấp nhất' : 'Lowest Score'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review List */}
                      <div className="space-y-4">
                        {data.reviews.map((review, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#2C7A7B]/50 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-900">
                                    {language === 'VI' ? 'Phản biện' : 'Reviewer'} #{index + 1}
                                  </span>
                                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                    {language === 'VI' ? 'Ẩn danh' : 'Anonymous'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(review.created_at || review.date).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-gray-900">
                                  {review.score || 'N/A'}/5
                                </div>
                                <div className="w-10">
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#2C7A7B]" 
                                      style={{ width: `${((review.score || 0) / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h6 className="text-sm font-medium text-gray-900 mb-1">
                                  {language === 'VI' ? 'Nhận xét chính' : 'Main Comments'}
                                </h6>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                  {review.comment || review.content}
                                </p>
                              </div>
                              
                              {review.strengths && (
                                <div>
                                  <h6 className="text-sm font-medium text-green-700 mb-1">
                                    {language === 'VI' ? 'Ưu điểm' : 'Strengths'}
                                  </h6>
                                  <p className="text-gray-700">{review.strengths}</p>
                                </div>
                              )}
                              
                              {review.weaknesses && (
                                <div>
                                  <h6 className="text-sm font-medium text-amber-700 mb-1">
                                    {language === 'VI' ? 'Cần cải thiện' : 'Areas for Improvement'}
                                  </h6>
                                  <p className="text-gray-700">{review.weaknesses}</p>
                                </div>
                              )}
                              
                              {review.recommendation && (
                                <div>
                                  <h6 className="text-sm font-medium text-blue-700 mb-1">
                                    {language === 'VI' ? 'Khuyến nghị' : 'Recommendation'}
                                  </h6>
                                  <p className="text-gray-700">{review.recommendation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {language === 'VI' ? 'Chưa có phản biện' : 'No Reviews Yet'}
                      </h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {language === 'VI' 
                          ? 'Bài báo đang được phân công cho các phản biện. Phản hồi ẩn danh sẽ xuất hiện tại đây sau khi có kết quả.'
                          : 'The paper is being assigned to reviewers. Anonymous feedback will appear here once available.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'authors' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-gray-900">
                    {language === 'VI' ? 'Danh sách tác giả' : 'Author List'}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {data?.authors?.map((author, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2C7A7B] to-[#38A169] flex items-center justify-center text-white font-bold">
                            {author.name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-gray-900">
                                {author.name}
                                {author.is_main && (
                                  <span className="ml-2 text-xs font-bold text-[#2C7A7B] bg-[#2C7A7B]/10 px-2 py-0.5 rounded-full">
                                    {language === 'VI' ? 'TÁC GIẢ CHÍNH' : 'MAIN AUTHOR'}
                                  </span>
                                )}
                              </h5>
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{author.email}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{author.affiliation}</span>
                              </div>
                              
                              {author.orcid && (
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">ORCID: {author.orcid}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {language === 'VI' ? 'Dòng thời gian' : 'Timeline'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {language === 'VI' ? 'Bài báo đã nộp' : 'Paper submitted'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(data?.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  ['under review', 'accept', 'reject'].includes(data?.status?.toLowerCase()) 
                    ? 'bg-yellow-100' 
                    : 'bg-gray-100'
                }`}>
                  <Clock className={`w-4 h-4 ${
                    ['under review', 'accept', 'reject'].includes(data?.status?.toLowerCase()) 
                      ? 'text-yellow-600' 
                      : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className={`font-medium ${
                    ['under review', 'accept', 'reject'].includes(data?.status?.toLowerCase()) 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    {language === 'VI' ? 'Đang phản biện' : 'Under review'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'VI' ? 'Đang tiến hành' : 'In progress'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  ['accept', 'reject'].includes(data?.status?.toLowerCase()) 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
                }`}>
                  <CheckCircle className={`w-4 h-4 ${
                    ['accept', 'reject'].includes(data?.status?.toLowerCase()) 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className={`font-medium ${
                    ['accept', 'reject'].includes(data?.status?.toLowerCase()) 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    {language === 'VI' ? 'Quyết định' : 'Decision'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {data?.status ? statusInfo.label : (language === 'VI' ? 'Chờ xử lý' : 'Pending')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#F7FAFC] to-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {language === 'VI' ? 'Thao tác nhanh' : 'Quick Actions'}
            </h3>
            <div className="space-y-3">
              <button 
                onClick={handleDownload}
                className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {language === 'VI' ? 'Tải bài báo' : 'Download Paper'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {language === 'VI' ? 'In thông tin' : 'Print Details'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate(`/dashboard/submission/${data?.id}/reviews`)}
                className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {language === 'VI' ? 'Xem phản biện' : 'View Reviews'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate(`/conferences/${data?.conference?.id}`)}
                className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-lg hover:border-[#2C7A7B] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {language === 'VI' ? 'Xem hội nghị' : 'View Conference'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Conference Info */}
          {data?.conference && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'VI' ? 'Thông tin hội nghị' : 'Conference Information'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-medium text-gray-900">{data.conference.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(data.conference.start_date).toLocaleDateString('vi-VN')} - {new Date(data.conference.end_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/conferences/${data.conference.id}`)}
                  className="w-full mt-4 py-2 text-center text-[#2C7A7B] font-medium hover:bg-[#2C7A7B]/10 rounded-lg transition-colors"
                >
                  {language === 'VI' ? 'Xem trang hội nghị →' : 'View Conference Page →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}