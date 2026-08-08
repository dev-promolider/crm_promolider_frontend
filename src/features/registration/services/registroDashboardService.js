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
  generateLink(position) {
    return api.post('/dashboard/registro/link', { position });
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
