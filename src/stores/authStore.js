import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials);
        
        // Dependiendo de cómo envuelve ResponseFormat el resultado, usualmente está en data.data o directamente en data
        const responseData = response.data.data || response.data;
        
        if (!responseData.access_token) {
          throw new Error('Token no recibido');
        }

        this.token = responseData.access_token;
        this.user = responseData.user;
        
        localStorage.setItem('auth_token', this.token);
        
        return true;
      } catch (error) {
        console.error('Error de login', error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
    }
  }
});
