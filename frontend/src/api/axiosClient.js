import axios from 'axios';

// baseURL strictly from VITE_API_URL (with fallbacks for dev/backwards compatibility)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for httpOnly cookies & CORS credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token if available & handle FormData
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ft_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, delete Content-Type so browser sets correct multipart boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh mutex / queue to prevent concurrent refresh races
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Auto Token Refresh and 401 redirection to /login
axiosClient.interceptors.response.use(
  (response) => {
    // If blob or arraybuffer, return raw response data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('ft_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          if (res.data?.success && res.data?.data?.accessToken) {
            const newToken = res.data.data.accessToken;
            localStorage.setItem('ft_access_token', newToken);
            if (res.data.data.refreshToken) {
              localStorage.setItem('ft_refresh_token', res.data.data.refreshToken);
            }
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('ft_access_token');
          localStorage.removeItem('ft_refresh_token');
          localStorage.removeItem('ft_user');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
        localStorage.removeItem('ft_access_token');
        localStorage.removeItem('ft_refresh_token');
        localStorage.removeItem('ft_user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const customError = error.response?.data?.error || {
      message: error.message || 'Network request failed',
      code: 'NETWORK_ERROR',
      statusCode: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default axiosClient;
