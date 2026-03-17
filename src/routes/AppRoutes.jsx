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
      {/* 默认首页 */}
      <Route path="/" element={<DashboardPage />} />

      {/* 认证相关 */}
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 核心功能 */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/join-group" element={<InvitationCodePage />} />
      <Route path="/group-management" element={<GroupManagementPage />} />

      {/* ✅ Assessment（问卷） */}
      <Route path="/assessment" element={<QuestionnairePage />} />
      <Route path="/assessment-summary" element={<QuestionnaireSummaryPage />} />

      {/* 网络图 */}
      <Route path="/network-mapping" element={<NetworkMappingPage />} />

      {/* ✅ 兼容旧路径（防止你之前写的 questionnaire 还在用） */}
      <Route path="/questionnaire" element={<Navigate to="/assessment" replace />} />
      <Route path="/questionnaire-summary" element={<Navigate to="/assessment-summary" replace />} />

      {/* ✅ 防止白屏 */}
      <Route path="*" element={<div style={{ padding: 20 }}>404 Not Found</div>} />
    </Routes>
  );
}