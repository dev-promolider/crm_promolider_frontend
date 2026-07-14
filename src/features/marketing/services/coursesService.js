import apiClient from '@/services/apiClient'

export async function getCourses(params = {}) { const r = await apiClient.get('/marketing/courses', { params }); return r.data }
export async function getCourse(id) { const r = await apiClient.get('/marketing/courses/' + id); return r.data }
export async function createCourse(data) { const r = await apiClient.post('/marketing/courses', data); return r.data }
export async function updateCourse(id, data) { const r = await apiClient.put('/marketing/courses/' + id, data); return r.data }
export async function deleteCourse(id) { const r = await apiClient.delete('/marketing/courses/' + id); return r.data }

export async function getModules(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/modules'); return r.data }
export async function createModule(data) { const r = await apiClient.post('/marketing/courses/modules', data); return r.data }
export async function updateModule(id, data) { const r = await apiClient.put('/marketing/courses/modules/' + id, data); return r.data }
export async function deleteModule(id) { const r = await apiClient.delete('/marketing/courses/modules/' + id); return r.data }
export async function reorderModules(courseId, order) { const r = await apiClient.post('/marketing/courses/' + courseId + '/modules/reorder', { order }); return r.data }

export async function getClasses(moduleId) { const r = await apiClient.get('/marketing/courses/modules/' + moduleId + '/classes'); return r.data }
export async function createClass(data) { const r = await apiClient.post('/marketing/courses/classes', data); return r.data }
export async function updateClass(id, data) { const r = await apiClient.put('/marketing/courses/classes/' + id, data); return r.data }
export async function deleteClass(id) { const r = await apiClient.delete('/marketing/courses/classes/' + id); return r.data }

export async function getProgress(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/progress'); return r.data }
export async function completeLesson(courseId, lessonId) { const r = await apiClient.post('/marketing/courses/' + courseId + '/lessons/' + lessonId + '/complete'); return r.data }
export async function updateCourseProgress(courseId, progress) { const r = await apiClient.post('/marketing/courses/' + courseId + '/progress', { progress }); return r.data }

export async function getRatings(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/ratings'); return r.data }
export async function createRating(courseId, data) { const r = await apiClient.post('/marketing/courses/' + courseId + '/ratings', data); return r.data }

export async function createObservation(data) { const r = await apiClient.post('/marketing/courses/observations', data); return r.data }
export async function getObservations(classId) { const r = await apiClient.get('/marketing/courses/classes/' + classId + '/observations'); return r.data }

export async function getGames(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/games'); return r.data }
export async function getDinamicasList(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/dinamicas'); return r.data }
export async function getDinamicaData(gameId) { const r = await apiClient.get('/marketing/courses/dinamicas/' + gameId + '/data'); return r.data }
export async function createGame(data) { const r = await apiClient.post('/marketing/courses/games', data); return r.data }
export async function updateGame(id, data) { const r = await apiClient.put('/marketing/courses/games/' + id, data); return r.data }
export async function deleteGame(id) { const r = await apiClient.delete('/marketing/courses/games/' + id); return r.data }
export async function getGameDetails(gameId) { const r = await apiClient.get('/marketing/courses/games/' + gameId + '/details'); return r.data }
export async function createGameDetail(data) { const r = await apiClient.post('/marketing/courses/game-details', data); return r.data }
export async function deleteGameDetail(id) { const r = await apiClient.delete('/marketing/courses/game-details/' + id); return r.data }

export async function getCertificates() { const r = await apiClient.get('/marketing/courses/certificates'); return r.data }
export async function createCertificate(data) { const r = await apiClient.post('/marketing/courses/certificates', data); return r.data }
export async function getTemplates() { const r = await apiClient.get('/marketing/courses/templates'); return r.data }
export async function createTemplate(data) { const r = await apiClient.post('/marketing/courses/templates', data); return r.data }
export async function updateTemplate(id, data) { const r = await apiClient.put('/marketing/courses/templates/' + id, data); return r.data }

export async function searchCourses(query, params = {}) { const r = await apiClient.get('/marketing/courses/search', { params: { q: query, ...params } }); return r.data }

export async function getRelatedCourses(courseId, params = {}) { const r = await apiClient.get('/marketing/courses/' + courseId + '/related', { params }); return r.data }

export async function getCourseExpiration(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/expiration'); return r.data }

export async function getGameComments(gameId) { const r = await apiClient.get('/marketing/courses/games/' + gameId + '/comments'); return r.data }
export async function createGameComment(gameId, content) { const r = await apiClient.post('/marketing/courses/games/' + gameId + '/comments', { content }); return r.data }

export async function getReleasedCourses(params = {}) { const r = await apiClient.get('/marketing/courses/released', { params }); return r.data }
export async function getLastPlayedCourses(params = {}) { const r = await apiClient.get('/marketing/courses/last-played', { params }); return r.data }
export async function getGamesTop(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/games/top'); return r.data }

export async function getActiveGame(data) { const r = await apiClient.post('/marketing/courses/game/active', data); return r.data }
export async function getActiveModuleGame(data) { const r = await apiClient.post('/marketing/courses/game/module-active', data); return r.data }
export async function addPointsToUser(data) { const r = await apiClient.post('/marketing/courses/game/add-points', data); return r.data }
export async function retrieveDynamicTop(data) { const r = await apiClient.post('/marketing/courses/game/retrieve-top', data); return r.data }
export async function getStudentDashboard() { const r = await apiClient.get('/marketing/courses/student-dashboard'); return r.data }
export async function getExamCalification(courseId, data) { const r = await apiClient.post('/marketing/courses/' + courseId + '/exam/calification', data); return r.data }
export async function getExamIndicators(courseId, data) { const r = await apiClient.post('/marketing/courses/' + courseId + '/exam/indicators', data); return r.data }
export async function getActiveModuleExams(courseId, data) { const r = await apiClient.post('/marketing/courses/' + courseId + '/exam/module/active', data); return r.data }
export async function getExamList(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/exam/list'); return r.data }
export async function getCourseConfig(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/exam/isconfig'); return r.data }
export async function checkCertificate(courseId) { const r = await apiClient.get('/marketing/courses/' + courseId + '/certificate/check'); return r.data }
export async function getCongratulations() { const r = await apiClient.get('/marketing/courses/congratulations'); return r.data }

export async function getRandomCourses() { const r = await apiClient.get('/marketing/courses/list/random'); return r.data }
export async function getRecommendedCourses() { const r = await apiClient.get('/marketing/courses/recommended'); return r.data }
export async function getAvailableBooks() { const r = await apiClient.get('/marketing/courses/available-books'); return r.data }
export async function getInterestingCourses() { const r = await apiClient.get('/marketing/courses/interesting'); return r.data }
export async function addLatestLesson(classId) { const r = await apiClient.get('/marketing/courses/add-latest-lesson/' + classId); return r.data }
export async function getProducerCourses(producerId) { const r = await apiClient.get('/marketing/courses/producer/' + producerId); return r.data }
