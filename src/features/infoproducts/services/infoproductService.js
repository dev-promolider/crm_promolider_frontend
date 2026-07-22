import apiClient from '@/services/apiClient';

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== '' && value !== null && value !== undefined;
    })
  );
};

export const infoproductService = {
    getCreatedInfoproducts(params = {}) {
        return apiClient.get(`/me/infoproducts`, {
            params: { ...cleanParams(params), origin: 'created' },
        });
    },

    getCategories() {
        return apiClient.get('/infoproducts/categories');
    },

    getLevels() {
        return apiClient.get('/infoproducts/levels');
    },

    getCertificateTemplates() {
        return apiClient.get('/infoproducts/certificate-templates');
    },

    getCourseCertificates() {
        return apiClient.get('/me/infoproducts/certificates');
    },

    sendReviewRequest(infoproductId) {
        return apiClient.post(`/infoproducts/${infoproductId}/send-review-request`);
    },

    deleteInfoproduct(infoproductId) {
        return apiClient.delete(`/infoproducts/${infoproductId}`);
    },
};