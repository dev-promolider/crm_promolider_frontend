import { defineStore } from 'pinia';
import api from '../services/api';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
    isLoading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(username, password) {
      this.isLoading = true;
      this.error = null;
      try {
        // Autenticación por Bearer Token (Sanctum) - no requiere CSRF cookie

        // 2. Hacer petición al endpoint de login del backend
        // (Nota: Tendremos que crear este endpoint en Laravel si no existe para la API)
        const response = await api.post('/auth/login', { username, password });
        
        const token = response.data.data.access_token;
        this.token = token;
        this.user = response.data.data.user;
        
        localStorage.setItem('auth_token', token);
        
        // Agregar token a las cabeceras por defecto
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  }
});
