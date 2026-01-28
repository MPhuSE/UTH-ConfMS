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
  BarChart3,
  Bell,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User as UserIcon,
  FileEdit,
  Star,
  Target,
  Zap,
  Globe,
  Shield,
  BookOpen,
  Key,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/useAuthStore';

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('VI');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllConferences, setShowAllConferences] = useState(false);
  const { user } = useAuthStore();
  
  const { getMyCounts, fetchDashboardData, conferences, isLoading } = useSubmissionStore();
  const counts = getMyCounts();

  useEffect(() => {
    fetchDashboardData('author');
  }, []);

  // Updated color palette - Teal/Cyan theme
  const conferenceStats = [
    { 
      label: language === 'VI' ? 'Tổng bài nộp' : 'Total Submissions', 
      value: counts.total || 0, 
      icon: FileText, 
      color: 'from-[#0d9488] to-[#14b8a6]',
      bgColor: 'bg-gradient-to-br from-[#0d9488]/10 to-[#14b8a6]/10',
      iconColor: 'text-[#0d9488]',
      trend: '+12%',
      detail: language === 'VI' ? 'tăng so với tháng trước' : 'up from last month'
    },
    { 
      label: language === 'VI' ? 'Đang phản biện' : 'Under Review', 
      value: counts.underReview || 0, 
      icon: Clock, 
      color: 'from-[#0d9488] to-[#14b8a6]',
      bgColor: 'bg-gradient-to-br from-[#0d9488]/10 to-[#14b8a6]/10',
      iconColor: 'text-[#14b8a6]',

      detail: language === 'VI' ? 'bài đang xử lý' : 'in process'
    },
    { 
      label: language === 'VI' ? 'Đã chấp nhận' : 'Accepted', 
      value: counts.accepted || 0, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
      iconColor: 'text-emerald-600',
      trend: '80%',
      detail: language === 'VI' ? 'tỷ lệ chấp nhận' : 'acceptance rate'
    },
    { 
      label: language === 'VI' ? 'Bị từ chối' : 'Rejected', 
      value: counts.rejected || 0, 
      icon: XCircle, 
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-rose-100 to-rose-50',
      iconColor: 'text-rose-600',
      trend: '15%',
      detail: language === 'VI' ? 'tỷ lệ từ chối' : 'rejection rate'
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: language === 'VI' ? 'Gửi bài đến hội nghị CS2024' : 'Submitted to CS2024', 
      time: '2 giờ trước', 
      type: 'submit',
      color: 'bg-gradient-to-r from-[#0d9488]/10 to-[#14b8a6]/10',
      icon: FileEdit,
      iconColor: 'text-[#14b8a6]'
    },
    { 
      id: 2, 
      action: language === 'VI' ? 'Nhận phản hồi phản biện' : 'Received review feedback', 
      time: '1 ngày trước', 
      type: 'review',
      color: 'bg-gradient-to-r from-[#0d9488]/10 to-[#14b8a6]/10',
      icon: Star,
      iconColor: 'text-[#14b8a6]'
    },
    { 
      id: 3, 
      action: language === 'VI' ? 'Bài báo được chấp nhận' : 'Paper accepted', 
      time: '3 ngày trước', 
      type: 'accept',
      color: 'bg-gradient-to-r from-emerald-100 to-emerald-50',
      icon: Target,
      iconColor: 'text-emerald-600'
    },
    { 
      id: 4, 
      action: language === 'VI' ? 'Cập nhật thông tin hồ sơ' : 'Profile updated', 
      time: '1 tuần trước', 
      type: 'update',
      color: 'bg-gradient-to-r from-[#0d9488]/10 to-[#14b8a6]/10',
      icon: UserIcon,
      iconColor: 'text-[#14b8a6]'
    },
  ];

  const filterOptions = [
    { 
      id: 'all', 
      label: language === 'VI' ? 'Tất cả' : 'All', 
      active: 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
    },
    { 
      id: 'open', 
      label: language === 'VI' ? 'Đang mở' : 'Open', 
      active: 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
    },
    { 
      id: 'upcoming', 
      label: language === 'VI' ? 'Sắp tới' : 'Upcoming', 
      active: 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
    },
    { 
      id: 'past', 
      label: language === 'VI' ? 'Đã kết thúc' : 'Past', 
      active: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200',
      upcoming: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200',
      past: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200',
      review: 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200'
    };
    return colors[status] || colors.open;
  };

  const getStatusText = (status) => {
    const texts = {
      open: language === 'VI' ? 'ĐANG MỞ NHẬN BÀI' : 'OPEN FOR SUBMISSION',
      upcoming: language === 'VI' ? 'SẮP DIỄN RA' : 'COMING SOON',
      past: language === 'VI' ? 'ĐÃ KẾT THÚC' : 'ENDED',
      review: language === 'VI' ? 'ĐANG PHẢN BIỆN' : 'UNDER REVIEW'
    };
    return texts[status] || texts.open;
  };

  // Filter conferences based on search and filter
  const filteredConferences = conferences?.filter(conf => {
    const matchesSearch = searchQuery === '' || 
      conf.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    
    const deadline = new Date(conf.submission_deadline);
    const now = new Date();
    
    switch(selectedFilter) {
      case 'open':
        return matchesSearch && deadline > now;
      case 'upcoming':
        return matchesSearch && new Date(conf.start_date) > now;
      case 'past':
        return matchesSearch && deadline < now;
      default:
        return matchesSearch;
    }
  });

  const displayConferences = showAllConferences ? filteredConferences : filteredConferences?.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d9488]/5 via-white to-[#14b8a6]/5">
      

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0d9488] to-[#14b8a6] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <button
              onClick={() => setLanguage(lang => lang === 'VI' ? 'EN' : 'VI')}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#14b8a6] transition-colors mb-2"
            >
              <span className="font-medium text-gray-700">{language}</span>
            </button>
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Award className="w-7 h-7" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {language === 'VI' ? `Chào mừng trở lại, ${user?.full_name || 'Tác giả'}!` : `Welcome back, ${user?.full_name || 'Author'}!`}
                  </h1>
                  <p className="text-white/80 mt-2 max-w-2xl">
                    {language === 'VI' 
                      ? 'Theo dõi tiến độ bài báo và tham gia hội nghị nghiên cứu' 
                      : 'Track your paper progress and participate in research conferences'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {language === 'VI' ? '5 hội nghị đang tham gia' : 'Participating in 5 conferences'}
                  </span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
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
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#14b8a6] rounded-lg font-semibold hover:bg-gray-50 shadow-md transition-colors"
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

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {conferenceStats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#14b8a6]" />
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
                        className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#14b8a6] focus:border-[#14b8a6] w-40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {filterOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedFilter(option.id)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${selectedFilter === option.id ? option.active : option.inactive}`}
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
                ) : filteredConferences && filteredConferences.length > 0 ? (
                  <div className="space-y-3">
                    {displayConferences.map((conf) => {
                      const deadline = new Date(conf.submission_deadline);
                      const isUpcoming = deadline > new Date();
                      const status = isUpcoming ? 'open' : 'past';
                      
                      return (
                        <div key={conf.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#14b8a6] hover:shadow-sm transition-all">
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
                              onClick={() => navigate(`/dashboard/conference/${conf.id}`)}
                              className="text-sm text-[#14b8a6] hover:text-[#0d9488] font-medium"
                            >
                              {language === 'VI' ? 'Chi tiết' : 'Details'}
                            </button>
                            <button 
                              onClick={() => navigate(`/dashboard/submission?confId=${conf.id}`)}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white text-sm font-medium rounded hover:shadow-md transition-colors"
                            >
                              {language === 'VI' ? 'Nộp bài' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {filteredConferences.length > 3 && (
                      <button 
                        onClick={() => setShowAllConferences(!showAllConferences)}
                        className="w-full py-2 text-center text-[#14b8a6] hover:text-[#0d9488] font-medium"
                      >
                        {showAllConferences ? (
                          <>
                            {language === 'VI' ? 'Thu gọn' : 'Show less'}
                            <ChevronUp className="w-4 h-4 inline ml-1" />
                          </>
                        ) : (
                          <>
                            {language === 'VI' 
                              ? `Xem thêm ${filteredConferences.length - 3} hội nghị` 
                              : `View ${filteredConferences.length - 3} more`
                            }
                            <ChevronDown className="w-4 h-4 inline ml-1" />
                          </>
                        )}
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
          </div>

          {/* Right Column - Recent Activity Only */}
          <div className="space-y-4">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">
                    {language === 'VI' ? 'Hoạt động gần đây' : 'Recent Activity'}
                  </h3>
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${activity.color}`}>
                        <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
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
                  className="w-full mt-4 pt-3 text-center text-[#14b8a6] hover:text-[#0d9488] font-medium border-t border-gray-100"
                >
                  {language === 'VI' ? 'Xem tất cả' : 'View all'} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-8 px-8 py-6 bg-gray-50 border-t border-gray-200">
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
  );
}