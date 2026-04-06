// services/authService.js
import { apiClient } from './apiClient';

export const authService = {
  login: async (credentials) => {
    try {
      // Simulate a group leader account
      if (import.meta.env.DEV && 
          credentials.email === 'leader@example.com' && 
          credentials.password === 'Leader123') {
        console.log('[DEV] Mock group leader login');
        return {
          success: true,
          data: {
            id: 999,
            name: 'Group Leader',
            email: 'leader@example.com',
            role: 'groupLeader',
            token: 'mock-leader-token'
          }
        };
      }
      
      const response = await apiClient.post('/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role || 'user',
            token: response.data.token,
            expiresIn: response.data.expiresIn
          }
        };
      } else {
        return {
          success: false,
          error: response.message || 'Login failed',
          details: response.details || {},
          status: response.status
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
        details: error.details || {},
        status: error.status
      };
    }
  },

  register: async (formData) => {
    try {

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        communityName: formData.communityName,
        disasterType: formData.disasterType,
        region: formData.region
      };

      console.log('Register payload:', payload); 

      const response = await apiClient.post('/register', payload);
      
      console.log('Register response:', response); 

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            userId: response.data.userId,
            groupName: response.data.groupName,
            inviteCode: response.data.inviteCode,
            createdAt: response.data.createdAt
          }
        };
      } else {
        return {
          success: false,
          error: response.message || 'Registration failed',
          details: response.details || {},
          status: response.status
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
        details: error.details || {},
        status: error.status
      };
    }
  },

  verifyToken: async () => {
    try {
      const response = await apiClient.get('/verify');
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return { 
        success: false,
        error: error.message 
      };
    }
  }
};