import apiClient from '@/services/apiClient';

export default {
  getAllMovements(userId, params = {}) {
    return apiClient.get(`/marketing/reports/mymovements/${userId}`, { params });
  },

  getWalletBalance() {
    return apiClient.get('/marketing/reports/wallet/balance');
  },

  getMovementsHistory() {
    return apiClient.get('/marketing/reports/mymovements-history');
  },

  transferFunds(direct, amount) {
    return apiClient.post('/marketing/reports/movements/transfer-founds', { direct, amount });
  },

  getBinaryHistory(params = {}) {
    return apiClient.get('/marketing/reports/binary-history', { params });
  },

  getActiveBinaryPoints() {
    return apiClient.get('/marketing/reports/active-binary-points');
  },

  getSales(userId) {
    return apiClient.get(`/marketing/reports/getsales/${userId}`);
  },

  getMyPurchases(userId, params = {}) {
    return apiClient.get(`/marketing/reports/mypurchases/${userId}`, { params });
  }
};
