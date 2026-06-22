import apiClient from '@/services/apiClient';

export const login = async (credentials) => {
  const response = await apiClient.post('/api/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/api/logout');
  return response.data;
};
