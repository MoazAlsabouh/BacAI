import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from '../api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  login: async (token, user) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
    set({ token, user, isLoading: false });
  },
  logout: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
    } else {
      await SecureStore.deleteItemAsync('token');
    }
    set({ token: null, user: null, isLoading: false });
  },
  checkAuth: async () => {
    try {
      const token = Platform.OS === 'web' 
        ? localStorage.getItem('token') 
        : await SecureStore.getItemAsync('token');
        
      if (!token) {
        set({ isLoading: false });
        return;
      }
      
      const res = await api.get('/api/student/auth/me');
      set({ token, user: res.data.student, isLoading: false });
    } catch (error) {
      console.error("Auth check failed:", error);
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem('token');
        } else {
          await SecureStore.deleteItemAsync('token');
        }
      } catch (e) {
        console.error("Failed to clear token:", e);
      }
      set({ token: null, user: null, isLoading: false });
    }
  }
}));
