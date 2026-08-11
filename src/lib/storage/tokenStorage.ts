// src/utils/tokenStorage.ts
import { CONFIG } from '../../config/config';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(CONFIG.storageKeys.accessToken);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(CONFIG.storageKeys.accessToken, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(CONFIG.storageKeys.refreshToken);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(CONFIG.storageKeys.refreshToken, token);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(CONFIG.storageKeys.accessToken, accessToken);
    localStorage.setItem(CONFIG.storageKeys.refreshToken, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(CONFIG.storageKeys.accessToken);
    localStorage.removeItem(CONFIG.storageKeys.refreshToken);
  },
};