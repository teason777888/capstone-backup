// services/groupService.js
import { apiClient } from './apiClient';

export const groupService = {

  generateInviteCode: async () => {
    try {
      const response = await apiClient.post('/api/v1/invitations/generate');
      console.log('Generate invite code response:', response);
      
      const inviteCode = response.data?.data?.inviteCode || response.data?.inviteCode;
      
      return {
        success: true,
        inviteCode: inviteCode || 'X7A9BQ'
      };
    } catch (error) {
      console.error('Failed to generate invite code:', error);
      if (import.meta.env.DEV) {
        return {
          success: true,
          inviteCode: 'X7A9BQ'
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to generate invite code'
      };
    }
  },

  createGroup: async (payload) => {
    try {
      return {
        success: true,
        groupName: payload.name,
        inviteCode: payload.inviteCode
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create group'
      };
    }
  },

  joinGroup: async (payload) => {
    try {
      if (import.meta.env.DEV && payload.inviteCode === 'X7A9BQ') {
        return {
          success: true,
          groupName: 'Demo Recovery Group',
          location: 'Sydney',
          disasterType: 'Flood',
          memberCount: 5
        };
      }
      return {
        success: false,
        error: 'Invalid invitation code'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to join group'
      };
    }
  }
};