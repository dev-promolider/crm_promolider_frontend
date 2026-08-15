import apiClient from '@/services/apiClient';

export default {
  // --- Nuevos Usuarios ---
  getNewUsers() {
    return apiClient.get('/admin/requests/new-users');
  },
  getNewUserById(id) {
    return apiClient.get(`/admin/requests/new-users/${id}`);
  },
  updateNewUser(payload) {
    return apiClient.post('/admin/requests/new-users/update', payload);
  },

  // --- Verificación de Infoproductos ---
  getCourseVerifications() {
    return apiClient.get('/admin/requests/courses/verification');
  },
  approveCourseVerification(id) {
    return apiClient.post(`/admin/requests/courses/${id}/approve`);
  },
  rejectCourseVerification(id, payload) {
    return apiClient.post(`/admin/requests/courses/${id}/reject`, payload);
  },

  // --- Solicitudes de Roles (Cursos) ---
  getRoleCoursesRequests() {
    return apiClient.get('/admin/requests/role-requests/courses');
  },
  approveRoleCoursesRequest(id) {
    return apiClient.post('/admin/requests/role-requests/courses/approve', { id });
  },
  rejectRoleCoursesRequest(id, justification) {
    return apiClient.post('/admin/requests/role-requests/courses/reject', { id, justification });
  },

  // --- Solicitudes de Roles (Herramientas) ---
  getRoleToolsRequests() {
    return apiClient.get('/admin/requests/role-requests/tools');
  },
  approveRoleToolsRequest(id) {
    return apiClient.post('/admin/requests/role-requests/tools/approve', { id });
  },
  rejectRoleToolsRequest(id, justification) {
    return apiClient.post('/admin/requests/role-requests/tools/reject', { id, justification });
  },

  // --- Revisión de Exámenes ---
  getExamReviews() {
    return apiClient.get('/admin/requests/exam-reviews');
  },
  getExamReviewCourses() {
    return apiClient.get('/admin/requests/exam-reviews/courses');
  },
  getExamReviewsByCourse(courseId) {
    return apiClient.get(`/admin/requests/exam-reviews/courses/${courseId}/exams`);
  },
  getExamReviewDetails(headerId) {
    return apiClient.get(`/admin/requests/exam-reviews/${headerId}/details`);
  },
  updateExamReview(payload) {
    return apiClient.post('/admin/requests/exam-reviews/update', payload);
  }
};
