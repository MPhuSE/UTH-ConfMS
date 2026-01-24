import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Globe,
  Sparkles,
  ChevronRight,
  Loader2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { conferenceService } from "../../../services/conferenceService";
import { trackService } from "../../../services/trackService";

export default function CfpPublicPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [conferencesData, setConferencesData] = useState([]); // Array of { conference, cfp, tracks }
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("EN");

  useEffect(() => {
    loadAllConferences();
  }, []);

  const loadAllConferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all conferences
      const data = await conferenceService.getAll({ limit: 100 });
      const confList = data.conferences || data || [];
      
      if (confList.length === 0) {
        setError("Không có hội nghị nào");
        setLoading(false);
        return;
      }
      
      // Load CFP và tracks cho mỗi conference
      const conferencesWithData = await Promise.all(
        confList.map(async (conf) => {
          try {
            // Load CFP
            const cfp = await conferenceService.getPublicCFP(conf.id);
            
            // Load tracks
            let tracks = [];
            try {
              const tracksData = await trackService.getByConference(conf.id);
              tracks = Array.isArray(tracksData) ? tracksData : [];
            } catch (err) {
              console.warn(`Could not load tracks for conference ${conf.id}:`, err);
            }
            
            return {
              conference: conf,
              cfp: cfp,
              tracks: tracks,
            };
          } catch (err) {
            console.warn(`Could not load CFP for conference ${conf.id}:`, err);
            return {
              conference: conf,
              cfp: null,
              tracks: [],
            };
          }
        })
      );
      
      setConferencesData(conferencesWithData);
    } catch (err) {
      console.error("Load conferences error:", err);
      setError("Không thể tải danh sách hội nghị");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "EN" ? "VI" : "EN"));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7FAFC] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2C7A7B] mx-auto mb-4" />
          <p className="text-gray-600">
            {language === "EN" ? "Loading CFP information..." : "Đang tải thông tin CFP..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F7FAFC] to-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              {language === "EN" ? "Error" : "Lỗi"}
            </h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {language === "EN" ? "Go Home" : "Về trang chủ"}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFC] to-white">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A365D] via-[#2C7A7B] to-[#2C7A7B]">
        <div className="relative container mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto text-center">
            {/* Language Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {language === "EN"
                    ? "Call for Papers"
                    : "Mời gọi bài báo"}
                </span>
              </div>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language}</span>
              </button>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
              {language === "EN"
                ? "UTH International Scientific Conferences"
                : "Hội nghị Khoa học Quốc tế ĐH UTH"}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              {language === "EN"
                ? "Browse all available conferences and submit your research papers."
                : "Duyệt tất cả các hội nghị có sẵn và nộp bài nghiên cứu của bạn."}
            </p>
          </div>
        </div>
      </section>

      {/* ================= ALL CONFERENCES ================= */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === "EN"
                ? "Available Conferences"
                : "Các hội nghị có sẵn"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "EN"
                ? "Select a conference to view its Call for Papers and submission details."
                : "Chọn một hội nghị để xem Call for Papers và thông tin nộp bài."}
            </p>
          </div>

          {conferencesData.length > 0 ? (
            <div className="space-y-12">
              {conferencesData.map(({ conference, cfp, tracks }) => (
                <div
                  key={conference.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Conference Header */}
                  <div className="bg-gradient-to-r from-[#1A365D] to-[#2C7A7B] p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">
                          {cfp?.name || conference.name}
                        </h3>
                        {(cfp?.abbreviation || conference.abbreviation) && (
                          <p className="text-lg text-gray-200">
                            ({cfp?.abbreviation || conference.abbreviation})
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-lg ${cfp?.is_open ? "bg-green-500" : "bg-red-500"}`}>
                          <span className="font-semibold">
                            {cfp?.is_open 
                              ? (language === "EN" ? "Open" : "Đang mở")
                              : (language === "EN" ? "Closed" : "Đã đóng")}
                          </span>
                        </div>
                        {cfp?.is_open && (
                          <a
                            href={`/login?redirect=/submit?confId=${conference.id}`}
                            className="px-6 py-2 bg-white text-[#1A365D] rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            {language === "EN" ? "Submit" : "Nộp bài"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conference Content */}
                  <div className="p-8">
                    {/* Description */}
                    {cfp?.description && (
                      <div className="mb-6">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {cfp.description}
                        </p>
                      </div>
                    )}

                    {/* Important Dates */}
                    {cfp?.submission_deadline && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-[#2C7A7B]" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {language === "EN" ? "Submission Deadline" : "Hạn nộp bài"}
                            </p>
                            <p className="text-lg font-bold text-[#2C7A7B]">
                              {formatDate(cfp.submission_deadline)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tracks */}
                    {tracks.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Layers className="w-5 h-5 text-[#2C7A7B]" />
                          {language === "EN" ? "Research Tracks" : "Chuyên đề nghiên cứu"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tracks.map((track, index) => (
                            <div
                              key={track.id || index}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#2C7A7B] rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-900 mb-1">
                                    {track.name}
                                  </h5>
                                  {track.description && (
                                    <p className="text-xs text-gray-600 mb-2">
                                      {track.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {language === "EN" ? "Max Reviewers:" : "Số reviewer tối đa:"} {track.max_reviewers || 3}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tracks.length === 0 && (
                      <p className="text-gray-500 text-sm italic">
                        {language === "EN" ? "No tracks available yet." : "Chưa có chuyên đề nào."}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              {language === "EN"
                ? "No conferences available."
                : "Không có hội nghị nào."}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
