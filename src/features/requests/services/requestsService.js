import apiClient from '@/services/apiClient';

/**
 * Servicio del módulo de Solicitudes de Fondos.
 * Consume los endpoints documentados de request-founds.
 * Ver docs/planificacion_proyecto.md para el detalle de payloads y respuestas.
 */
export default {
  /**
   * Crea una solicitud de retiro de fondos.
   * @param {{ amount: number, accountType: string, accountNumber: string }} payload
   */
  createRequest({ amount, accountType, accountNumber }) {
    return apiClient.post('/marketing/reports/movements/request-founds', {
      amount,
      account_type: accountType,
      account_number: accountNumber
    });
  },

  /**
   * Lista las solicitudes pendientes (status=0, bonus_type_id IS NULL).
   * Cada item incluye wallet.user anidado.
   */
  getPendingRequests() {
    return apiClient.get('/admin/requests/withdrawals');
  },

  /**
   * Lista el historial de solicitudes aprobadas/rechazadas (paginado).
   */
  getApprovedRequests(page = 1, perPage = 15) {
    return apiClient.get('/admin/requests/withdrawals/approved', {
      params: { page, per_page: perPage }
    });
  },

  /**
   * Aprueba una solicitud. Recibe FormData con: id, message?, support_image? (max 10MB).
   * @param {FormData} formData
   */
  approveRequest(formData) {
    return apiClient.post('/admin/requests/withdrawals/approve', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Rechaza una solicitud.
   * @param {number} id
   */
  rejectRequest(id) {
    return apiClient.post('/admin/requests/withdrawals/reject', { id });
  },

  /**
   * Movimientos del usuario autenticado (usado para el historial de solicitudes
   * filtrando por reason === 'Solicitud de fondos' en el store).
   */
  getMyMovements(userId, params = {}) {
    return apiClient.get(`/marketing/reports/mymovements/${userId}`, { params });
  }
};
