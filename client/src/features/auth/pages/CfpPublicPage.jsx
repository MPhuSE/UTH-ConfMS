import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Layers,
  Clock,
  FileText,
  Globe,
  Sparkles,
  Loader2,
  Calendar,
  ChevronRight,
  ArrowRight,
  Target,
  Award,
  Users,
  BarChart3,
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { conferenceService } from "../../../services/conferenceService";
import { trackService } from "../../../services/trackService";

export default function CfpPublicPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [conferencesData, setConferencesData] = useState([]);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("EN");
  
  // Màu chủ đạo và bảng màu phụ
  const primaryColor = "#008689"; // RGB(0,134,137)
  const primaryLight = "#E6F4F5";
  const primaryDark = "#006A6D";
  const secondaryColor = "#2D3748";
  const accentColor = "#F97316"; // Màu nhấn cho thông báo quan trọng

  useEffect(() => {
    loadAllConferences();
  }, []);

  const loadAllConferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await conferenceService.getAll({ limit: 100 });
      const confList = data.conferences || data || [];

      if (confList.length === 0) {
        setError("Không có hội nghị nào");
        setLoading(false);
        return;
      }

      const conferencesWithData = await Promise.all(
        confList.map(async (conf) => {
          try {
            const cfp = await conferenceService.getPublicCFP(conf.id);
            let tracks = [];
            try {
              const tracksData = await trackService.getByConference(conf.id);
              tracks = Array.isArray(tracksData) ? tracksData : [];
            } catch (err) {
              console.warn(`Could not load tracks for ${conf.id}:`, err);
            }
            return { conference: conf, cfp, tracks };
          } catch (err) {
            return { conference: conf, cfp: null, tracks: [] };
          }
        })
      );

      setConferencesData(conferencesWithData);
    } catch (err) {
      setError("Không thể tải danh sách hội nghị");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => setLanguage((l) => (l === "EN" ? "VI" : "EN"));

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
          <Loader2 className="w-12 h-12 animate-spin absolute top-2 left-2" style={{ color: primaryColor }} />
        </div>
        <p className="mt-6 text-gray-600 font-medium">
          {language === "EN" ? "Loading academic opportunities..." : "Đang tải cơ hội học thuật..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans antialiased text-gray-900">
      <Header />

      {/* Hero Section - Scientific Design */}
      <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        {/* Scientific Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 opacity-5">
            <div className="absolute inset-0 border-2 border-gray-300 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <div className="absolute bottom-10 right-10 w-80 h-80 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="0.5" />
              <path d="M0,30 Q25,55 50,30 T100,30" stroke="currentColor" fill="none" strokeWidth="0.5" />
              <path d="M0,70 Q25,45 50,70 T100,70" stroke="currentColor" fill="none" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Language Toggle - Scientific Style */}
            <div className="flex justify-end mb-12">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all duration-200 shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
                  borderColor: primaryColor + '20'
                }}
              >
                <Globe className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {language === "EN" ? "English" : "Tiếng Việt"}
                </span>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ml-1" 
                      style={{ backgroundColor: primaryColor, color: 'white' }}>
                  {language}
                </span>
              </button>
            </div>

            {/* Main Title */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-6 shadow-sm">
                <Target className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-sm font-bold tracking-widest uppercase text-gray-600">
                  {language === "EN" ? "Academic Research Platform" : "Nền Tảng Nghiên Cứu Học Thuật"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                <span className="block mb-2">{language === "EN" ? "Call for" : "Mời gọi"}</span>
                <span className="block" style={{ color: primaryColor }}>
                  {language === "EN" ? "Research Papers" : "Bài báo khoa học"}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                {language === "EN"
                  ? "Contribute to the advancement of scientific knowledge through peer-reviewed research publications at international conferences"
                  : "Đóng góp vào sự phát triển của tri thức khoa học thông qua các công trình nghiên cứu được phản biện tại các hội nghị quốc tế"}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
                    {conferencesData.filter(c => c.cfp?.is_open).length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {language === "EN" ? "Open Conferences" : "Hội nghị đang mở"}
                  </div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
                    {conferencesData.reduce((sum, c) => sum + (c.tracks?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {language === "EN" ? "Research Tracks" : "Chuyên đề nghiên cứu"}
                  </div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
                    {conferencesData.filter(c => c.cfp?.submission_deadline && 
                      getDaysRemaining(c.cfp.submission_deadline) > 0).length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {language === "EN" ? "Active Deadlines" : "Hạn nộp còn hiệu lực"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {language === "EN" ? "Available Conferences" : "Hội nghị hiện có"}
              </h2>
              <p className="text-gray-600">
                {language === "EN" 
                  ? "Browse and submit to upcoming scientific conferences"
                  : "Duyệt và nộp bài cho các hội nghị khoa học sắp tới"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">
                {conferencesData.length} {language === "EN" ? "conferences" : "hội nghị"}
              </span>
            </div>
          </div>

          {/* Conferences Grid */}
          <div className="grid grid-cols-1 gap-8">
            {conferencesData.length > 0 ? (
              conferencesData.map(({ conference, cfp, tracks }) => {
                const daysRemaining = cfp?.submission_deadline ? getDaysRemaining(cfp.submission_deadline) : null;
                const isOpen = cfp?.is_open;
                const isDeadlineNear = daysRemaining && daysRemaining <= 7;

                return (
                  <div
                    key={conference.id}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300"
                    style={{
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        {/* Conference Info */}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                                      style={isOpen ? {
                                        backgroundColor: primaryLight,
                                        color: primaryColor,
                                        borderColor: primaryColor + '30'
                                      } : {
                                        backgroundColor: '#FEE2E2',
                                        color: '#DC2626',
                                        borderColor: '#FECACA'
                                      }}>
                                  <span className="inline-flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'animate-pulse' : ''}`}
                                          style={{ backgroundColor: isOpen ? primaryColor : '#DC2626' }}></span>
                                    {isOpen 
                                      ? (language === "EN" ? "Accepting Submissions" : "Đang nhận bài") 
                                      : (language === "EN" ? "Submissions Closed" : "Đã đóng nhận bài")}
                                  </span>
                                </span>
                                
                                {isDeadlineNear && isOpen && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {language === "EN" ? "Deadline Soon" : "Sắp hết hạn"}
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                {cfp?.name || conference.name}
                              </h3>
                              <p className="text-lg font-semibold mb-1" style={{ color: primaryColor }}>
                                {cfp?.abbreviation || conference.abbreviation}
                              </p>
                            </div>
                            
                            {/* Date Info */}
                            <div className="text-right">
                              <div className="mb-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                  {language === "EN" ? "Submission Deadline" : "Hạn nộp bài"}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatDate(cfp?.submission_deadline)}
                                </p>
                              </div>
                              
                              {daysRemaining !== null && daysRemaining > 0 && (
                                <div className={`text-sm font-bold ${isDeadlineNear ? 'text-orange-600' : 'text-gray-600'}`}>
                                  {daysRemaining} {language === "EN" ? "days remaining" : "ngày còn lại"}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {cfp?.description && (
                            <div className="mb-8">
                              <p className="text-gray-700 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                                {cfp.description}
                              </p>
                            </div>
                          )}

                          {/* Tracks */}
                          {tracks.length > 0 && (
                            <div className="mb-8">
                              <div className="flex items-center gap-2 mb-4">
                                <Layers className="w-5 h-5" style={{ color: primaryColor }} />
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                  {language === "EN" ? "Research Topics" : "Chủ đề nghiên cứu"}
                                </h4>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                  {tracks.length} {language === "EN" ? "topics" : "chủ đề"}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-3">
                                {tracks.slice(0, 4).map((track, idx) => (
                                  <div key={idx} 
                                       className="px-4 py-2.5 rounded-xl border transition-colors hover:shadow-sm group/track"
                                       style={{
                                         backgroundColor: primaryLight + '20',
                                         borderColor: primaryColor + '20',
                                         borderWidth: '1px'
                                       }}>
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                                      <span className="font-medium text-sm text-gray-800">{track.name}</span>
                                    </div>
                                    {track.max_reviewers && (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                        <Users className="w-3 h-3" />
                                        <span>{track.max_reviewers} {language === "EN" ? "reviewers" : "phản biện"}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {tracks.length > 4 && (
                                  <div className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">
                                    +{tracks.length - 4} {language === "EN" ? "more" : "khác"}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                            {isOpen ? (
                              <>
                                <a
                                  href={`/login?redirect=/submit?confId=${conference.id}`}
                                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg flex items-center gap-2 group/btn"
                                  style={{
                                    backgroundColor: primaryColor,
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`
                                  }}
                                >
                                  <span>{language === "EN" ? "Submit Paper" : "Nộp bài ngay"}</span>
                                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </a>
                                <a
                                  href={`/conference/${conference.id}`}
                                  className="px-5 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  {language === "EN" ? "View Details" : "Xem chi tiết"}
                                </a>
                              </>
                            ) : (
                              <div className="px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-500 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {language === "EN" ? "Submissions Closed" : "Đã đóng nhận bài"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: primaryLight }}>
                  <Calendar className="w-10 h-10" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {language === "EN" ? "No Conferences Available" : "Không có hội nghị nào"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {language === "EN" 
                    ? "There are currently no conferences accepting submissions. Please check back later."
                    : "Hiện không có hội nghị nào đang nhận bài. Vui lòng kiểm tra lại sau."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}