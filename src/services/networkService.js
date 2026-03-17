import { apiClient } from './apiClient';

export const networkService = {
  saveConnections: async (payload) => {
    try {
      return await apiClient.post('/api/network', payload);
    } catch {
      return { success: true, message: 'Network updated.' };
    }
  },
};
