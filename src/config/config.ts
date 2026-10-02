
// src/config/auth.config.ts


export const CONFIG = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    storageKeys: {
      accessToken: 'sum_access_token',
      refreshToken: 'sum_refresh_token',
      currentUser: 'sum_current_user',
    },
  } as const;


  