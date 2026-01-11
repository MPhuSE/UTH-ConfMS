import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//layouts
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";



//route auth
import CfpPublicPage from "../../features/auth/pages/CfpPublicPage";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import Home from "../../features/dashboard/pages/Home";
import ForgotPassword from "../../features/auth/pages/ForgotPassword";
import AuthorProfile from "../../features/auth/pages/AuthorProfile";
// import SmtpConfig from "../../features/auth/pages/SmtpConfig";
// import DeadlineTrackConfig from "../../features/auth/pages/DeadlineTrackConfig";
// import ConferenceList from "../../features/auth/pages/ConferenceList";
// import TrackTopicManagement from "../../features/auth/pages/TrackTopicManagement";
// import PaperSubmissionPage from "../../features/submission/PaperSubmissionPage";

import PcManagement from "../../features/auth/pages/PcManagement";
import DashboardSelector from "../../features/dashboard/pages/DashboardSelector";

import AuditLogs from "../../features/dashboard/pages/AuditLogs";
import MySubmissionsPage from "../../features/author/pages/MySubmissionsPage";
// import ReviewForm from "../../features/reviewer/ReviewForm";
// import AssignedPaper from "../../features/reviewer/AssignedPapers";
// import DashboardSelector from "../../features/dashboard/pages/DashboardSelector";

// New pages
// import MySubmissionsPage from "../../features/author/pages/MySubmissionsPage";
// import SubmissionDetailPage from "../../features/author/pages/SubmissionDetailPage";
// import ReviewerDashboard from "../../features/reviewer/pages/ReviewerDashboard";
// import AssignmentManagementPage from "../../features/chair/pages/AssignmentManagementPage";
// import DecisionManagementPage from "../../features/chair/pages/DecisionManagementPage";
// import UserManagementPage from "../../features/admin/pages/UserManagementPage";


const Unauthorized = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">Không có quyền truy cập</h1>
        <p className="text-gray-600">Bạn không được phép truy cập trang này.</p>
    </div>
);



export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<CfpPublicPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                </Route>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardSelector />} />
                    <Route path="profile" element={<AuthorProfile />} />
                    <Route path="my-submissions" element={<MySubmissionsPage />} />
                    <Route path="audit-logs" element={<AuditLogs/>} />
                    {/* <Route path="smtp-config" element={<SmtpConfig />} />
                    <Route path="deadline-config" element={<DeadlineTrackConfig />} />
                    <Route path="conference-list" element={<ConferenceList />} />
                    <Route path="track-topic" element={<TrackTopicManagement />} />
                    <Route path="submission" element={<PaperSubmissionPage />} />
                    <Route path="submission/:paperId" element={<PaperSubmissionPage />} />
                    
                    <Route path="submission/:id" element={<SubmissionDetailPage />} /> */}

                    {/* Reviewer routes */}
                    {/* <Route path="reviewer/dashboard" element={<ReviewerDashboard />} />
                    <Route path="review-form" element={<ReviewForm />} />
                    <Route path="Assigned-paper" element={<AssignedPaper />} /> */}

                    {/* Chair routes */}
                    {/* <Route path="chair/assignments/:conferenceId" element={<AssignmentManagementPage />} />
                    <Route path="chair/decisions/:conferenceId" element={<DecisionManagementPage />} /> */}

                    {/* Admin routes */}
                    {/* <Route path="admin/users" element={<UserManagementPage />} /> */}
                   

                </Route>
            </Routes>
        </BrowserRouter>
    )
}