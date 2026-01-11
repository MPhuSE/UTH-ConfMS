import { useEffect, useState } from "react";
import { 
  Calendar, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Users, 
  FileText, 
  Award, 
  Globe, 
  Sparkles,
  ChevronRight,
  Target,
  Zap,
  Shield,
  Cpu,
  Database,
  Wifi,
  Code
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function CfpPublicPage() {
  const [deadlines, setDeadlines] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState(0);
  const [language, setLanguage] = useState('EN'); // Thêm toggle language

  useEffect(() => {
    // Mock data cho demo
    setDeadlines({
      submission: "March 15, 2025",
      review: "April 30, 2025",
      cameraReady: "May 20, 2025",
      conference: "July 10-12, 2025"
    });
    
    setTracks([
      {
        name: "Artificial Intelligence",
        name_vi: "Trí Tuệ Nhân Tạo",
        description: "Advances in deep learning, natural language processing, computer vision, and AI applications in various domains.",
        description_vi: "Tiến bộ trong học sâu, xử lý ngôn ngữ tự nhiên, thị giác máy tính và ứng dụng AI trong các lĩnh vực khác nhau.",
        icon: <Cpu className="w-6 h-6" />,
        topics: ["Machine Learning", "Neural Networks", "NLP", "Computer Vision"],
        chair: "Prof. John Smith",
        chair_vi: "GS. John Smith"
      },
      {
        name: "Cybersecurity",
        name_vi: "An Ninh Mạng",
        description: "Security protocols, threat detection, cryptography, network security, and data protection technologies.",
        description_vi: "Giao thức bảo mật, phát hiện mối đe dọa, mật mã học, bảo mật mạng và công nghệ bảo vệ dữ liệu.",
        icon: <Shield className="w-6 h-6" />,
        topics: ["Network Security", "Cryptography", "Ethical Hacking", "Cyber Defense"],
        chair: "Dr. Sarah Lee",
        chair_vi: "TS. Sarah Lee"
      },
      {
        name: "Cloud & Edge Computing",
        name_vi: "Điện Toán Đám Mây & Biên",
        description: "Distributed systems, cloud infrastructure, edge computing, virtualization, and containerization.",
        description_vi: "Hệ thống phân tán, hạ tầng đám mây, điện toán biên, ảo hóa và container hóa.",
        icon: <Globe className="w-6 h-6" />,
        topics: ["Cloud Architecture", "Kubernetes", "Serverless", "Edge AI"],
        chair: "Prof. Michael Chen",
        chair_vi: "GS. Michael Chen"
      },
      {
        name: "Data Science & Analytics",
        name_vi: "Khoa Học Dữ Liệu & Phân Tích",
        description: "Big data analytics, data mining, visualization, predictive modeling, and business intelligence.",
        description_vi: "Phân tích dữ liệu lớn, khai thác dữ liệu, trực quan hóa, mô hình dự đoán và trí tuệ doanh nghiệp.",
        icon: <Database className="w-6 h-6" />,
        topics: ["Big Data", "Data Mining", "Visualization", "Predictive Analytics"],
        chair: "Dr. Emily Wang",
        chair_vi: "TS. Emily Wang"
      },
      {
        name: "IoT & Smart Systems",
        name_vi: "IoT & Hệ Thống Thông Minh",
        description: "Smart devices, sensor networks, embedded systems, and connected intelligent systems.",
        description_vi: "Thiết bị thông minh, mạng cảm biến, hệ thống nhúng và hệ thống thông minh kết nối.",
        icon: <Wifi className="w-6 h-6" />,
        topics: ["IoT Protocols", "Smart Cities", "Wearables", "Sensor Networks"],
        chair: "Prof. Robert Kim",
        chair_vi: "GS. Robert Kim"
      },
      {
        name: "Software Engineering",
        name_vi: "Kỹ Thuật Phần Mềm",
        description: "Agile methodologies, DevOps, software architecture, testing, and quality assurance.",
        description_vi: "Phương pháp Agile, DevOps, kiến trúc phần mềm, kiểm thử và đảm bảo chất lượng.",
        icon: <Code className="w-6 h-6" />,
        topics: ["DevOps", "Microservices", "Testing", "Code Quality"],
        chair: "Dr. Alex Johnson",
        chair_vi: "TS. Alex Johnson"
      }
    ]);
  }, []);

  const toggleLanguage = () => {
    setLanguage(lang => lang === 'EN' ? 'VI' : 'EN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFC] to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A365D] via-[#2C7A7B] to-[#2C7A7B]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Animated elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#2C7A7B]/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="lg:w-1/2">
                {/* Language Toggle */}
                <div className="flex items-center justify-between mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <Sparkles className="w-4 h-4 text-[#2C7A7B]" />
                    <span className="text-sm font-medium text-white">
                      {language === 'EN' ? 'Call for Papers 2025' : 'Mời gọi bài báo 2025'}
                    </span>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">{language}</span>
                  </button>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  <span className="text-white block">
                    {language === 'EN' ? 'UTH International' : 'ĐH UTH Quốc Tế'}
                  </span>
                  <span className="bg-gradient-to-r from-[#2C7A7B] to-[#38A169] bg-clip-text text-transparent block">
                    {language === 'EN' ? 'Scientific Conference' : 'Hội nghị Khoa học'}
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                  {language === 'EN' 
                    ? 'Join leading researchers and innovators in advancing technology research. Present your work and connect with experts worldwide.' 
                    : 'Tham gia cùng các nhà nghiên cứu và đổi mới hàng đầu trong việc thúc đẩy nghiên cứu công nghệ. Trình bày công trình của bạn và kết nối với các chuyên gia toàn cầu.'
                  }
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-xs text-gray-300">
                      {language === 'EN' ? 'Participants' : 'Người tham gia'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">150+</div>
                    <div className="text-xs text-gray-300">
                      {language === 'EN' ? 'Submissions' : 'Bài nộp'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">40+</div>
                    <div className="text-xs text-gray-300">
                      {language === 'EN' ? 'Countries' : 'Quốc gia'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">6</div>
                    <div className="text-xs text-gray-300">
                      {language === 'EN' ? 'Tracks' : 'Chuyên đề'}
                    </div>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/login"
                    className="group relative px-6 py-3 bg-white text-[#1A365D] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {language === 'EN' ? 'Submit Your Paper' : 'Nộp Bài Báo'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#dates"
                    className="px-6 py-3 bg-transparent border border-white/40 text-white rounded-lg font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {language === 'EN' ? 'Important Dates' : 'Thời hạn quan trọng'}
                  </a>
                </div>
              </div>
              
              {/* Hero Image/Stats Card */}
              <div className="lg:w-1/2">
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {language === 'EN' ? 'Conference Highlights' : 'Điểm nổi bật'}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                        <div className="w-10 h-10 rounded-lg bg-[#2C7A7B]/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-[#2C7A7B]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {language === 'EN' ? 'Peer-Reviewed Proceedings' : 'Kỷ yếu có phản biện'}
                          </div>
                          <div className="text-sm text-gray-600">IEEE Xplore & Scopus</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                          <Award className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {language === 'EN' ? 'Best Paper Awards' : 'Giải thưởng bài báo xuất sắc'}
                          </div>
                          <div className="text-sm text-gray-600">$5,000 total prizes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                        <div className="w-10 h-10 rounded-lg bg-[#38A169]/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#38A169]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {language === 'EN' ? 'AI-Assisted Review' : 'Phản biện hỗ trợ AI'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {language === 'EN' ? 'Optional AI tools' : 'Công cụ AI tùy chọn'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section id="dates" className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C7A7B]/10 text-[#2C7A7B] mb-4">
              <Calendar className="w-5 h-5" />
              <span className="font-bold">
                {language === 'EN' ? 'Important Dates' : 'Thời hạn quan trọng'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'EN' ? 'Conference Timeline' : 'Lịch trình Hội nghị'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'EN' 
                ? 'All deadlines are at 23:59 Anywhere on Earth (AoE). Late submissions will not be considered.'
                : 'Tất cả thời hạn là 23:59 Giờ mọi nơi trên Trái đất (AoE). Bài nộp trễ sẽ không được xem xét.'
              }
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline */}
            <div className="space-y-8">
              {deadlines && [
                { 
                  title: language === 'EN' ? "Full Paper Submission" : "Nộp bài báo đầy đủ", 
                  date: deadlines.submission, 
                  status: "active" 
                },
                { 
                  title: language === 'EN' ? "Notification of Acceptance" : "Thông báo chấp nhận", 
                  date: deadlines.review, 
                  status: "upcoming" 
                },
                { 
                  title: language === 'EN' ? "Camera Ready Submission" : "Nộp bản camera-ready", 
                  date: deadlines.cameraReady, 
                  status: "upcoming" 
                },
                { 
                  title: language === 'EN' ? "Conference Dates" : "Thời gian hội nghị", 
                  date: deadlines.conference, 
                  status: "upcoming" 
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start gap-6">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full border-4 ${
                        item.status === 'active' 
                          ? 'bg-white border-[#2C7A7B]' 
                          : 'bg-white border-gray-300'
                      }`} />
                      {index < 3 && (
                        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-12 ${
                          item.status === 'active' ? 'bg-[#2C7A7B]' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 hover:border-[#2C7A7B]/50 transition-colors p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                            item.status === 'active'
                              ? 'bg-[#2C7A7B]/10 text-[#2C7A7B]'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Clock className="w-4 h-4" />
                            {item.status === 'active' 
                              ? (language === 'EN' ? '⚡ OPEN NOW' : '⚡ ĐANG MỞ') 
                              : (language === 'EN' ? '📅 UPCOMING' : '📅 SẮP TỚI')
                            }
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{item.date}</div>
                      </div>
                      
                      {item.status === 'active' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <a 
                            href="/login" 
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#2C7A7B] hover:text-[#1A365D]"
                          >
                            {language === 'EN' ? 'Submit Now' : 'Nộp bài ngay'}
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Conference Tracks */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C7A7B]/10 text-[#2C7A7B] mb-4">
              <Layers className="w-5 h-5" />
              <span className="font-bold">
                {language === 'EN' ? 'Research Tracks' : 'Chuyên đề Nghiên cứu'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'EN' ? 'Conference Topics' : 'Chủ đề Hội nghị'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'EN'
                ? 'Submit your research to one of our specialized tracks covering the latest advancements in IT.'
                : 'Nộp nghiên cứu của bạn vào một trong các chuyên đề chuyên sâu của chúng tôi.'
              }
            </p>
          </div>

          {/* Track Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tracks.map((track, index) => (
              <div
                key={index}
                onClick={() => setActiveTrack(index)}
                className={`group cursor-pointer transition-all duration-300 ${
                  activeTrack === index 
                    ? 'transform -translate-y-1 shadow-lg' 
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className={`h-full rounded-xl border-2 ${
                  activeTrack === index 
                    ? 'border-[#2C7A7B] bg-white' 
                    : 'border-gray-200 bg-white group-hover:border-gray-300'
                } overflow-hidden`}>
                  {/* Track Header */}
                  <div className={`p-6 ${
                    activeTrack === index 
                      ? 'bg-gradient-to-r from-[#2C7A7B]/5 to-transparent' 
                      : ''
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeTrack === index 
                          ? 'bg-[#2C7A7B] text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {track.icon}
                      </div>
                      {activeTrack === index && (
                        <div className="animate-pulse">
                          <div className="w-2 h-2 bg-[#2C7A7B] rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === 'EN' ? track.name : track.name_vi}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {language === 'EN' ? track.description : track.description_vi}
                    </p>
                    
                    {/* Topics */}
                    <div className="flex flex-wrap gap-2">
                      {track.topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            activeTrack === index
                              ? 'bg-[#2C7A7B]/10 text-[#2C7A7B]'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {topic}
                        </span>
                      ))}
                      {track.topics.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs text-gray-500">
                          +{track.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Track Footer */}
                  <div className={`px-6 py-4 border-t ${
                    activeTrack === index ? 'border-[#2C7A7B]/20' : 'border-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {language === 'EN' ? 'Track Chair:' : 'Chủ tịch chuyên đề:'}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {language === 'EN' ? track.chair : track.chair_vi}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Track Details */}
          {tracks[activeTrack] && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="md:flex">
                {/* Track Info */}
                <div className="md:w-2/3 p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      activeTrack === 0 ? 'bg-[#2C7A7B]' : 
                      activeTrack === 1 ? 'bg-[#D4AF37]' :
                      activeTrack === 2 ? 'bg-[#38A169]' :
                      activeTrack === 3 ? 'bg-[#3182CE]' :
                      activeTrack === 4 ? 'bg-[#805AD5]' :
                      'bg-[#DD6B20]'
                    } text-white`}>
                      {tracks[activeTrack].icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {language === 'EN' 
                          ? tracks[activeTrack].name 
                          : tracks[activeTrack].name_vi
                        }
                      </h3>
                      <p className="text-gray-600">
                        {language === 'EN' 
                          ? `Track Chair: ${tracks[activeTrack].chair}`
                          : `Chủ tịch chuyên đề: ${tracks[activeTrack].chair_vi}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">
                        {language === 'EN' ? 'Track Description' : 'Mô tả chuyên đề'}
                      </h4>
                      <p className="text-gray-700">
                        {language === 'EN' 
                          ? tracks[activeTrack].description
                          : tracks[activeTrack].description_vi
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">
                        {language === 'EN' ? 'Submission Requirements' : 'Yêu cầu nộp bài'}
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {language === 'EN' 
                              ? 'Maximum 12 pages (including references)' 
                              : 'Tối đa 12 trang (bao gồm tài liệu tham khảo)'
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {language === 'EN' 
                              ? 'Springer LNCS format' 
                              : 'Định dạng Springer LNCS'
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {language === 'EN' 
                              ? 'Double-blind review process' 
                              : 'Quy trình phản biện mù đôi'
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#2C7A7B] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {language === 'EN' 
                              ? 'Original, unpublished work' 
                              : 'Công trình nguyên bản, chưa công bố'
                            }
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Stats Sidebar */}
                <div className="md:w-1/3 bg-gray-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">
                    {language === 'EN' ? 'Track Statistics' : 'Thống kê chuyên đề'}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        {language === 'EN' ? 'Expected Submissions' : 'Bài nộp dự kiến'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">25-30</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        {language === 'EN' ? 'Acceptance Rate' : 'Tỷ lệ chấp nhận'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">30%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        {language === 'EN' ? 'Reviewers' : 'Phản biện'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">15</div>
                    </div>
                    <div className="pt-4">
                      <a
                        href="/login"
                        className="block w-full text-center px-4 py-3 bg-[#2C7A7B] text-white rounded-lg font-medium hover:bg-[#1A365D] transition-colors"
                      >
                        {language === 'EN' ? 'Submit to this Track' : 'Nộp vào chuyên đề này'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1A365D] via-[#2C7A7B] to-[#2C7A7B]">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative px-6 py-12 md:p-16 text-center">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {language === 'EN' 
                    ? 'Ready to Present Your Research?' 
                    : 'Sẵn sàng trình bày nghiên cứu của bạn?'
                  }
                </h2>
                <p className="text-lg text-gray-200 mb-8">
                  {language === 'EN'
                    ? 'Join leading researchers from around the world. Submit your paper before the deadline.'
                    : 'Tham gia cùng các nhà nghiên cứu hàng đầu từ khắp nơi trên thế giới. Nộp bài báo của bạn trước thời hạn.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/login"
                    className="group relative px-6 py-3 bg-white text-[#1A365D] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {language === 'EN' ? 'Submit Paper Now' : 'Nộp bài báo ngay'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#dates"
                    className="px-6 py-3 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {language === 'EN' ? 'View Important Dates' : 'Xem thời hạn quan trọng'}
                  </a>
                </div>
                <div className="mt-8 flex items-center justify-center gap-2 text-gray-300 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    {language === 'EN' 
                      ? `⏰ Deadline: ${deadlines?.submission} • 23:59 AoE`
                      : `⏰ Thời hạn: ${deadlines?.submission} • 23:59 AoE`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}