import { useState } from "react";
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
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function CfpPublicPage() {
  // ❗ KHÔNG hardcode dữ liệu – chờ API
  const [deadlines, setDeadlines] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState(0);
  const [language, setLanguage] = useState("EN");

  const toggleLanguage = () => {
    setLanguage((lang) => (lang === "EN" ? "VI" : "EN"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAFC] to-white">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A365D] via-[#2C7A7B] to-[#2C7A7B]">
        <div className="relative container mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="lg:w-1/2">
                {/* Language Toggle */}
                <div className="flex items-center justify-between mb-8">
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  <span className="text-white block">
                    {language === "EN"
                      ? "UTH International"
                      : "ĐH UTH Quốc tế"}
                  </span>
                  <span className="bg-gradient-to-r from-[#2C7A7B] to-[#38A169] bg-clip-text text-transparent block">
                    {language === "EN"
                      ? "Scientific Conference"
                      : "Hội nghị Khoa học"}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                  {language === "EN"
                    ? "The conference invites original research papers in relevant fields. Detailed information will be announced in the official Call for Papers."
                    : "Hội nghị kêu gọi các bài nghiên cứu nguyên bản trong các lĩnh vực liên quan. Thông tin chi tiết sẽ được công bố trong Call for Papers chính thức."}
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/login"
                    className="group px-6 py-3 bg-white text-[#1A365D] rounded-lg font-semibold shadow hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {language === "EN" ? "Submit Paper" : "Nộp bài"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#dates"
                    className="px-6 py-3 border border-white/40 text-white rounded-lg font-semibold hover:bg-white/10"
                  >
                    {language === "EN"
                      ? "Important Dates"
                      : "Thời hạn quan trọng"}
                  </a>
                </div>
              </div>

              {/* Right Placeholder */}
              <div className="lg:w-1/2">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {language === "EN"
                      ? "Conference Information"
                      : "Thông tin hội nghị"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === "EN"
                      ? "Official conference details will be published by the Conference Chair."
                      : "Thông tin chính thức sẽ được công bố bởi Ban tổ chức hội nghị."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= IMPORTANT DATES ================= */}
      <section id="dates" className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2CEA7B]/10 text-[#2C7A7B] mb-4">
              <Calendar className="w-5 h-5" />
              <span className="font-bold">
                {language === "EN"
                  ? "Important Dates"
                  : "Thời hạn quan trọng"}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === "EN"
                ? "Conference Timeline"
                : "Lịch trình hội nghị"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "EN"
                ? "Dates will be published after CFP approval."
                : "Thời hạn sẽ được công bố sau khi CFP được phê duyệt."}
            </p>
          </div>

          {!deadlines && (
            <div className="text-center text-gray-500">
              {language === "EN"
                ? "No dates available yet."
                : "Chưa có thông tin thời hạn."}
            </div>
          )}
        </div>
      </section>

      {/* ================= TRACKS ================= */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C7A7B]/10 text-[#2C7A7B] mb-4">
              <Layers className="w-5 h-5" />
              <span className="font-bold">
                {language === "EN"
                  ? "Research Tracks"
                  : "Chuyên đề nghiên cứu"}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === "EN"
                ? "Conference Topics"
                : "Chủ đề hội nghị"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "EN"
                ? "Tracks will be announced in the official CFP."
                : "Các chuyên đề sẽ được công bố trong CFP chính thức."}
            </p>
          </div>

          {tracks.length === 0 && (
            <div className="text-center text-gray-500">
              {language === "EN"
                ? "No tracks available yet."
                : "Chưa có chuyên đề nào."}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
