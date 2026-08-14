import axios from "axios";
import { startGlobalLoading, stopGlobalLoading } from "../utils/loaderState";

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DYNAMIC_API_URL = isLocal ? "http://127.0.0.1:8000/api/v1" : "https://api.promolider.email/api/v1"; // Cambia esta URL por la de tu producción

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DYNAMIC_API_URL,
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

// Cola global para evitar que el servidor PHP en Windows se congele con peticiones concurrentes
let currentRequestPromise = Promise.resolve();

// Interceptor de Peticiones
apiClient.interceptors.request.use(
  async (config) => {
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
        // Si está en caché, no necesitamos encolarla
        return config;
      }
    }

    // --- INICIO DE LA COLA ESTRICTA ---
    // Creamos una promesa que liberará a la SIGUIENTE petición cuando ESTA termine
    let releaseQueue;
    const unlockNext = new Promise(resolve => { releaseQueue = resolve; });
    
    config.releaseQueue = releaseQueue;

    // Esperamos a que la petición ANTERIOR termine antes de continuar con ESTA
    const waitPromise = currentRequestPromise;
    currentRequestPromise = currentRequestPromise.then(() => unlockNext);

    await waitPromise;
    // --- FIN DE LA COLA ESTRICTA ---

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
    // Liberar la cola para que pase la siguiente petición
    if (response.config && response.config.releaseQueue) {
      response.config.releaseQueue();
    }

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
    // Liberar la cola si la petición falló
    if (error.config && error.config.releaseQueue) {
      error.config.releaseQueue();
    }

    if (error.config && error.config.hideLoader !== true) {
      stopGlobalLoading();
    }
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
