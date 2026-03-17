import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import GroupManagementPage from '../pages/GroupManagementPage';
import LoginPage from '../pages/LoginPage';
import NetworkMappingPage from '../pages/NetworkMappingPage';
import QuestionnairePage from '../pages/QuestionnairePage';
import RegistrationPage from '../pages/RegistrationPage';
import InvitationCodePage from '../pages/InvitationCodePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join-group" element={<InvitationCodePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/group-management" element={<GroupManagementPage />} />
      <Route path="/assessment" element={<QuestionnairePage />} />
      <Route path="/network-mapping" element={<NetworkMappingPage />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}
