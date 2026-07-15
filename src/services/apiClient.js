import axios from "axios";
import { startGlobalLoading, stopGlobalLoading } from "../utils/loaderState";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para SPA authentication en Laravel Sanctum
});

// Caching Global (Eager Loading persistente)
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
export const clearApiCache = () => apiCache.clear();

// Interceptor de Peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Si hay una mutación (post, put, etc), limpiamos la caché global
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      clearApiCache();
    }

    // Lógica de Loader
    if (config.hideLoader !== true) {
      startGlobalLoading();
    }
    
    // Auth Token
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Interceptar petición GET para inyectar la caché a través de un Adapter
    if (config.method.toLowerCase() === 'get' && !config.skipCache) {
      const key = `${config.url}?${new URLSearchParams(config.params || {}).toString()}`;
      const cached = apiCache.get(key);

      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        config.isCached = true; // Para no volver a cachear en el response
        config.adapter = () => {
          return new Promise((resolve) => {
            // Delay ultra corto para dar respiro a las transiciones de Vue y loader
            setTimeout(() => {
              let clonedData = cached.response.data;
              if (clonedData !== undefined) {
                try { clonedData = JSON.parse(JSON.stringify(clonedData)); } 
                catch(e) {}
              }
              resolve({
                data: clonedData,
                status: cached.response.status,
                statusText: cached.response.statusText,
                headers: cached.response.headers,
                config: config,
                request: {}
              });
            }, 50);
          });
        };
      }
    }

    return config;
  },
  (error) => {
    stopGlobalLoading();
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.hideLoader !== true) {
      stopGlobalLoading();
    }

    // Guardar en caché si fue una petición GET real
    if (response.config.method.toLowerCase() === 'get' && !response.config.skipCache && !response.config.isCached) {
      const key = `${response.config.url}?${new URLSearchParams(response.config.params || {}).toString()}`;
      apiCache.set(key, { 
        timestamp: Date.now(), 
        response: {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        }
      });
    }

    return response;
  },
  (error) => {
    if (error.config && error.config.hideLoader !== true) {
      stopGlobalLoading();
    }
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
