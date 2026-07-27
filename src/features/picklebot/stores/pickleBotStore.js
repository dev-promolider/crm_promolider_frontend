import { defineStore } from 'pinia';
import * as pickleBotService from '../services/pickleBotService';

const deriveTitle = (text) => {
  const trimmed = text.trim();
  return trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed;
};

const hydrateMessage = (message, chatStatus) => {
  if (message.type !== 'form') return message;
  return {
    ...message,
    selectedAnswers: {},
    customAnswers: {},
    formSubmitted: chatStatus !== 'awaiting_form_answers',
    currentStep: 0,
  };
};

export const usePickleBotStore = defineStore('pickleBot', {
  state: () => ({
    chats: [],
    currentChat: null,
    messages: [],
    loadingChats: false,
    isSending: false,
    provider: 'nvidia',
    error: null,
  }),
  getters: {
    isAwaitingFormAnswers: (state) => state.currentChat?.status === 'awaiting_form_answers',
    isCompleted: (state) => state.currentChat?.status === 'completed',
  },
  actions: {
    async fetchChats(userId) {
      if (!userId) return;
      this.loadingChats = true;
      try {
        this.chats = await pickleBotService.listChats(userId);
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar el historial de chats.';
      } finally {
        this.loadingChats = false;
      }
    },

    async openChat(chatId) {
      this.error = null;
      try {
        const data = await pickleBotService.getChat(chatId);
        this.currentChat = { id: data.id, title: data.title, status: data.status };
        this.messages = data.messages.map((m) => hydrateMessage(m, data.status));

        if (data.status === 'awaiting_form_answers') {
          const lastFormMsg = [...this.messages].reverse().find((m) => m.type === 'form');
          if (lastFormMsg) lastFormMsg.formSubmitted = false;
        }
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cargar el historial del chat.';
        this.messages.push({
          role: 'assistant',
          type: 'text',
          content: { text: 'Error al cargar el historial del chat.' },
        });
      }
    },

    startNewChat() {
      this.currentChat = null;
      this.messages = [];
    },

    async sendTextMessage(userId, text) {
      if (!userId) {
        this.error = 'No se pudo identificar al usuario.';
        return;
      }

      this.error = null;
      let isNewChat = false;

      try {
        if (!this.currentChat) {
          const created = await pickleBotService.createChat({ userId, title: 'Nuevo Chat' });
          this.currentChat = { id: created.id, title: created.title, status: created.status };
          isNewChat = true;
        }
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al conectar con el servidor.';
        this.messages.push({ role: 'assistant', type: 'text', content: { text: 'Error al conectar con el servidor.' } });
        return;
      }

      this.messages.push({ role: 'user', type: 'text', content: { text } });

      if (isNewChat) {
        try {
          const updated = await pickleBotService.updateChatTitle(this.currentChat.id, deriveTitle(text));
          this.currentChat.title = updated.title;
        } catch (e) {
          // No es crítico: el chat queda con el título placeholder si el rename falla.
        }
        this.fetchChats(userId);
      }

      await this.sendPayload({ role: 'user', type: 'text', content: { text } });
    },

    async sendFormAnswers(answers) {
      if (!this.currentChat) return;

      this.messages.push({
        type: 'form_answers',
        role: 'user',
        content: { text: 'Respuestas del formulario enviadas.' },
      });

      await this.sendPayload({ role: 'user', type: 'form', content: { answers } });
    },

    async sendPayload(payload) {
      this.isSending = true;
      try {
        const data = await pickleBotService.sendMessage(this.currentChat.id, payload);
        this.currentChat.status = data.status;
        this.messages.push(hydrateMessage(data, data.status));
      } catch (e) {
        this.error = e.response?.data?.message || 'Hubo un error al procesar tu mensaje.';
        this.messages.push({
          role: 'assistant',
          type: 'text',
          content: { text: 'Hubo un error al procesar tu mensaje.' },
        });
      } finally {
        this.isSending = false;
      }
    },

    async renameChat(chatId, title) {
      try {
        const updated = await pickleBotService.updateChatTitle(chatId, title);
        const idx = this.chats.findIndex((c) => c.id === chatId);
        if (idx !== -1) this.chats[idx] = updated;
        if (this.currentChat?.id === chatId) this.currentChat.title = updated.title;
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al renombrar el chat.';
      }
    },

    async removeChat(chatId) {
      try {
        await pickleBotService.deleteChat(chatId);
        this.chats = this.chats.filter((c) => c.id !== chatId);
        if (this.currentChat?.id === chatId) this.startNewChat();
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al eliminar el chat.';
      }
    },

    async switchProvider(provider) {
      try {
        const data = await pickleBotService.switchProvider(provider);
        this.provider = data.provider;
      } catch (e) {
        this.error = e.response?.data?.message || 'Error al cambiar el proveedor.';
      }
    },
  },
});
