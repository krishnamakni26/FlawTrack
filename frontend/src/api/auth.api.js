import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  refresh: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),
};
