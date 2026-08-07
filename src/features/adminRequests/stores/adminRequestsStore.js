import { defineStore } from 'pinia';
import adminRequestsService from '../services/adminRequestsService';

export const useAdminRequestsStore = defineStore('adminRequests', {
  state: () => ({
    newUsers: [],
    courseVerifications: [],
    roleCourseRequests: [],
    roleToolRequests: [],
    examReviews: [],
    loading: false,
    actionLoading: false,
    error: null,
  }),
  actions: {
    async fetchNewUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminRequestsService.getNewUsers();
        this.newUsers = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener nuevos usuarios';
      } finally {
        this.loading = false;
      }
    },
    async approveNewUser(payload) {
      this.actionLoading = true;
      try {
        await adminRequestsService.updateNewUser(payload);
        await this.fetchNewUsers();
      } finally {
        this.actionLoading = false;
      }
    },
    async fetchCourseVerifications() {
      this.loading = true;
      try {
        const response = await adminRequestsService.getCourseVerifications();
        this.courseVerifications = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener verificaciones de cursos';
      } finally {
        this.loading = false;
      }
    },
    async approveCourseVerification(id) {
      this.actionLoading = true;
      try {
        await adminRequestsService.approveCourseVerification(id);
        await this.fetchCourseVerifications();
      } finally {
        this.actionLoading = false;
      }
    },
    async rejectCourseVerification(id, observation) {
      this.actionLoading = true;
      try {
        await adminRequestsService.rejectCourseVerification(id, { observation });
        await this.fetchCourseVerifications();
      } finally {
        this.actionLoading = false;
      }
    },
    async fetchRoleRequestsCourses() {
      this.loading = true;
      try {
        const response = await adminRequestsService.getRoleCoursesRequests();
        this.roleCourseRequests = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener solicitudes de rol de cursos';
      } finally {
        this.loading = false;
      }
    },
    async approveRoleRequestCourses(id) {
      this.actionLoading = true;
      try {
        await adminRequestsService.approveRoleCoursesRequest(id);
        await this.fetchRoleRequestsCourses();
      } finally {
        this.actionLoading = false;
      }
    },
    async rejectRoleRequestCourses(id, justification) {
      this.actionLoading = true;
      try {
        await adminRequestsService.rejectRoleCoursesRequest(id, justification);
        await this.fetchRoleRequestsCourses();
      } finally {
        this.actionLoading = false;
      }
    },
    async fetchRoleRequestsTools() {
      this.loading = true;
      try {
        const response = await adminRequestsService.getRoleToolsRequests();
        this.roleToolRequests = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener solicitudes de rol de herramientas';
      } finally {
        this.loading = false;
      }
    },
    async approveRoleRequestTools(id) {
      this.actionLoading = true;
      try {
        await adminRequestsService.approveRoleToolsRequest(id);
        await this.fetchRoleRequestsTools();
      } finally {
        this.actionLoading = false;
      }
    },
    async rejectRoleRequestTools(id, justification) {
      this.actionLoading = true;
      try {
        await adminRequestsService.rejectRoleToolsRequest(id, justification);
        await this.fetchRoleRequestsTools();
      } finally {
        this.actionLoading = false;
      }
    },
    async fetchExamReviews() {
      this.loading = true;
      try {
        const response = await adminRequestsService.getExamReviews();
        this.examReviews = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener revisiones de exámenes';
      } finally {
        this.loading = false;
      }
    },
    async fetchExamReviewDetails(headerId) {
      try {
        const response = await adminRequestsService.getExamReviewDetails(headerId);
        return response.data.data || response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener detalles del examen');
      }
    },
    async submitExamReview(payload) {
      this.actionLoading = true;
      try {
        await adminRequestsService.updateExamReview(payload);
        await this.fetchExamReviews();
      } finally {
        this.actionLoading = false;
      }
    }
  }
});
