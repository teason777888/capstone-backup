import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RegistrationPage from "../pages/RegistrationPage";
import LoginPage from "../pages/LoginPage";
import InvitationCodePage from "../pages/InvitationCodePage";
import DashboardPage from "../pages/DashboardPage";
import GroupManagementPage from "../pages/GroupManagementPage";
import QuestionnairePage from "../pages/QuestionnairePage";
import QuestionnaireSummaryPage from "../pages/QuestionnaireSummaryPage";
import NetworkMappingPage from "../pages/NetworkMappingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/join-group" element={<InvitationCodePage />} />
      <Route path="/group-management" element={<GroupManagementPage />} />
      <Route path="/assessment" element={<QuestionnairePage />} />
      <Route path="/assessment-summary" element={<QuestionnaireSummaryPage />} />
      <Route path="/network-mapping" element={<NetworkMappingPage />} />
      <Route path="/questionnaire" element={<Navigate to="/assessment" replace />} />
      <Route path="/questionnaire-summary" element={<Navigate to="/assessment-summary" replace />} />
      <Route path="*" element={<div style={{ padding: 20 }}>404 Not Found</div>} />
    </Routes>
  );
}