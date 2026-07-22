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
        return apiClient.get(`/courses/certificate/configuration/${courseId}`);
    },

    storeModule(formData){
        return apiClient.post(`/courses/module/store`, formData);
    },

    editModule(moduleId, moduleName) {
        return apiClient.put(`/courses/module/${moduleId}/update`, { name: moduleName.value.trim() });
    },

    deleteModule(moduleId) {
        return apiClient.delete(`/courses/module/${moduleId}/delete`);
    },

    sendRequest(courseId) {
        return apiClient.post(`/courses/${courseId}/sendRequest`);
    },

    /* Related to classes */
    listObservations(courseId){
        return apiClient.get(`/courses/module/class/${courseId}/observations`);
    },

    getClassDetails(classId) {
        return apiClient.get(`/courses/module/class/${classId}/details`);
    },

    addClass(moduleId, formData) {
        return apiClient.post(`/courses/module/class/${moduleId}/save`, formData);
    },

    updateClass(classId, formData) {
        return apiClient.post(`/courses/module/class/${classId}/update`, formData);
    },

    deleteClass(classId){
        return apiClient.delete(`/courses/module/class/${classId}/delete`);
    },

    getSignedUrlForVideoUpload(classId, fileName) {
        return apiClient.get(`/courses/module/class/video-upload-url/${classId}/${encodeURIComponent(fileName)}`);
    },

    uploadVideoToSignedUrl(signedUrl, file) {
        return apiClient.put(
            signedUrl, 
            file,
            {
                headers: {
                    "Content-Type":
                    file.type || "video/mp4",
                },
            },
        )
    },
};

export default courseModuleService;