import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//layouts
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";


import CfpPublicPage from "../../features/auth/pages/CfpPublicPage";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import Home from "../../features/dashboard/pages/Home";
import ForgotPassword from "../../features/auth/pages/ForgotPassword";
import AuthorProfile from "../../features/auth/pages/AuthorProfile";
import SmtpConfig from "../../features/auth/pages/SmtpConfig";
import DeadlineTrackConfig from "../../features/auth/pages/DeadlineTrackConfig";
import ConferenceList from "../../features/auth/pages/ConferenceList";
import TrackTopicManagement from "../../features/auth/pages/TrackTopicManagement";
import PaperSubmissionPage from "../../features/submission/PaperSubmissionPage";

import PcManagement from "../../features/auth/pages/PcManagement";

import AuditLogs from "../../features/dashboard/pages/AuditLogs";
import ReviewForm from "../../features/reviewer/ReviewForm";
import AssignedPaper from "../../features/reviewer/AssignedPapers";
import Proceeding from "../../features/dashboard/pages/ProceedingViews";




export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<CfpPublicPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />

                </Route>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Home />} />
                    <Route path="profile" element={<AuthorProfile />} />
                    <Route path="audit-logs" element={<AuditLogs/>} />
                    <Route path="smtp-config" element={<SmtpConfig />} />
                    <Route path="deadline-config" element={<DeadlineTrackConfig />} />
                    <Route path="conference-list" element={<ConferenceList />} />
                    <Route path="track-topic" element={<TrackTopicManagement />} />
                    <Route path="submission" element={<PaperSubmissionPage />} />

                    <Route path="review-form" element={<ReviewForm />} />
                    <Route path="Assigned-paper" element={<AssignedPaper />} />
                    <Route path="prooceedings" element={<Proceeding />} />

                </Route>
            </Routes>
        </BrowserRouter>
    )
}