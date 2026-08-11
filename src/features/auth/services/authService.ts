// src/features/auth/services/authService.ts
import axios, { AxiosError } from 'axios';
import { apiPrivate, apiPublic } from '../../../lib/api/apiClient';
import { ApiBaseResponse } from '../../../types/api-base.type'; // Sesuaikan path import
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../dtos/auth.dto';
import { Tokens } from '../types/auth.type';
import { tokenStorage } from '../../../lib/storage/tokenStorage';
import { userStorage } from '../../../lib/storage/userStorage';


const PREFIX_AUTH = '/auth';

export const authService = {
  // 1. POST /auth/login

  login: async (payload: LoginRequest): Promise<ApiBaseResponse<LoginResponse>> => {
    const response = await apiPublic.post<ApiBaseResponse<LoginResponse>>(`${PREFIX_AUTH}/login`, payload);
    
    // Simpan token & currentUser data ke storage jika berhasil
    if (response.data?.data) {
      authService.setAuthSession(response.data.data);
    }
    return response.data;
  },
  

  // 2. POST /auth/register (Menggunakan apiPublic)
  register: async (payload: RegisterRequest): Promise<ApiBaseResponse<RegisterResponse>> => {
    const response = await apiPublic.post<ApiBaseResponse<RegisterResponse>>(`${PREFIX_AUTH}/register`, payload);
    return response.data;
  },

  // 3. POST /auth/logout (Menggunakan apiPrivate karena butuh akses token)
  logout: async (): Promise<void> => {
    try {
      await apiPrivate.post(`${PREFIX_AUTH}/logout`);
    } catch (error) {
      console.warn('Logout API call failed, proceeding to clear local session.');
    } finally {
      authService.clearAuthSession();
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiBaseResponse<Tokens>> => {
    const response = await apiPublic.post<ApiBaseResponse<Tokens>>(`${PREFIX_AUTH}/refresh`, { refreshToken });
    
    if (response.data?.data?.accessToken) {
      // Gunakan helper tokenStorage untuk menyimpan token baru
      tokenStorage.setTokens(
        response.data.data.accessToken, 
        response.data.data.refreshToken || refreshToken
      );
    }
    return response.data;
  },
  
  

  // --- HELPER STORAGE UTILITIES ---
  
  // setAuthSession: (authData: LoginResponse) => {
  //   // 1. Simpan token menggunakan helper terpusat
  //   tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    
  //   // 2. Simpan data profil (tanpa token) agar aman & mudah diakses UI
  //   const userProfile = {
  //     id: authData.id,
  //     email: authData.email,
  //     role: authData.role,
  //   };
  //   localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
  // },

  // // 4. POST /auth/refresh
  // refreshToken: async (refreshToken: string): Promise<ApiBaseResponse<Tokens>> => {
  //   const response = await publicClient.post<ApiBaseResponse<Tokens>>('/refresh', { refreshToken });
  //   if (response.data?.data?.accessToken) {
  //     localStorage.setItem(TOKEN_KEY, response.data.data.accessToken);
  //     if (response.data.data.refreshToken) {
  //       localStorage.setItem(REFRESH_TOKEN_KEY, response.data.data.refreshToken);
  //     }
  //   }
  //   return response.data;
  // },

  // --- HELPER STORAGE UTILITIES ---
  // setAuthSession: (authData: LoginResponse) => {
  //   // 1. Simpan token menggunakan helper terpusat
  //   tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    
  //   // 2. Simpan data profil (tanpa token) agar aman & mudah diakses UI
  //   const userProfile = {
  //     id: authData.id,
  //     email: authData.email,
  //     role: authData.role,
  //   };
  //   localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
  // },


  setAuthSession: (authData: LoginResponse) => {
    // 1. Simpan token menggunakan helper terpusat
    tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    
    // 2. Simpan data profil sebagai currentUser agar aman & mudah diakses UI
    const currentUserProfile = {
      id: authData.id,
      email: authData.email,
      role: authData.role,
    };
    
    // Gunakan helper userStorage yang sudah disesuaikan namanya
    userStorage.setCurrentUser(currentUserProfile);
  },
  clearAuthSession: () => {
    // Hapus token via helper
    tokenStorage.clearTokens();
    
    // Hapus data currentUser via helper
    userStorage.clearCurrentUser();
  },

  // getAccessToken: (): string | null => {
  //   return localStorage.getItem(TOKEN_KEY);
  // },

  // getStoredUser: (): { id: string; email: string; role: string } | null => {
  //   const rawUser = localStorage.getItem(USER_KEY);
  //   if (!rawUser) return null;
  //   try {
  //     return JSON.parse(rawUser);
  //   } catch {
  //     return null;
  //   }
  // },

  getCurrentUser: (): { id: string; email: string; role: string } | null => {
    // Ambil data langsung dari helper storage
    return userStorage.getCurrentUser();
  },
};