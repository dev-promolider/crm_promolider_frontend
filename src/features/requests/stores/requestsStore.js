import { defineStore } from 'pinia';
import requestsService from '../services/requestsService';

/** Texto fijo que el backend asigna a las solicitudes de fondos (wallet_movements.reason). */
export const FUNDS_REQUEST_REASON = 'Solicitud de fondos';

/**
 * Determina si un movimiento de wallet corresponde a una solicitud de fondos.
 * Criterio principal: reason fija. Fallback: débito sin bono asociado.
 */
function isFundsRequest(movement) {
  if (String(movement?.reason || '').trim().toLowerCase() === FUNDS_REQUEST_REASON.toLowerCase()) {
    return true;
  }
  return Number(movement?.type) === 0 && movement?.bonus_type_id == null;
}

export const useRequestsStore = defineStore('requests', {
  state: () => ({
    pendingRequests: [],
    myRequests: [],
    loading: false,
    actionLoading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    pendingCount: (state) => state.pendingRequests.length,
  },

  actions: {
    extractList(response) {
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data)) return response.data;
      return [];
    },

    /** Listado de solicitudes pendientes (admin). */
    async fetchPendingRequests() {
      this.loading = true;
      this.error = null;
      try {
        const response = await requestsService.getPendingRequests();
        this.pendingRequests = this.extractList(response);
        return this.pendingRequests;
      } catch (e) {
        console.error('Error fetching pending requests:', e);
        this.error = e.response?.data?.message || e.message;
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Historial de solicitudes del usuario autenticado.
     * El backend no expone endpoint dedicado; se obtienen los movimientos
     * y se filtran en cliente por solicitudes de fondos.
     */
    async fetchMyRequests(userId) {
      if (!userId) return [];
      this.loading = true;
      this.error = null;
      try {
        const response = await requestsService.getMyMovements(userId, { per_page: 100 });
        const movements = response?.data?.data || [];
        this.myRequests = movements.filter(isFundsRequest);
        return this.myRequests;
      } catch (e) {
        console.error('Error fetching my requests:', e);
        this.error = e.response?.data?.message || e.message;
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea una solicitud de retiro.
     * Lanza el error para que el componente pueda mapear errores 422 por campo.
     */
    async createRequest(payload) {
      this.actionLoading = true;
      this.error = null;
      try {
        const response = await requestsService.createRequest(payload);
        return response;
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },

    /**
     * Aprueba una solicitud (admin).
     * @param {FormData} formData - id, message?, support_image?
     */
    async approveRequest(formData) {
      this.actionLoading = true;
      this.error = null;
      try {
        const response = await requestsService.approveRequest(formData);
        await this.fetchPendingRequests();
        return response;
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },

    /** Rechaza una solicitud (admin). */
    async rejectRequest(id) {
      this.actionLoading = true;
      this.error = null;
      try {
        const response = await requestsService.rejectRequest(id);
        await this.fetchPendingRequests();
        return response;
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },
  },
});
