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

    /* Related to classes */
    addClass(moduleId, formData) {
        return apiClient.post(`/course/module/class/${moduleId}/save`, formData);
    },

    updateClass(classId, formData) {
        return apiClient.post(`/course/module/class/${classId}/update`, formData);
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