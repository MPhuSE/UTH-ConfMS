import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Public
import CfpPublicPage from "../../features/auth/pages/CfpPublicPage";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import ForgotPassword from "../../features/auth/pages/ForgotPassword";

// Dashboard - Author
import AuthorDashboard from "../../features/dashboard/AuthorDashboard";
import AuthorProfile from "../../features/auth/pages/AuthorProfile";
import PaperSubmissionPage from "../../features/submission/PaperSubmissionPage";
import SubmissionDetailPage from "../../features/dashboard/pages/SubmissionDetailPage";

// Admin / Chair (để sẵn)
import SmtpConfig from "../../features/auth/pages/SmtpConfig";
import DeadlineTrackConfig from "../../features/auth/pages/DeadlineTrackConfig";
import ConferenceList from "../../features/auth/pages/ConferenceList";
import TrackTopicManagement from "../../features/auth/pages/TrackTopicManagement";
import PcManagement from "../../features/auth/pages/PcManagement";
import AuditLogs from "../../features/dashboard/pages/AuditLogs";
import SubmissionManagement from "../../features/dashboard/pages/SubmissionManagement";
import InternalDiscussion from "../../features/dashboard/pages/InternalDisscusion";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<CfpPublicPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Route>

        {/* AUTHOR DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowRoles={["authors"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AuthorDashboard />} />
          <Route path="profile" element={<AuthorProfile />} />
          <Route path="submission" element={<PaperSubmissionPage />} />
          <Route path="submission/:id" element={<SubmissionDetailPage />} />
        </Route>

        {/*CHAIR / ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRoles={["ADMIN", "CHAIR"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="smtp-config" element={<SmtpConfig />} />
          <Route path="deadline-config" element={<DeadlineTrackConfig />} />
          <Route path="conference-list" element={<ConferenceList />} />
          <Route path="track-topic" element={<TrackTopicManagement />} />
          <Route path="pc-management" element={<PcManagement />} />
          <Route path="submission" element={<SubmissionManagement />} />
          <Route path="submission/:id" element={<SubmissionDetailPage />} />
          <Route path="submission/:id/discussion" element={<InternalDiscussion />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
