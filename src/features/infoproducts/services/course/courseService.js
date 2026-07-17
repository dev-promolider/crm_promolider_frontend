import apiClient from "@/services/apiClient";

export const courseService = {
    getOrders(courseId) {
        return apiClient.get(`/course/${courseId}/orders`);
    }
}