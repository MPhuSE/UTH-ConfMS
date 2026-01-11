import React, { useEffect, useState } from 'react';
import { useSubmissionStore } from '../../app/store/useSubmissionStore';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  ArrowRight, 
  MapPin, 
  Trophy,
  TrendingUp,
  Users,
  Award,
  Download,
  Eye,
  Edit,
  Plus,
  ChevronRight,
  BarChart3,
  Bell,
  Search,
  Filter,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/useAuthStore';

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('VI'); // VI/EN toggle
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { user } = useAuthStore();
  
  const { getMyCounts, fetchDashboardData, conferences, isLoading } = useSubmissionStore();
  const counts = getMyCounts();

  useEffect(() => {
    fetchDashboardData('author');
  }, []);

  const conferenceStats = [
    { label: language === 'VI' ? 'Tổng bài nộp' : 'Total Submissions', value: counts.total || 0, icon: FileText, color: 'blue', trend: '+12%' },
    { label: language === 'VI' ? 'Đang phản biện' : 'Under Review', value: counts.underReview || 0, icon: Clock, color: 'amber', trend: '+2' },
    { label: language === 'VI' ? 'Đã chấp nhận' : 'Accepted', value: counts.accepted || 0, icon: CheckCircle, color: 'emerald', trend: '80%' },
    { label: language === 'VI' ? 'Bị từ chối' : 'Rejected', value: counts.rejected || 0, icon: XCircle, color: 'rose', trend: '15%' },
  ];

  const recentActivities = [
    { id: 1, action: language === 'VI' ? 'Gửi bài đến hội nghị CS2024' : 'Submitted to CS2024', time: '2 giờ trước', type: 'submit' },
    { id: 2, action: language === 'VI' ? 'Nhận phản hồi phản biện' : 'Received review feedback', time: '1 ngày trước', type: 'review' },
    { id: 3, action: language === 'VI' ? 'Bài báo được chấp nhận' : 'Paper accepted', time: '3 ngày trước', type: 'accept' },
    { id: 4, action: language === 'VI' ? 'Cập nhật thông tin hồ sơ' : 'Profile updated', time: '1 tuần trước', type: 'update' },
  ];

  const filterOptions = [
    { id: 'all', label: language === 'VI' ? 'Tất cả' : 'All' },
    { id: 'open', label: language === 'VI' ? 'Đang mở' : 'Open' },
    { id: 'upcoming', label: language === 'VI' ? 'Sắp tới' : 'Upcoming' },
    { id: 'past', label: language === 'VI' ? 'Đã kết thúc' : 'Past' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      open: 'text-green-600 bg-green-50',
      upcoming: 'text-blue-600 bg-blue-50',
      past: 'text-gray-600 bg-gray-50',
      review: 'text-yellow-600 bg-yellow-50'
    };
    return colors[status] || colors.open;
  };

  const getStatusText = (status) => {
    const texts = {
      open: language === 'VI' ? 'ĐANG MỞ' : 'OPEN',
      upcoming: language === 'VI' ? 'SẮP TỚI' : 'UPCOMING',
      past: language === 'VI' ? 'ĐÃ KẾT THÚC' : 'ENDED',
      review: language === 'VI' ? 'ĐANG REVIEW' : 'REVIEWING'
    };
    return texts[status] || texts.open;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1A365D] via-[#2C7A7B] to-[#2C7A7B] rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {language === 'VI' ? `Chào mừng, ${user?.full_name || 'Tác giả'}!` : `Welcome, ${user?.full_name || 'Author'}!`}
                </h1>
                <p className="text-white/80 mt-1">
                  {language === 'VI' 
                    ? 'Theo dõi tiến độ bài báo và tham gia hội nghị nghiên cứu' 
                    : 'Track your paper progress and participate in research conferences'
                  }
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/80" />
                <span className="text-sm">
                  {language === 'VI' ? '5 hội nghị đang tham gia' : 'Participating in 5 conferences'}
                </span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white/80" />
                <span className="text-sm">
                  {language === 'VI' ? '80% tỷ lệ hoàn thành' : '80% completion rate'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/dashboard/submission')}
              className="group flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#1A365D] rounded-xl font-bold hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              {language === 'VI' ? 'Nộp bài báo mới' : 'Submit New Paper'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/dashboard/my-submissions')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <Eye className="w-5 h-5" />
              {language === 'VI' ? 'Xem bài nộp' : 'View Submissions'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {conferenceStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#2C7A7B]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-sm font-bold text-${stat.color}-600 bg-${stat.color}-50 px-3 py-1 rounded-full`}>
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Conferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conference Header with Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-[#D4AF37]" />
                  {language === 'VI' ? 'Hội nghị đang mở' : 'Open Conferences'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {language === 'VI' 
                    ? 'Tham gia và nộp bài đến các hội nghị nghiên cứu'
                    : 'Participate and submit to research conferences'
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'VI' ? 'Tìm hội nghị...' : 'Search conferences...'}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/50 focus:border-[#2C7A7B]"
                  />
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                    {filterOptions.find(f => f.id === selectedFilter)?.label}
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </div>
            </div>

            {/* Conference List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : conferences && conferences.length > 0 ? (
              <div className="space-y-4">
                {conferences.slice(0, 3).map((conf) => {
                  const deadline = new Date(conf.submission_deadline);
                  const isUpcoming = deadline > new Date();
                  const status = isUpcoming ? 'open' : 'past';
                  
                  return (
                    <div key={conf.id} className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:border-[#2C7A7B]/50 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#2C7A7B] transition-colors">
                              {conf.name || conf.title}
                            </h4>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(status)}`}>
                              {getStatusText(status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {conf.description || language === 'VI' ? 'Hội nghị nghiên cứu công nghệ' : 'Technology research conference'}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{conf.location || (language === 'VI' ? 'Trực tuyến' : 'Online')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{deadline.toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{conf.participants || '150+'} {language === 'VI' ? 'người tham gia' : 'participants'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          {language === 'VI' ? 'Hạn nộp bài:' : 'Submission deadline:'}{' '}
                          <span className="font-bold text-gray-900">
                            {deadline.toLocaleDateString('vi-VN', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => navigate(`/dashboard/conferences/${conf.id}`)}
                            className="px-4 py-2 text-sm font-medium text-[#2C7A7B] hover:text-[#1A365D] hover:bg-[#2C7A7B]/10 rounded-lg transition-colors"
                          >
                            {language === 'VI' ? 'Xem chi tiết' : 'View Details'}
                          </button>
                          <button 
                            onClick={() => navigate(`/dashboard/submission?confId=${conf.id}`)}
                            className="px-4 py-2 bg-[#2C7A7B] text-white text-sm font-medium rounded-lg hover:bg-[#1A365D] transition-colors"
                          >
                            {language === 'VI' ? 'Nộp bài ngay' : 'Submit Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {conferences.length > 3 && (
                  <button 
                    onClick={() => navigate('/dashboard/conferences')}
                    className="w-full py-3 text-center text-[#2C7A7B] font-medium hover:bg-[#2C7A7B]/10 rounded-lg transition-colors"
                  >
                    {language === 'VI' 
                      ? `Xem thêm ${conferences.length - 3} hội nghị khác →` 
                      : `View ${conferences.length - 3} more conferences →`
                    }
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {language === 'VI' ? 'Không có hội nghị nào' : 'No Conferences Available'}
                </h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  {language === 'VI' 
                    ? 'Hiện tại chưa có hội nghị nào đang mở để nộp bài. Vui lòng kiểm tra lại sau.'
                    : 'There are currently no open conferences for submission. Please check back later.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Recent Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'VI' ? 'Hoạt động gần đây' : 'Recent Activity'}
              </h3>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'submit' ? 'bg-blue-100' :
                    activity.type === 'review' ? 'bg-yellow-100' :
                    activity.type === 'accept' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'submit' && <FileText className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'review' && <Clock className="w-4 h-4 text-yellow-600" />}
                    {activity.type === 'accept' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {activity.type === 'update' && <Edit className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/dashboard/activity')}
              className="w-full mt-6 py-3 text-center text-[#2C7A7B] font-medium hover:bg-[#2C7A7B]/10 rounded-lg transition-colors"
            >
              {language === 'VI' ? 'Xem tất cả hoạt động →' : 'View All Activity →'}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#1A365D] to-[#2C7A7B] rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-6">
              {language === 'VI' ? 'Thao tác nhanh' : 'Quick Actions'}
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard/profile')}
                className="flex items-center justify-between w-full p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{language === 'VI' ? 'Cập nhật hồ sơ' : 'Update Profile'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/my-submissions')}
                className="flex items-center justify-between w-full p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{language === 'VI' ? 'Xem thống kê' : 'View Statistics'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/downloads')}
                className="flex items-center justify-between w-full p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{language === 'VI' ? 'Tài liệu mẫu' : 'Template Files'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-white/80 text-center">
                {language === 'VI' 
                  ? 'Cần hỗ trợ? Liên hệ đội ngũ hội nghị'
                  : 'Need help? Contact conference team'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for User icon
const User = (props) => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);