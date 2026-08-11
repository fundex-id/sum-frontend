// src/lib/storage/userStorage.ts
import { CONFIG } from '../../config/config';
import { UsersProfile } from '../../features/auth/types/auth.type';


export const userStorage = {
  getCurrentUser: <T = UsersProfile>(): T | null => {
    const raw = localStorage.getItem(CONFIG.storageKeys.currentUser);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: unknown): void => {
    localStorage.setItem(CONFIG.storageKeys.currentUser, JSON.stringify(user));
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(CONFIG.storageKeys.currentUser);
  },
};