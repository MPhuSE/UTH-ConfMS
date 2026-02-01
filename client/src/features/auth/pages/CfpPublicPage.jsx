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
  LogIn,
  UserPlus,
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { conferenceService } from "../../../services/conferenceService";
import { trackService } from "../../../services/trackService";
import { useAuthStore } from "../../../app/store/useAuthStore";

export default function CfpPublicPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conferencesData, setConferencesData] = useState([]);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("EN");
  const { isAuthenticated, user } = useAuthStore();

  // Màu chủ đạo và bảng màu phụ
  const primaryColor = "#008689";
  const primaryLight = "#E6F4F5";
  const primaryDark = "#006A6D";
  const secondaryColor = "#2D3748";
  const accentColor = "#F97316";

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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${primaryLight} 0%, #ffffff 100%)`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Loader2
            style={{
              width: "48px",
              height: "48px",
              color: primaryColor,
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p
            style={{
              color: secondaryColor,
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            {language === "EN"
              ? "Loading academic opportunities..."
              : "Đang tải cơ hội học thuật..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Header />

      {/* Hero Section - Modern Professional Design */}
      <section
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
          color: "white",
          padding: "80px 20px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "300px",
            height: "300px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top Bar with Language and Auth */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "48px",
            }}
          >
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Globe size={16} />
              {language}
            </button>

            {/* Auth Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                  style={{
                    background: "white",
                    border: "none",
                    color: primaryColor,
                    padding: "10px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  <Sparkles size={18} />
                  {language === "EN" ? "Dashboard" : "Bảng điều khiển"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      background: "transparent",
                      border: "2px solid white",
                      color: "white",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <LogIn size={18} />
                    {language === "EN" ? "Sign In" : "Đăng nhập"}
                  </button>

                  <button
                    onClick={() => navigate("/register")}
                    style={{
                      background: "white",
                      border: "none",
                      color: primaryColor,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                  >
                    <UserPlus size={18} />
                    {language === "EN" ? "Sign Up" : "Đăng ký"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Title */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.15)",
                padding: "8px 16px",
                borderRadius: "20px",
                marginBottom: "24px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Sparkles size={16} />
              {language === "EN"
                ? "Academic Research Platform"
                : "Nền Tảng Nghiên Cứu Học Thuật"}
            </div>

            <h1
              style={{
                fontSize: "56px",
                fontWeight: "800",
                marginBottom: "24px",
                lineHeight: "1.2",
              }}
            >
              {language === "EN" ? "Call for" : "Mời gọi"}
              <br />
              <span style={{ color: primaryLight }}>
                {language === "EN" ? "Research Papers" : "Bài báo khoa học"}
              </span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                maxWidth: "700px",
                margin: "0 auto",
                lineHeight: "1.6",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {language === "EN"
                ? "Contribute to the advancement of scientific knowledge through peer-reviewed research publications at international conferences"
                : "Đóng góp vào sự phát triển của tri thức khoa học thông qua các công trình nghiên cứu được phản biện tại các hội nghị quốc tế"}
            </p>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                {conferencesData.filter((c) => c.cfp?.is_open).length}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                {language === "EN" ? "Open Conferences" : "Hội nghị đang mở"}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                {conferencesData.reduce(
                  (sum, c) => sum + (c.tracks?.length || 0),
                  0
                )}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                {language === "EN"
                  ? "Research Tracks"
                  : "Chuyên đề nghiên cứu"}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                {
                  conferencesData.filter(
                    (c) =>
                      c.cfp?.submission_deadline &&
                      getDaysRemaining(c.cfp.submission_deadline) > 0
                  ).length
                }
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                {language === "EN"
                  ? "Active Deadlines"
                  : "Hạn nộp còn hiệu lực"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: "60px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: secondaryColor,
              marginBottom: "12px",
            }}
          >
            {language === "EN"
              ? "Available Conferences"
              : "Hội nghị hiện có"}
          </h2>
          <p style={{ fontSize: "16px", color: "#64748B", marginBottom: "8px" }}>
            {language === "EN"
              ? "Browse and submit to upcoming scientific conferences"
              : "Duyệt và nộp bài cho các hội nghị khoa học sắp tới"}
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: primaryLight,
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              color: primaryColor,
            }}
          >
            <FileText size={16} />
            {conferencesData.length}{" "}
            {language === "EN" ? "conferences" : "hội nghị"}
          </div>
        </div>

        {/* Conferences List - HORIZONTAL LAYOUT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {conferencesData.length > 0 ? (
            conferencesData.map(({ conference, cfp, tracks }) => {
              const daysRemaining = cfp?.submission_deadline
                ? getDaysRemaining(cfp.submission_deadline)
                : null;
              const isOpen = cfp?.is_open;
              const isDeadlineNear = daysRemaining && daysRemaining <= 7;

              return (
                <div
                  key={conference.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    border: `2px solid ${isOpen ? primaryColor : "#E2E8F0"}`,
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 24px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                >
                  {/* Horizontal Layout Container */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      minHeight: "200px",
                    }}
                  >
                    {/* Left Section - Main Info (60%) */}
                    <div
                      style={{
                        flex: "1 1 60%",
                        padding: "24px 28px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Header Row */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "16px",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: isOpen ? primaryLight : "#F1F5F9",
                              color: isOpen ? primaryColor : "#64748B",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: isOpen ? primaryColor : "#94A3B8",
                              }}
                            />
                            {isOpen
                              ? language === "EN"
                                ? "Accepting Submissions"
                                : "Đang nhận bài"
                              : language === "EN"
                                ? "Submissions Closed"
                                : "Đã đóng nhận bài"}
                          </div>

                          {isDeadlineNear && isOpen && (
                            <div
                              style={{
                                background: accentColor,
                                color: "white",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {language === "EN" ? "Deadline Soon" : "Sắp hết hạn"}
                            </div>
                          )}
                        </div>

                        <h3
                          style={{
                            fontSize: "22px",
                            fontWeight: "700",
                            color: secondaryColor,
                            marginBottom: "8px",
                            lineHeight: "1.3",
                          }}
                        >
                          {cfp?.name || conference.name}
                        </h3>

                        <p
                          style={{
                            fontSize: "14px",
                            color: primaryColor,
                            fontWeight: "600",
                            marginBottom: "12px",
                          }}
                        >
                          {cfp?.abbreviation || conference.abbreviation}
                        </p>

                        {/* Description */}
                        {cfp?.description && (
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#64748B",
                              lineHeight: "1.6",
                              marginBottom: "16px",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: cfp.description }}
                          />
                        )}
                      </div>

                      {/* Tracks Section */}
                      {tracks.length > 0 && (
                        <div
                          style={{
                            marginTop: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: secondaryColor,
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "10px",
                            }}
                          >
                            <Layers size={16} style={{ color: primaryColor }} />
                            {language === "EN"
                              ? "Research Topics"
                              : "Chủ đề nghiên cứu"}
                            <span
                              style={{
                                fontSize: "12px",
                                color: primaryColor,
                                fontWeight: "600",
                                background: primaryLight,
                                padding: "2px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              {tracks.length}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {tracks.slice(0, 3).map((track, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: primaryLight,
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  color: secondaryColor,
                                  border: `1px solid ${primaryColor}20`,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <span style={{ fontWeight: "500" }}>
                                  {track.name}
                                </span>
                              </div>
                            ))}
                            {tracks.length > 3 && (
                              <div
                                style={{
                                  background: primaryColor,
                                  color: "white",
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                +{tracks.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Deadline & Actions (40%) */}
                    <div
                      style={{
                        flex: "1 1 40%",
                        background: primaryLight,
                        padding: "24px 28px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderLeft: `3px solid ${primaryColor}`,
                      }}
                    >
                      {/* Deadline Info */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            marginBottom: "20px",
                          }}
                        >
                          <Calendar
                            size={24}
                            style={{ color: primaryColor, flexShrink: 0, marginTop: "2px" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#64748B",
                                marginBottom: "6px",
                                fontWeight: "500",
                              }}
                            >
                              {language === "EN"
                                ? "Submission Deadline"
                                : "Hạn nộp bài"}
                            </div>
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: "700",
                                color: secondaryColor,
                                marginBottom: "8px",
                              }}
                            >
                              {formatDate(cfp?.submission_deadline)}
                            </div>
                            {daysRemaining !== null && daysRemaining > 0 && (
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  background: "white",
                                  padding: "8px 16px",
                                  borderRadius: "10px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                              >
                                <Clock size={18} style={{ color: primaryColor }} />
                                <div>
                                  <span
                                    style={{
                                      fontSize: "24px",
                                      fontWeight: "800",
                                      color: primaryColor,
                                    }}
                                  >
                                    {daysRemaining}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      color: "#64748B",
                                      marginLeft: "6px",
                                    }}
                                  >
                                    {language === "EN"
                                      ? "days left"
                                      : "ngày còn lại"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {isOpen ? (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/cfp/${conference.id}/submit`)
                              }
                              style={{
                                background: primaryColor,
                                color: "white",
                                border: "none",
                                padding: "14px 20px",
                                borderRadius: "10px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = primaryDark;
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0,134,137,0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = primaryColor;
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              {language === "EN" ? "Submit Paper" : "Nộp bài ngay"}
                              <ArrowRight size={18} />
                            </button>

                            <button
                              onClick={() => navigate(`/cfp/${conference.id}`)}
                              style={{
                                background: "white",
                                color: primaryColor,
                                border: `2px solid ${primaryColor}`,
                                padding: "14px 20px",
                                borderRadius: "10px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = primaryColor;
                                e.currentTarget.style.color = "white";
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.color = primaryColor;
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              {language === "EN" ? "View Details" : "Xem chi tiết"}
                              <ChevronRight size={18} />
                            </button>
                          </>
                        ) : (
                          <div
                            style={{
                              background: "#F1F5F9",
                              color: "#94A3B8",
                              padding: "14px 20px",
                              borderRadius: "10px",
                              fontSize: "15px",
                              fontWeight: "600",
                              textAlign: "center",
                            }}
                          >
                            {language === "EN"
                              ? "Submissions Closed"
                              : "Đã đóng nhận bài"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
              }}
            >
              <FileText
                size={64}
                style={{ color: "#CBD5E1", margin: "0 auto 20px" }}
              />
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: secondaryColor,
                  marginBottom: "8px",
                }}
              >
                {language === "EN"
                  ? "No Conferences Available"
                  : "Không có hội nghị nào"}
              </h3>
              <p style={{ fontSize: "16px", color: "#64748B" }}>
                {language === "EN"
                  ? "There are currently no conferences accepting submissions. Please check back later."
                  : "Hiện không có hội nghị nào đang nhận bài. Vui lòng kiểm tra lại sau."}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .horizontal-card {
              flex-direction: column !important;
            }
            .horizontal-card > div {
              flex: 1 1 100% !important;
              border-left: none !important;
              border-top: 3px solid #008689 !important;
            }
          }
        `}
      </style>
    </div>
  );
}