// services/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {

  const apiPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${API_BASE_URL}${apiPath}`;
  
  console.log('Request URL:', url);
  
  const token = localStorage.getItem('token');
  
  const headers = {
    ...defaultHeaders,
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {

      throw {
        status: response.status,
        message: data.message || data.error || 'Request failed',
        details: data.details || {}
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    console.error('Network error:', error);
    throw {
      status: 500,
      message: 'Network error - please check if backend is running',
      details: {}
    };
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};