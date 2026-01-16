import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Auth & Public
import CfpPublicPage from "../../features/auth/pages/CfpPublicPage";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import ForgotPassword from "../../features/auth/pages/ForgotPassword";

// Dashboard Components
import DashboardSelector from "../../features/dashboard/pages/DashboardSelector";

import MySubmissionsPage from "../../features/author/pages/MySubmissionsPage";
import SubmissionDetailPage from "../../features/author/pages/SubmissionDetailPage";
import PaperSubmissionPage from "../../features/author/pages/PaperSubmissionPage";
import AuthorProfile from "../../features/auth/pages/AuthorProfile";
import AuditLogs from "../../features/dashboard/pages/AuditLogs";
import AuthorDashboard from "../../features/dashboard/AuthorDashboard";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import EditSubmissionPage from "../../features/author/pages/EditSubmissionPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<CfpPublicPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/verify-email" element= {<VerifyEmail />} />
                </Route>

                {/* 2. Dashboard Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Tự động điều hướng dựa trên Role */}
                    <Route index element={<DashboardSelector />} />
                    
                    {/* Author Routes */}
                    <Route path="overview" element={<AuthorDashboard />} />
                    <Route path="my-submissions" element={<MySubmissionsPage />} />
                    <Route path="submission" element={<PaperSubmissionPage />} />
                    <Route path="submission/edit/:paperId" element={<EditSubmissionPage />} />
                    <Route path="submission/:id" element={<SubmissionDetailPage />} /> 
                    <Route path="profile" element={<AuthorProfile />} />

                    {/* Admin/Chair Only Routes (Chỉ cho phép Admin truy cập) */}
                    <Route path="audit-logs" element={<AuditLogs />} />
                </Route>

                <Route path="*" element={<div className="p-10 text-center text-2xl">404 - Trang không tồn tại</div>} />
            </Routes>
        </BrowserRouter>
    );
}