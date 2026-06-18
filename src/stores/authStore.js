import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Eager loading: intentar recuperar el usuario de localStorage al inicio
    const storedUser = localStorage.getItem('auth_user');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: localStorage.getItem('auth_token') || null,
    };
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials);
        
        // Dependiendo de cómo envuelve ResponseFormat el resultado
        const responseData = response.data.data || response.data;
        
        if (!responseData.access_token) {
          throw new Error('Token no recibido');
        }

        this.token = responseData.access_token;
        this.user = responseData.user;
        
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));
        
        return true;
      } catch (error) {
        console.error('Error de login', error);
        throw error;
      }
    },
    async fetchUser() {
      if (!this.token) return null;
      
      try {
        const response = await api.get('/profile/info');
        const userData = response.data.user || response.data.data || response.data;
        
        this.user = userData;
        // Actualizamos la caché local
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        return userData;
      } catch (error) {
        console.error('Error obteniendo usuario', error);
        if (error.response && error.response.status === 401) {
           this.logout();
        }
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }
});
