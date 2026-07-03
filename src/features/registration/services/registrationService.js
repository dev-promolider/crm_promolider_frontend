import apiClient from '@/services/apiClient';

export const submitPreregistro = async (username, data) => {
  const response = await apiClient.post(`registration/preregistro/${username}`, data);
  return response.data;
};

export const validateToken = async (token) => {
  const response = await apiClient.get(`registration/preregistro/retorno/${token}`);
  return response.data;
};

export const submitOpenpayPayment = async (data) => {
  const response = await apiClient.post('registration/preregistro/openpay', data);
  return response.data;
};

export const checkDuplicate = async (params) => {
  const response = await apiClient.get('registration/preregistro/check-duplicate', { params });
  return response.data;
};

export const getPreregistroConfig = async (username) => {
  const response = await apiClient.get(`registration/preregistro/config/${username}`);
  return response.data;
};

export const sendRadarEvent = async (data) => {
  const response = await apiClient.post('registration/preregistro/radar', data);
  return response.data;
};

export const savePreregistroConfig = async (config) => {
  const response = await apiClient.post('registration/preregistro/config', config);
  return response.data;
};

export const getPreregistroReferrals = async () => {
  const response = await apiClient.get('registration/preregistro/referrals');
  return response.data;
};

export const resendPreregistroLink = async (correo) => {
  const response = await apiClient.post('registration/preregistro/resend-link', { correo });
  return response.data;
};

export const submitRegistration = async (data) => {
  const response = await apiClient.post('registration/create', data);
  return response.data;
};

export const validateSponsorLink = async (id, code) => {
  const response = await apiClient.get(`registration/sponsor-link/${id}/${code}`);
  return response.data;
};

export const getFormData = async () => {
  const response = await apiClient.get('registration/form-data');
  return response.data;
};
