import { BookOpen, Mail, Phone, MapPin, Globe, GraduationCap, Shield, Users, FileText } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const primaryColor = "#008689"; // RGB(0,134,137)
  const primaryLight = "#E6F4F5";
  const primaryDark = "#006A6D";

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Scientific Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <circle cx="20" cy="20" r="2" />
            <circle cx="50" cy="20" r="2" />
            <circle cx="80" cy="20" r="2" />
            <circle cx="20" cy="50" r="2" />
            <circle cx="50" cy="50" r="2" />
            <circle cx="80" cy="50" r="2" />
            <circle cx="20" cy="80" r="2" />
            <circle cx="50" cy="80" r="2" />
            <circle cx="80" cy="80" r="2" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-80 h-80">
          <svg viewBox="0 0 100 100" className="w-full h-full" stroke="currentColor" strokeWidth="0.5" fill="none">
            <path d="M10,50 L90,50" />
            <path d="M50,10 L50,90" />
            <path d="M10,10 L90,90" />
            <path d="M10,90 L90,10" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4 mb-12">
          {/* Brand & About */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                   style={{ 
                     background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
                     boxShadow: `0 8px 32px ${primaryColor}30`
                   }}>
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">UTH Research Conference System</h3>
                <p className="text-sm font-medium" style={{ color: primaryColor }}>
                  Academic Excellence Platform
                </p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6 max-w-xl">
              A comprehensive conference management platform designed for scientific research communities. 
              Facilitating peer-reviewed paper submissions, collaborative reviews, and global academic exchange.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://uth.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)' }}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Official Website</span>
              </a>
              
              <a
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white hover:shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
                  boxShadow: `0 4px 20px ${primaryColor}40`
                }}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Join Community</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-gray-900">
              <FileText className="w-4 h-4" style={{ color: primaryColor }} />
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Call for Papers", desc: "Submit research papers" },
                { name: "Conference Schedule", desc: "Important dates & program" },
                { name: "Review Guidelines", desc: "Submission requirements" },
                { name: "Registration", desc: "Conference participation" },
                { name: "Proceedings", desc: "Past conferences" }
              ].map((item, i) => (
                <li key={i}>
                  <a 
                    href="#" 
                    className="group block py-2 transition-all duration-200 hover:translate-x-1"
                  >
                    <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600">
                      {item.desc}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-gray-900">
              <Mail className="w-4 h-4" style={{ color: primaryColor }} />
              Contact
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-200 group-hover:scale-110"
                     style={{ 
                       backgroundColor: primaryLight,
                       color: primaryColor
                     }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                    University Location
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    District 9, Ho Chi Minh City, Vietnam
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-200 group-hover:scale-110"
                     style={{ 
                       backgroundColor: primaryLight,
                       color: primaryColor
                     }}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                    Academic Email
                  </div>
                  <a 
                    href="mailto:research@uth.edu.vn" 
                    className="text-xs text-gray-600 mt-0.5 hover:text-gray-900 transition-colors"
                  >
                    research@uth.edu.vn
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-200 group-hover:scale-110"
                     style={{ 
                       backgroundColor: primaryLight,
                       color: primaryColor
                     }}>
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                    Research Office
                  </div>
                  <a 
                    href="tel:+842837654321" 
                    className="text-xs text-gray-600 mt-0.5 hover:text-gray-900 transition-colors"
                  >
                    +84 28 3765 4321
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright & Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border"
                      style={{ 
                        borderColor: primaryColor + '30',
                        backgroundColor: primaryLight,
                        color: primaryColor
                      }}>
                  ISSN: 1234-5678
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                  Scopus Indexed
                </span>
              </div>
              <p className="text-sm text-gray-600">
                © {year} University of Transport HCMC. All rights reserved.
              </p>
            </div>

            {/* Policies & Links */}
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Code of Ethics
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Accessibility
              </a>
            </div>
          </div>

          {/* Academic Partners */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-4">
              In collaboration with leading academic institutions worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["IEEE", "ACM", "Springer", "Elsevier", "Scopus"].map((org, i) => (
                <div key={i} className="text-sm font-semibold text-gray-400 tracking-wider">
                  {org}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accent Line */}
      <div className="h-1" style={{ 
        background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryDark} 50%, ${primaryColor} 100%)`
      }} />
    </footer>
  );
}