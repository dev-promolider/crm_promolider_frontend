import axios from 'axios';

const api = axios.create({
  // Asegúrate de que esto coincida con la URL de tu backend
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Crucial para Sanctum y el envío de cookies/sesiones
  withCredentials: true,
  // Necesario para enviar el token CSRF en peticiones cross-origin
  withXSRFToken: true
});

// Interceptor para manejar errores globalmente (ej. si el token expira)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Manejar cierre de sesión o token expirado aquí
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
