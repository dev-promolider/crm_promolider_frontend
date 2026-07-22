import apiClient from "@/services/apiClient";

export const courseService = {
    getOrders(courseId) {
        return apiClient.get(`/course/${courseId}/orders`);
    },

    changeOrder(courseId, classes) {
        return apiClient.patch(
            "/course/change-order",
            {
                id: courseId,
                order: JSON.stringify(classes),
            }
        );
    },

    changeOrderModules(courseId, modules) {
        return apiClient.patch(
            "/course/change-order-module",
            {
                id: courseId,
                order: JSON.stringify(modules),
            },
        );
    }
};

export default courseService;