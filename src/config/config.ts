
// src/config/auth.config.ts

export const CONFIG = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    storageKeys: {
      accessToken: import.meta.env.VITE_STORAGE_ACCESS_TOKEN_KEY || 'sum_pp_access_token',
      refreshToken: import.meta.env.VITE_STORAGE_REFRESH_TOKEN_KEY || 'sum_pp_refresh_token',
      currentUser: import.meta.env.VITE_STORAGE_CURRENT_USER_KEY || 'sum_pp_current_user',
    },
  } as const;