import apiClient from '@/services/apiClient';

export default {
  getAllMovements(userId) {
    return apiClient.get(`/reports/mymovements/${userId}`);
  },

  getWalletBalance() {
    return apiClient.get('/reports/wallet/balance');
  },

  getMovementsHistory() {
    return apiClient.get('/reports/mymovements-history');
  },

  transferFunds(direct, amount) {
    return apiClient.post('/reports/movements/transfer-founds', { direct, amount });
  },

  requestFunds(amount, accountType, accountNumber) {
    return apiClient.post('/reports/movements/request-founds', {
      amount,
      account_type: accountType,
      account_number: accountNumber
    });
  },

  getRequestFundsList() {
    return apiClient.get('/reports/movements/request-founds/list');
  },

  rejectRequest(id) {
    return apiClient.post('/reports/movements/request-founds/reject', { id });
  },

  approveRequest(formData) {
    return apiClient.post('/reports/movements/request-founds/approve', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getBinaryHistory(params = {}) {
    return apiClient.get('/reports/binary-history', { params });
  },

  getSales(userId) {
    return apiClient.get(`/reports/getsales/${userId}`);
  }
};
