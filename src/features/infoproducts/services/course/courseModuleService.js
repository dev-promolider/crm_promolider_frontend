import apiClient from '@/services/apiClient';

export const courseModuleService = {
    listModules(courseId) {
        return apiClient.get(`/courses/${courseId}/modulesList`);
    },

    listLessons(moduleId) {
        return apiClient.get(`/courses/module/class/${moduleId}/classList`);
    },

    getModulePageData(courseId) {
        return apiClient.get(`/courses/${courseId}/modules/edit-data`);
    },

    getConfiguration(courseId) {
        return apiClient.get(`/course/certificate/configuration/${courseId}`);
    },

    addClass(moduleId, formData) {
        return apiClient.post(`/course/module/class/${moduleId}/save`, formData);
    }
};