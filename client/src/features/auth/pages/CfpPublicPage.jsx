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

const mockTracks = [
  {
    id: 1,
    name: "Artificial Intelligence & Machine Learning",
    description: "Research in AI, ML, deep learning, and neural networks",
    topics: [
      "Deep Learning and Neural Networks",
      "Natural Language Processing",
      "Computer Vision and Image Recognition",
      "Reinforcement Learning",
      "Machine Learning Applications",
      "AI Ethics and Fairness",
      "Explainable AI",
      "Transfer Learning and Meta-Learning"
    ]
  },
  {
    id: 2,
    name: "Data Science & Big Data",
    description: "Data analytics, big data processing, and visualization",
    topics: [
      "Big Data Analytics",
      "Data Mining and Knowledge Discovery",
      "Data Visualization Techniques",
      "Stream Processing",
      "Cloud Computing for Big Data",
      "Data Privacy and Security",
      "Distributed Computing Systems",
      "Real-time Data Processing"
    ]
  },
  {
    id: 3,
    name: "Software Engineering",
    description: "Software development methodologies and practices",
    topics: [
      "Agile and DevOps Practices",
      "Software Architecture and Design Patterns",
      "Testing and Quality Assurance",
      "Requirements Engineering",
      "Software Maintenance and Evolution",
      "Mobile Application Development",
      "Web Technologies",
      "Microservices and Cloud-Native Applications"
    ]
  },
  {
    id: 4,
    name: "Cybersecurity",
    description: "Information security, cryptography, and network security",
    topics: [
      "Network Security and Intrusion Detection",
      "Cryptography and Encryption",
      "Blockchain Security",
      "IoT Security",
      "Cloud Security",
      "Malware Analysis and Prevention",
      "Security in AI/ML Systems",
      "Privacy-Preserving Technologies"
    ]
  }
];

export default function CfpPublicPage() {
  const [tracks] = useState(mockTracks);
  const [activeTrack, setActiveTrack] = useState(0);
  const [language, setLanguage] = useState("EN");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">UTH Conference</h1>
            <a href="#login" className="text-sm text-blue-600">Login</a>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white bg-opacity-10 border border-white border-opacity-20">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    {language === "EN" ? "Call for Papers" : "Mời gọi bài báo"}
                  </span>
                </div>
                <button
                  onClick={() => setLanguage(language === "EN" ? "VI" : "EN")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{language}</span>
                </button>
              </div>

              <h1 className="text-5xl font-bold mb-6">
                <span className="text-white block">
                  {language === "EN" ? "UTH International" : "ĐH UTH Quốc tế"}
                </span>
                <span className="text-teal-300 block">
                  {language === "EN" ? "Scientific Conference" : "Hội nghị Khoa học"}
                </span>
              </h1>

              <p className="text-xl text-gray-200 mb-8">
                {language === "EN"
                  ? "The conference invites original research papers. Join us to share your innovative work with the research community."
                  : "Hội nghị kêu gọi các bài nghiên cứu nguyên bản. Tham gia để chia sẻ công trình sáng tạo với cộng đồng nghiên cứu."}
              </p>

              <div className="flex gap-4">
                <a
                  href="#submit"
                  className="group px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold shadow-lg flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {language === "EN" ? "Submit Paper" : "Nộp bài"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#dates"
                  className="px-6 py-3 border border-white border-opacity-40 text-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10"
                >
                  {language === "EN" ? "Important Dates" : "Thời hạn"}
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {language === "EN" ? "Conference Highlights" : "Điểm nổi bật"}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "EN" 
                      ? "International peer-reviewed publication"
                      : "Xuất bản quốc tế có phản biện"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "EN"
                      ? "Expert keynote speakers"
                      : "Diễn giả chuyên gia"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "EN"
                      ? "Networking opportunities"
                      : "Cơ hội kết nối"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="dates" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 mb-4">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">
                {language === "EN" ? "Important Dates" : "Thời hạn quan trọng"}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === "EN" ? "Conference Timeline" : "Lịch trình hội nghị"}
            </h2>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === "EN" ? "Dates to be announced" : "Chưa có thông tin"}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 mb-4">
              <Layers className="w-5 h-5" />
              <span className="font-semibold">
                {language === "EN" ? "Research Tracks" : "Chuyên đề nghiên cứu"}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === "EN" ? "Conference Topics" : "Chủ đề hội nghị"}
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(index)}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
                    activeTrack === index
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {track.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tracks[activeTrack].name}
                </h3>
                <p className="text-gray-600">
                  {tracks[activeTrack].description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {language === "EN" ? "Topics Include:" : "Chủ đề bao gồm:"}
                </h4>

                <div className="grid md:grid-cols-2 gap-3">
                  {tracks[activeTrack].topics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
                      <span className="text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {tracks[activeTrack].topics.slice(0, 4).map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {topic}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{tracks[activeTrack].topics.length - 4} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 UTH Conference</p>
        </div>
      </footer>
    </div>
  );
}