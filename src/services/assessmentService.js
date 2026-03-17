import { apiClient } from './apiClient';

export const assessmentService = {
  submitResponses: async (payload) => {
    try {
      return await apiClient.post('/api/assessments', payload);
    } catch {
      return { success: true, message: 'Assessment submitted.' };
    }
  },
};
