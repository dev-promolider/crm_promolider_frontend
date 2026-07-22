import apiClient from '@/services/apiClient';

/**
 * Servicio para consumir el Plan de Compensación desde la API.
 * Todos los valores vienen de la base de datos (no hardcodeados).
 */
export default {
  /** Membresías activas con precio de OPC incluido (sin autenticación) */
  getMembershipPlans() {
    return apiClient.get('/public/membership-plans');
  },

  /** Todos los rangos con topes y requisitos */
  getRanks() {
    return apiClient.get('/compensation/ranks');
  },

  /** Porcentajes de bono generacional por rango */
  getGenerationalBonuses() {
    return apiClient.get('/compensation/generational-bonuses');
  },

  /** Precios y puntos del OPC por membresía (requiere Admin) */
  getOpcProducts() {
    return apiClient.get('/admin/compensation/opc-products');
  },

  /** Editar membresía (requiere Admin) */
  updateMembership(id, data) {
    return apiClient.put(`/admin/compensation/memberships/${id}`, data);
  },

  /** Editar precio/puntos OPC (requiere Admin) */
  updateOpcProduct(id, data) {
    return apiClient.put(`/admin/compensation/opc-products/${id}`, data);
  },

  /** Editar parámetros de un rango (requiere Admin) */
  updateRank(id, data) {
    return apiClient.put(`/admin/compensation/ranks/${id}`, data);
  },

  /** Editar porcentajes generacionales de un rango (requiere Admin) */
  updateGenerationalBonus(id, data) {
    return apiClient.put(`/admin/compensation/generational-bonuses/${id}`, data);
  },
};
