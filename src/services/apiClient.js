// services/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

function safeParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const apiPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${API_BASE_URL}${apiPath}`;

  const token = localStorage.getItem('token');

  const headers = {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    const rawBody = await response.text();
    const data = safeParseJson(rawBody);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || data?.error || `Request failed with status ${response.status}`,
        details: data?.details || {},
      };
    }

    if (response.status === 204 || rawBody.length === 0) {
      return { success: true };
    }

    return data ?? { success: true, data: rawBody };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    console.error('Network error:', error);
    throw {
      status: 500,
      message: 'Network error - please check if backend is running',
      details: {},
    };
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};