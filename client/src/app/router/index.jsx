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
import ResetPasswordConfirm from "../../features/auth/pages/ResetPasswordConfirm"

// Dashboard Components
import DashboardSelector from "../../features/dashboard/pages/DashboardSelector";

import MySubmissionsPage from "../../features/author/pages/MySubmissionsPage";
import SubmissionDetailPage from "../../features/author/pages/SubmissionDetailPage";
import PaperSubmissionPage from "../../features/author/pages/PaperSubmissionPage";
import CameraReadyUploadPage from "../../features/author/pages/CameraReadyUploadPage";
import ViewResultsPage from "../../features/author/pages/ViewResultsPage";
import AuthorProfile from "../../features/auth/pages/AuthorProfile";
import AuditLogs from "../../features/dashboard/pages/AuditLogs";
import AuthorDashboard from "../../features/dashboard/AuthorDashboard";
import AdminDashboard from "../../features/dashboard/AdminDashboard";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import EditSubmissionPage from "../../features/author/pages/EditSubmissionPage";
import UserManagementPage from "../../features/admin/pages/UserManagementPage";
import SmtpConfigPage from "../../features/admin/pages/SmtpConfigPage";
import QuotaConfigPage from "../../features/admin/pages/QuotaConfigPage";
import SystemHealthPage from "../../features/admin/pages/SystemHealthPage";
import TenantManagementPage from "../../features/admin/pages/TenantManagementPage";

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
                    <Route path= "/reset-password" element = {<ResetPasswordConfirm />}/>
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
                    <Route path="submission/:id/camera-ready" element={<CameraReadyUploadPage />} />
                    <Route path="results" element={<ViewResultsPage />} />
                    <Route path="profile" element={<AuthorProfile />} />

                    {/* Admin/Chair Only Routes */}
                    <Route
                        path="admin"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/users"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <UserManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="audit-logs"
                        element={
                            <ProtectedRoute allowRoles={["admin", "chair"]}>
                                <AuditLogs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/smtp-config"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <SmtpConfigPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/quota-config"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <QuotaConfigPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/system-health"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <SystemHealthPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/tenants"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <TenantManagementPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route path="*" element={<div className="p-10 text-center text-2xl">404 - Trang không tồn tại</div>} />
            </Routes>
        </BrowserRouter>
    );
}