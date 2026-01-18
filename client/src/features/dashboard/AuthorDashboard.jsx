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
  const [language, setLanguage] = useState('VI');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { user } = useAuthStore();
  
  const { getMyCounts, fetchDashboardData, conferences, isLoading } = useSubmissionStore();
  const counts = getMyCounts();

  useEffect(() => {
    fetchDashboardData('author');
  }, []);

  // Giữ nguyên tất cả logic và nội dung, chỉ sửa giao diện
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
      {/* Welcome Header - Đã có sẵn, chỉ giữ nguyên */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'VI' ? `Chào mừng, ${user?.full_name || 'Tác giả'}!` : `Welcome, ${user?.full_name || 'Author'}!`}
                </h1>
                <p className="text-blue-100 mt-1">
                  {language === 'VI' 
                    ? 'Theo dõi tiến độ bài báo và tham gia hội nghị nghiên cứu' 
                    : 'Track your paper progress and participate in research conferences'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {language === 'VI' ? '5 hội nghị đang tham gia' : 'Participating in 5 conferences'}
                </span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">
                  {language === 'VI' ? '80% tỷ lệ hoàn thành' : '80% completion rate'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button 
              onClick={() => navigate('/dashboard/submission')}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 shadow-md transition-colors"
            >
              <Plus className="w-5 h-5" />
              {language === 'VI' ? 'Nộp bài mới' : 'Submit Paper'}
            </button>
            <button 
              onClick={() => navigate('/dashboard/my-submissions')}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white/20 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
            >
              <Eye className="w-5 h-5" />
              {language === 'VI' ? 'Bài nộp' : 'Submissions'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview - Đơn giản hóa */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {conferenceStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
            <div className="text-xs font-medium text-green-600">
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Conferences */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'VI' ? 'Hội nghị đang mở' : 'Open Conferences'}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'VI' ? 'Tìm hội nghị...' : 'Search...'}
                    className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-40"
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  {filterOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFilter(option.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg ${selectedFilter === option.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conference List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : conferences && conferences.length > 0 ? (
              <div className="space-y-3">
                {conferences.slice(0, 3).map((conf) => {
                  const deadline = new Date(conf.submission_deadline);
                  const isUpcoming = deadline > new Date();
                  const status = isUpcoming ? 'open' : 'past';
                  
                  return (
                    <div key={conf.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {conf.name || conf.title}
                            </h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                              {getStatusText(status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{conf.location || (language === 'VI' ? 'Online' : 'Online')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{conf.participants || '150+'}</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {language === 'VI' ? 'Hạn nộp:' : 'Deadline:'}{' '}
                            <span className="font-medium">
                              {deadline.toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => navigate(`/dashboard/conferences/${conf.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {language === 'VI' ? 'Chi tiết' : 'Details'}
                        </button>
                        <button 
                          onClick={() => navigate(`/dashboard/submission?confId=${conf.id}`)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          {language === 'VI' ? 'Nộp bài' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {conferences.length > 3 && (
                  <button 
                    onClick={() => navigate('/dashboard/conferences')}
                    className="w-full py-2 text-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {language === 'VI' 
                      ? `Xem thêm ${conferences.length - 3} hội nghị` 
                      : `View ${conferences.length - 3} more`
                    } →
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-700 font-medium mb-2">
                  {language === 'VI' ? 'Không có hội nghị nào' : 'No conferences'}
                </h4>
                <p className="text-gray-500 text-sm">
                  {language === 'VI' 
                    ? 'Hiện chưa có hội nghị nào đang mở'
                    : 'No open conferences available'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                {language === 'VI' ? 'Hoạt động gần đây' : 'Recent Activity'}
              </h3>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
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
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/dashboard/activity')}
              className="w-full mt-4 pt-3 text-center text-blue-600 hover:text-blue-800 font-medium border-t border-gray-100"
            >
              {language === 'VI' ? 'Xem tất cả' : 'View all'} →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-600 rounded-lg p-5 text-white">
            <h3 className="font-bold mb-4">
              {language === 'VI' ? 'Thao tác nhanh' : 'Quick Actions'}
            </h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/dashboard/profile')}
                className="flex items-center justify-between w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <span className="font-medium">{language === 'VI' ? 'Hồ sơ' : 'Profile'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/my-submissions')}
                className="flex items-center justify-between w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{language === 'VI' ? 'Thống kê' : 'Statistics'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/downloads')}
                className="flex items-center justify-between w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{language === 'VI' ? 'Mẫu tài liệu' : 'Templates'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-center">
                {language === 'VI' 
                  ? 'Cần hỗ trợ?'
                  : 'Need help?'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// User icon component (giữ nguyên)
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