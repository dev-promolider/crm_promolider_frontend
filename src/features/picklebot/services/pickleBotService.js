import pickleBotApiClient from './pickleBotApiClient';

export async function createChat({ userId, title }) {
  const response = await pickleBotApiClient.post('/chats', { userId, title });
  return response.data;
}

export async function listChats(userId) {
  const response = await pickleBotApiClient.get('/chats', { params: { userId } });
  return response.data;
}

export async function getChat(chatId) {
  const response = await pickleBotApiClient.get(`/chats/${chatId}`);
  return response.data;
}

export async function sendMessage(chatId, payload) {
  const response = await pickleBotApiClient.post(`/chats/${chatId}`, payload);
  return response.data;
}

export async function updateChatTitle(chatId, title) {
  const response = await pickleBotApiClient.patch(`/chats/${chatId}`, { title });
  return response.data;
}

export async function deleteChat(chatId) {
  await pickleBotApiClient.delete(`/chats/${chatId}`);
}

export async function switchProvider(provider) {
  const response = await pickleBotApiClient.put('/ai/provider', { provider });
  return response.data;
}
