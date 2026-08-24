import creatorAiApiClient from './creatorAiApiClient';

export async function createChat({ userId, title }) {
  const response = await creatorAiApiClient.post('/chats', { userId, title });
  return response.data;
}

export async function listChats(userId) {
  const response = await creatorAiApiClient.get('/chats', { params: { userId } });
  return response.data;
}

export async function getChat(chatId) {
  const response = await creatorAiApiClient.get(`/chats/${chatId}`);
  return response.data;
}

export async function sendMessage(chatId, payload) {
  const response = await creatorAiApiClient.post(`/chats/${chatId}`, payload);
  return response.data;
}

export async function updateChatTitle(chatId, title) {
  const response = await creatorAiApiClient.patch(`/chats/${chatId}`, { title });
  return response.data;
}

export async function deleteChat(chatId) {
  await creatorAiApiClient.delete(`/chats/${chatId}`);
}

export async function switchProvider(provider) {
  const response = await creatorAiApiClient.put('/ai/provider', { provider });
  return response.data;
}

export async function switchEmbeddingProvider(provider) {
  const response = await creatorAiApiClient.put('/ai/embedding-provider', { provider });
  return response.data;
}
