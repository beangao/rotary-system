import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークン付与）
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Members API
export const membersApi = {
  getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/members', { params }),
  getById: (id: string) => api.get(`/members/${id}`),
  create: (data: Record<string, unknown>) => api.post('/members', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
  sendInvitation: (id: string) => api.post(`/members/${id}/invite`),
};

// Events API
export const eventsApi = {
  getAll: (params?: { upcoming?: boolean; page?: number; limit?: number; status?: string; category?: string; dateFrom?: string; dateTo?: string }) =>
    api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  getAttendances: (id: string) => api.get(`/events/${id}/attendances`),
  proxyAttendance: (eventId: string, memberId: string, data: { status: string; comment?: string }) =>
    api.put(`/events/${eventId}/attendances/${memberId}`, data),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  getById: (id: string) => api.get(`/notifications/${id}`),
  create: (data: Record<string, unknown>) => api.post('/notifications', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Club API
export const clubApi = {
  get: () => api.get('/club'),
  update: (data: Record<string, unknown>) => api.put('/club', data),
};

// Admins API
export const adminsApi = {
  getAll: () => api.get('/admins'),
  getById: (id: string) => api.get(`/admins/${id}`),
  create: (data: Record<string, unknown>) => api.post('/admins', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/admins/${id}`, data),
  delete: (id: string) => api.delete(`/admins/${id}`),
};
