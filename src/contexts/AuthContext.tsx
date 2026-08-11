// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../features/auth/services/authService';
import { LoginRequest } from '../features/auth/dtos/auth.dto';
import { tokenStorage } from '../lib/storage/tokenStorage';
import { userStorage } from '../lib/storage/userStorage';

interface UserProfile {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inisialisasi state saat halaman di-refresh
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    const storedUser = userStorage.getCurrentUser(); 

    if (token && storedUser) {
      setUser(storedUser);
    } else {
      authService.clearAuthSession();
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginRequest) => {
    setIsLoading(true); // Opsional jika loading dikontrol di context juga
    try {
      const res = await authService.login(payload);
      if (res.data) {
        setUser({
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
        });
      }
    } catch (error) {
      // WAJIB DI-THROW KEMBALI agar bisa ditangkap oleh LoginPage.tsx
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};