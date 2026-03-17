import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join-group" element={<InvitationCodePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/group-management" element={<GroupManagementPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/questionnaire-summary" element={<QuestionnaireSummaryPage />} />
        <Route path="/network-mapping" element={<NetworkMappingPage />} />
      </Routes>
    </BrowserRouter>
  );
}