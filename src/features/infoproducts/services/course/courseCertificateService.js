import apiClient from '@/services/apiClient';

export const courseCertificateService = {
    storeConfiguration(formData) {
        return apiClient.post(`/courses/certificate/store/configuration`, formData);
    }
};

export default courseCertificateService;