import apiClient from '@/services/apiClient';

export const courseCertificateService = {
    storeConfiguration(formData) {
        return apiClient.post(`/course/certificate/store/configuration`, formData);
    }, // Hecho

    getConfiguration(courseId) {
        return apiClient.get(`/course/certificate/configuration/${courseId}`);
    } //Hecho
};