import apiClient from '@/services/apiClient';

export const courseModuleService = {
    listModules(courseId) {
        return apiClient.get(`/course/${courseId}/modulesList`);
    },

    listLessons(moduleId) {
        return apiClient.get(`/course/module/class/${moduleId}/classList`);
    },

    getModulePageData(courseId) {
        return apiClient.get(`/course/${courseId}`);
    },

    getConfiguration(courseId) {
        return apiClient.get(`/course/certificate/configuration/${courseId}`);
    },

    storeModule(formData){
        return apiClient.post(`/course/module/store`, formData);
    },

    editModule(moduleId, moduleName) {
        return apiClient.put(`/course/module/${moduleId}/update`, { name: moduleName.value.trim() });
    },

    deleteModule(moduleId) {
        return apiClient.delete(`/course/module/${moduleId}/delete`);
    },

    sendRequest(courseId) {
        return apiClient.post(`/course/${courseId}/sendRequest`);
    },

    /* Related to classes */
    listObservations(courseId){
        return apiClient.get(`/course/module/class/${courseId}/observations`);
    },

    getClassDetails(classId) {
        return apiClient.get(`/course/module/class/${classId}/details`);
    },

    addClass(moduleId, formData) {
        return apiClient.post(`/course/module/class/${moduleId}/save`, formData);
    },

    updateClass(classId, formData) {
        return apiClient.post(`/course/module/class/${classId}/update`, formData);
    },

    deleteClass(classId){
        return apiClient.delete(`/course/module/class/${classId}/delete`);
    },

    getSignedUrlForVideoUpload(classId, fileName) {
        return apiClient.get(`/course/module/class/video-upload-url/${classId}/${encodeURIComponent(fileName)}`);
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