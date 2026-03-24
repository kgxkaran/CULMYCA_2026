import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/axios.js';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Login action
      login: (userData, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          user: userData,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      // Logout action
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // User update karo
      updateUser: (userData) => set({ user: userData }),
    }),
    {
      name: 'auth-storage', // localStorage mein is naam se save hoga
    }
  )
);

export default useAuthStore;