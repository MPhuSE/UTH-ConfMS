import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Home, 
  FileText, 
  Upload, 
  Award, 
  User, 
  Settings,
  Users,
  Building,
  Mail,
  Shield,
  BarChart,
  LogOut,
  ChevronRight,
  Bell,
  UserCog,
  ClipboardList,
  CheckCircle,
  Gavel,
  Sparkles
} from "lucide-react";

export default function DashboardLayout() {
  const { role, user } = useAuthStore();

  // Color scheme - CFP Green Theme
  const colors = {
    primary: "#008689",       // Main teal/green color
    primaryLight: "#E6F4F5",  // Light background
    primaryDark: "#006A6D",   // Darker teal
    secondary: "#2D3748",     // Text dark
    accent: "#008689",        // Using primary as accent for consistency
  };

  const roleNames = Array.isArray(user?.role_names) && user.role_names.length
    ? user.role_names.map((r) => String(r || "").toLowerCase())
    : [String(role || "").toLowerCase()].filter(Boolean);

  const isAdmin = roleNames.includes("admin");
  const isChair = roleNames.includes("chair");
  const isReviewer = roleNames.includes("reviewer");
  const isAuthor = roleNames.includes("author") || roleNames.includes("authors");

  // Map role to display name
  const getRoleName = () => {
    if (isAdmin) return "Quản trị viên";
    if (isChair) return "Chủ tịch";
    if (isReviewer) return "Phản biện";
    if (isAuthor) return "Tác giả";
    return "Người dùng";
  };

  const displayName = user?.full_name || user?.name || user?.email || "Người dùng";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: "white",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "24px",
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Link
            to="/dashboard/overview"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <span style={{ color: "white", fontWeight: "800", fontSize: "20px" }}>
                UT
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "white", marginBottom: "2px" }}>
                UTH-Conf<span style={{ color: colors.primaryLight }}>MS</span>
              </h2>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>
                Hệ thống hội nghị
              </p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div
          style={{
            padding: "20px 24px",
            background: colors.primaryLight,
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "700",
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(0,134,137,0.25)",
              }}
            >
              {displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontWeight: "600",
                  color: colors.secondary,
                  fontSize: "15px",
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "white",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: colors.primary,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                <Sparkles size={12} />
                {getRoleName()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
          }}
        >
          {/* Common Links */}
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              color: "#64748B",
              textDecoration: "none",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryLight;
              e.currentTarget.style.color = colors.primary;
              e.currentTarget.querySelector("svg").style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#64748B";
              e.currentTarget.querySelector("svg").style.color = "#94A3B8";
            }}
          >
            <Home size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
            <span>Tổng quan</span>
          </Link>

          {/* Author Links */}
          {isAuthor && (
            <>
              <div style={{ marginTop: "24px", marginBottom: "12px" }}>
                <p
                  style={{
                    padding: "0 16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Tác giả
                </p>
              </div>

              <Link
                to="/dashboard/my-submissions"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <FileText size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Bài nộp của tôi</span>
              </Link>

              <Link
                to="/dashboard/submission"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Upload size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Nộp bài mới</span>
              </Link>

              <Link
                to="/dashboard/results"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Award size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Kết quả & Reviews</span>
              </Link>

              <Link
                to="/dashboard/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <User size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Hồ sơ</span>
              </Link>
            </>
          )}

          {/* Reviewer Links */}
          {isReviewer && (
            <>
              <div style={{ marginTop: "24px", marginBottom: "12px" }}>
                <p
                  style={{
                    padding: "0 16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Phản biện
                </p>
              </div>

              <Link
                to="/dashboard/reviewer/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <ClipboardList size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/dashboard/reviewer/assignments"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <FileText size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>My Assignments</span>
              </Link>

              <Link
                to="/dashboard/reviewer/reviews"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Award size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>My Reviews</span>
              </Link>

              <Link
                to="/dashboard/reviewer/check-coi"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Shield size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Check COI</span>
              </Link>
            </>
          )}

          {/* Chair Links */}
          {isChair && (
            <>
              <div style={{ marginTop: "24px", marginBottom: "12px" }}>
                <p
                  style={{
                    padding: "0 16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Chủ tịch
                </p>
              </div>

              <Link
                to="/dashboard/chair/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <UserCog size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Chair Dashboard</span>
              </Link>

              <Link
                to="/dashboard/chair/conferences"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Award size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Quản lý hội nghị</span>
              </Link>

              <Link
                to="/dashboard/chair/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Gavel size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Quản lý quyết định</span>
              </Link>

              <Link
                to="/dashboard/chair/coi"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Shield size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Quản lý COI</span>
              </Link>

              <Link
                to="/dashboard/audit-logs"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <FileText size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Audit Logs</span>
              </Link>
            </>
          )}

          {/* Admin Links */}
          {isAdmin && (
            <>
              <div style={{ marginTop: "24px", marginBottom: "12px" }}>
                <p
                  style={{
                    padding: "0 16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Quản trị
                </p>
              </div>

              <Link
                to="/dashboard/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Settings size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Admin Dashboard</span>
              </Link>

              <Link
                to="/dashboard/admin/users"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Users size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Quản lý người dùng</span>
              </Link>

              <Link
                to="/dashboard/admin/tenants"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Building size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Tenancy</span>
              </Link>

              <Link
                to="/dashboard/admin/smtp-config"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Mail size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>SMTP</span>
              </Link>

              <Link
                to="/dashboard/admin/quota-config"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <BarChart size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Quota</span>
              </Link>

              <Link
                to="/dashboard/admin/system-health"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <Shield size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>System Health</span>
              </Link>

              <Link
                to="/dashboard/audit-logs"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  color: "#64748B",
                  textDecoration: "none",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryLight;
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.querySelector("svg").style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.querySelector("svg").style.color = "#94A3B8";
                }}
              >
                <FileText size={20} style={{ color: "#94A3B8", transition: "color 0.3s ease" }} />
                <span>Audit Logs</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #E2E8F0",
            background: "#FAFAFA",
          }}
        >
          <Link
            to="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              color: "#EF4444",
              textDecoration: "none",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              fontSize: "14px",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.querySelector(".chevron").style.opacity = "1";
              e.currentTarget.querySelector(".chevron").style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.querySelector(".chevron").style.opacity = "0";
              e.currentTarget.querySelector(".chevron").style.transform = "translateX(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </div>
            <ChevronRight
              className="chevron"
              size={16}
              style={{ opacity: 0, transition: "all 0.3s ease" }}
            />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #E2E8F0",
            padding: "20px 32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: colors.secondary,
                  marginBottom: "4px",
                }}
              >
                Xin chào, <span style={{ color: colors.primary }}>{getRoleName()}</span>
              </h1>
              <p style={{ fontSize: "14px", color: "#64748B" }}>
                Chào mừng đến với hệ thống quản lý hội nghị
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Notifications */}
              <button
                style={{
                  position: "relative",
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Bell size={20} style={{ color: "#64748B" }} />
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "8px",
                    height: "8px",
                    background: "#EF4444",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              </button>

              {/* User Menu */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.secondary,
                      marginBottom: "2px",
                    }}
                  >
                    {displayName}
                  </p>
                  <p style={{ fontSize: "12px", color: "#64748B" }}>
                    {user?.email || "example@uth.edu.vn"}
                  </p>
                </div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(0,134,137,0.25)",
                  }}
                >
                  {displayName?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "32px", background: "#F8FAFC" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}