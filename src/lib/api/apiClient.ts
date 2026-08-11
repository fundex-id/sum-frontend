// src/api/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from '../../../node_modules/axios/index';
import { CONFIG } from '../../config/config';
import { tokenStorage } from '../storage/tokenStorage';

// ------------------------------------------
// 1. PUBLIC CLIENT
// ------------------------------------------
export const apiPublic = axios.create({
  baseURL: CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ------------------------------------------
// 2. PRIVATE CLIENT
// ------------------------------------------
export const apiPrivate = axios.create({
  baseURL: CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Otomatis suntikkan Access Token
apiPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Variables untuk menangani konkurensi request saat refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Menangani Error 401 & Auto Refresh Token
apiPrivate.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Jika error 401 dan request belum pernah di-retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Jika sedang ada proses refresh token yang berjalan, masukkan request ini ke antrean
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return apiPrivate(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      // Jika tidak ada Refresh Token, paksa Logout
      if (!refreshToken) {
        tokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Panggil endpoint refresh token menggunakan instance apiPublic
        const response = await apiPublic.post('/auth/refresh', { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Simpan token baru
        tokenStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);

        processQueue(null, newAccessToken);

        // Ulangi request awal yang sempat gagal
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiPrivate(originalRequest);
      } catch (refreshError) {
        // Jika refresh token juga gagal/expired -> Logout penuh
        processQueue(refreshError as AxiosError, null);
        tokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);