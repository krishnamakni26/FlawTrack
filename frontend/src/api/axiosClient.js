import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Token Refresh
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('vt_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (res.data?.success && res.data?.data?.accessToken) {
            const newToken = res.data.data.accessToken;
            localStorage.setItem('vt_access_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest).then((r) => r.data);
          }
        } catch (refreshErr) {
          localStorage.removeItem('vt_access_token');
          localStorage.removeItem('vt_refresh_token');
          localStorage.removeItem('vt_user');
          window.location.href = '/login';
        }
      }
    }

    const customError = error.response?.data?.error || {
      message: error.message || 'Network request failed',
      code: 'NETWORK_ERROR',
    };
    return Promise.reject(customError);
  }
);

export default axiosClient;
