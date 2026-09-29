import axiosClient from './axiosClient';

export const assetsApi = {
  list: (params) => axiosClient.get('/assets', { params }),
  getById: (id) => axiosClient.get(`/assets/${id}`),
  create: (data) => axiosClient.post('/assets', data),
  update: (id, data) => axiosClient.put(`/assets/${id}`, data),
  delete: (id) => axiosClient.delete(`/assets/${id}`),
};

export const dashboardApi = {
  getSummary: () => axiosClient.get('/dashboard/summary'),
};

export const settingsApi = {
  get: () => axiosClient.get('/settings'),
  update: (settings) => axiosClient.put('/settings', settings),
};

export const usersApi = {
  list: (params) => axiosClient.get('/users', { params }),
  create: (userData) => axiosClient.post('/users', userData),
  update: (id, userData) => axiosClient.patch(`/users/${id}`, userData),
};

export const jobsApi = {
  trigger: (jobName) => axiosClient.post(`/admin/jobs/${jobName}/run`),
  getStatus: () => axiosClient.get('/admin/jobs/status'),
};

export const notificationsApi = {
  list: () => axiosClient.get('/notifications'),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch('/notifications/read-all'),
};

export const auditApi = {
  list: (params) => axiosClient.get('/audit', { params }),
};
