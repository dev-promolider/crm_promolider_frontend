import api from '@/services/apiClient';

export default {
  /**
   * Obtiene el enlace activo actual
   */
  getActiveLink() {
    return api.get('/dashboard/registro/link');
  },

  /**
   * Genera un nuevo enlace
   */
  generateLink() {
    return api.post('/dashboard/registro/link');
  },

  /**
   * Suspende el enlace activo
   */
  suspendLink(id) {
    return api.delete(`/dashboard/registro/link/${id}`);
  },

  /**
   * Obtiene los directos registrados y pagados
   */
  getDirects() {
    return api.get('/dashboard/registro/directs');
  }
};
