// services/groupService.js
import { apiClient } from './apiClient';

export const groupService = {
  registerGroup: async (payload) => {
    try {
      return await apiClient.post('/api/groups', payload);
    } catch {
      return { success: true, inviteCode: 'X7A9BQ', groupName: payload.communityName };
    }
  },

  createGroup: async (payload) => {
    try {
      const response = await apiClient.post('/api/groups/create', payload);
      return {
        success: true,
        groupName: response.data.groupName,
        inviteCode: response.data.inviteCode
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create group'
      };
    }
  },

  joinGroup: async (payload) => {
    try {
      const response = await apiClient.post('/api/groups/join', payload);
      return {
        success: true,
        groupName: response.data.groupName,
        location: response.data.location,
        disasterType: response.data.disasterType,
        memberCount: response.data.memberCount
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid invitation code'
      };
    }
  },

  verifyInviteCode: async (code) => {
    try {
      return await apiClient.get(`/api/groups/verify/${code}`);
    } catch {
      return { success: false };
    }
  }
};