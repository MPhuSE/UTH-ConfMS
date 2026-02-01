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
import GoogleCallback from "../../features/auth/pages/GoogleCallback";

// Dashboard Components
import DashboardSelector from "../../features/dashboard/pages/DashboardSelector";

import MySubmissionsPage from "../../features/author/pages/MySubmissionsPage";
import SubmissionDetailPage from "../../features/author/pages/SubmissionDetailPage";
import PaperSubmissionPage from "../../features/author/pages/PaperSubmissionPage";
import CameraReadyUploadPage from "../../features/author/pages/CameraReadyUploadPage";
import ViewResultsPage from "../../features/author/pages/ViewResultsPage";
import ConferenceDetailPage from "../../features/author/pages/ConferenceDetailPage";
import AuthorProfile from "../../features/auth/pages/AuthorProfile";
import AuditLogs from "../../features/dashboard/pages/AuditLogs";
import AuthorDashboard from "../../features/dashboard/AuthorDashboard";
import AdminDashboard from "../../features/dashboard/AdminDashboard";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import EditSubmissionPage from "../../features/author/pages/EditSubmissionPage";
import UserManagementPage from "../../features/admin/pages/UserManagementPage";
import SystemSettingsPage from "../../features/admin/pages/SystemSettingsPage";
import SystemHealthPage from "../../features/admin/pages/SystemHealthPage";
import TenantManagementPage from "../../features/admin/pages/TenantManagementPage";
import AIFeatureFlagsPage from "../../features/admin/pages/AIFeatureFlagsPage";

// Chair
import ChairDashboard from "../../features/dashboard/ChairDashboard";
import AssignmentManagementPage from "../../features/Chair/pages/AssignmentManagementPage";
import DecisionManagementPage from "../../features/Chair/pages/DecisionManagementPage";
import ProceedingsExportPage from "../../features/Chair/pages/ProceedingsExportPage";
import BulkNotificationsPage from "../../features/Chair/pages/BulkNotificationsPage";
import ConferenceManagementPage from "../../features/Chair/pages/ConferenceManagementPage";
import COIManagementPage from "../../features/Chair/pages/COIManagementPage";
import ScheduleManagementPage from "../../features/Chair/pages/ScheduleManagementPage";
import ReviewerManagementPage from "../../features/Chair/pages/ReviewerManagementPage";
import ReviewProgressPage from "../../features/Chair/pages/ReviewProgressPage";
import EmailTemplatesPage from "../../features/Chair/pages/EmailTemplatesPage";

// Reviewer
import ReviewerDashboard from "../../features/reviewer/ReviewerDashboard";
import ReviewForm from "../../features/reviewer/ReviewForm";
import BiddingCOIPage from "../../features/reviewer/BiddingCOIPage";
import MyAssignmentsPage from "../../features/reviewer/pages/MyAssignmentsPage";
import MyReviewsPage from "../../features/reviewer/pages/MyReviewsPage";
import CheckCOIPage from "../../features/reviewer/pages/CheckCOIPage";

// Discussion & Rebuttal
import InternalDiscussion from "../../features/dashboard/pages/InternalDisscusion";
import AuthorRebuttalPage from "../../features/rebuttal/AuthorRebuttalPage";
import ReviewerRebuttalPage from "../../features/rebuttal/ReviewerRebuttalPage";

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
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPasswordConfirm />} />
                    <Route path="/auth/google/callback" element={<GoogleCallback />} />
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
                    <Route path="conference/:conferenceId" element={<ConferenceDetailPage />} />
                    <Route path="my-submissions" element={<MySubmissionsPage />} />
                    <Route path="submission" element={<PaperSubmissionPage />} />
                    <Route path="submission/edit/:paperId" element={<EditSubmissionPage />} />
                    <Route path="submission/:id" element={<SubmissionDetailPage />} />
                    <Route path="submission/:id/camera-ready" element={<CameraReadyUploadPage />} />
                    <Route path="results" element={<ViewResultsPage />} />
                    <Route path="profile" element={<AuthorProfile />} />
                    <Route
                        path="rebuttal/:submissionId"
                        element={
                            <ProtectedRoute allowRoles={["author"]}>
                                <AuthorRebuttalPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Internal discussion (Chair/Reviewer) */}
                    <Route
                        path="submission/:id/discussion"
                        element={
                            <ProtectedRoute allowRoles={["chair", "reviewer", "admin"]}>
                                <InternalDiscussion />
                            </ProtectedRoute>
                        }
                    />

                    {/* Chair Routes */}
                    <Route
                        path="chair/dashboard"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <ChairDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/conferences"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <ConferenceManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/assignments/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <AssignmentManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/decisions/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <DecisionManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/notifications/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <BulkNotificationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/proceedings/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <ProceedingsExportPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/coi/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <COIManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/coi"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <COIManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/schedule/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <ScheduleManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/reviewers/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <ReviewerManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/review-progress/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <ReviewProgressPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chair/email-templates/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["chair", "admin"]}>
                                <EmailTemplatesPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Reviewer Routes */}
                    <Route
                        path="reviewer/dashboard"
                        element={
                            <ProtectedRoute allowRoles={["reviewer"]}>
                                <ReviewerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reviewer/assignments"
                        element={
                            <ProtectedRoute allowRoles={["reviewer"]}>
                                <MyAssignmentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reviewer/reviews"
                        element={
                            <ProtectedRoute allowRoles={["reviewer"]}>
                                <MyReviewsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reviewer/review/:submissionId"
                        element={
                            <ProtectedRoute allowRoles={["reviewer"]}>
                                <ReviewForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reviewer/bidding/:conferenceId"
                        element={
                            <ProtectedRoute allowRoles={["reviewer"]}>
                                <BiddingCOIPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reviewer/check-coi"
                        element={
                            <ProtectedRoute allowRoles={["reviewer"]}>
                                <CheckCOIPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reviewer/rebuttal/:submissionId"
                        element={
                            <ProtectedRoute allowRoles={["reviewer", "chair", "admin"]}>
                                <ReviewerRebuttalPage />
                            </ProtectedRoute>
                        }
                    />

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
                        path="admin/settings"
                        element={
                            <ProtectedRoute allowRoles={["admin"]}>
                                <SystemSettingsPage />
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