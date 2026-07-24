<template>
  <div class="pickle-layout h-full min-h-[calc(100vh-100px)] w-full flex flex-col md:flex-row gap-6 p-4 lg:p-6 bg-[#09090b] text-slate-100 relative overflow-hidden rounded-xl">
    <!-- Background accents -->
    <div class="absolute top-[20%] left-[10%] w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Sidebar -->
    <div class="sidebar w-full md:w-72 glass-panel flex flex-col p-4 md:p-6 rounded-2xl z-10 shrink-0">
      <button @click="startNewChat" class="new-chat-btn w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 mb-5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nuevo Chat
      </button>
      
      <div class="chat-list flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
        <div v-if="loadingChats" class="text-sm text-slate-400 text-center py-4">
          Cargando historiales...
        </div>
        <div v-else-if="chats.length === 0" class="text-sm text-slate-400 text-center py-4">
          No hay chats recientes
        </div>
        <div v-else v-for="chat in chats" :key="chat.id" 
             class="chat-list-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent"
             :class="currentChatId === chat.id ? 'bg-indigo-500/15 border-indigo-500/30 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'"
             @click="loadChat(chat.id)">
          <span class="chat-title truncate flex-1 text-sm mr-2">{{ chat.title || 'Nuevo Chat' }}</span>
          <button @click.stop="confirmDeleteChat(chat.id)" class="text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors" title="Eliminar chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-container flex-1 glass-panel flex flex-col rounded-2xl z-10 overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="chat-header p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">
            P
          </div>
          <div>
            <h2 class="font-semibold text-white">Pickle Bot</h2>
            <p class="text-xs text-slate-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Online
            </p>
          </div>
        </div>
        
        <!-- Model Selector -->
        <div class="relative hidden sm:block">
          <select v-model="selectedModel" @change="switchModel" class="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-200 py-2 pl-3 pr-8 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
            <option value="gemini" class="bg-[#1e1e2e]">Gemini 2.0 Flash</option>
            <option value="openai" class="bg-[#1e1e2e]">GPT-4o Mini</option>
            <option value="nvidia" class="bg-[#1e1e2e]">NVIDIA Llama 3</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="chat-messages flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scroll-smooth" ref="messagesContainer">
        
        <!-- Welcome Message (only if new chat) -->
        <div v-if="!currentChatId && messages.length === 0" class="message assistant self-start bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] animate-fade-in-up">
          <div class="prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
            ¡Hola! Soy Pickle. Escribe algo para comenzar a crear tu curso.
          </div>
        </div>

        <!-- Render Messages -->
        <template v-for="(msg, index) in messages" :key="index">
          
          <!-- Text Message -->
          <div v-if="msg.type === 'text' || msg.type === 'form_answers'" 
               class="message py-3 px-4 rounded-2xl max-w-[85%] animate-fade-in-up break-words"
               :class="msg.role === 'user' ? 'user self-end bg-gradient-to-br from-indigo-500 to-purple-500 rounded-br-sm shadow-lg shadow-indigo-500/20' : 'assistant self-start bg-white/5 border border-white/10 rounded-bl-sm'">
            <div v-if="msg.role === 'assistant'" class="prose prose-invert max-w-none text-sm md:text-base leading-relaxed" v-html="parseMarkdown(msg.content.text || msg.content)"></div>
            <div v-else class="text-sm md:text-base whitespace-pre-wrap">{{ msg.content.text || 'Respuestas enviadas' }}</div>
          </div>

          <!-- Form Message -->
          <div v-if="msg.type === 'form'" class="message assistant self-start bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm py-4 px-5 max-w-[85%] animate-fade-in-up w-full md:w-auto">
            <p class="mb-4 text-sm font-medium">Por favor, responde las siguientes preguntas para continuar:</p>
            
            <div v-for="(q, qIndex) in msg.content.questions" :key="q.id" class="mb-5">
              <div class="font-semibold text-sm mb-3 text-indigo-100">{{ qIndex + 1 }}. {{ q.question }}</div>
              
              <div class="flex flex-wrap gap-2">
                <button v-for="ans in q.suggestedAnswers" :key="ans" 
                        @click="toggleFormOption(msg, q.id, ans)"
                        :disabled="msg.formSubmitted || isWaitingForResponse"
                        class="px-4 py-2 text-xs md:text-sm rounded-full border transition-all duration-200"
                        :class="isFormOptionSelected(msg, q.id, ans) ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'">
                  {{ ans }}
                </button>
              </div>
              
              <!-- Custom Input for "Otros" -->
              <div v-if="isFormOptionSelected(msg, q.id, 'Otros')" class="mt-3">
                <input type="text" 
                       v-model="msg.customAnswers[q.id]" 
                       placeholder="Especifica tu respuesta..." 
                       :disabled="msg.formSubmitted || isWaitingForResponse"
                       class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
              </div>
            </div>
            
            <button @click="submitForm(msg)" 
                    :disabled="msg.formSubmitted || isWaitingForResponse || !isFormComplete(msg)"
                    class="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2">
              <svg v-if="msg.formSubmitted" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              <span>{{ msg.formSubmitted ? 'Respuestas Enviadas' : 'Enviar Respuestas' }}</span>
            </button>
          </div>
        </template>

        <!-- Typing Indicator -->
        <div v-show="isWaitingForResponse" class="typing-indicator assistant self-start bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] flex items-center gap-3 animate-fade-in-up">
          <div class="flex gap-1.5">
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: -0.32s"></div>
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: -0.16s"></div>
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
          </div>
          <span class="text-xs text-slate-400">{{ loadingText }}</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input p-4 md:p-5 border-t border-white/10 bg-black/20">
        <form @submit.prevent="sendMessage" class="flex gap-3 relative">
          <input type="text" 
                 v-model="inputText" 
                 placeholder="Escribe tu mensaje aquí..." 
                 :disabled="isWaitingForResponse || isAwaitingFormAnswers"
                 class="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm md:text-base text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
                 autocomplete="off">
          <button type="submit" 
                  :disabled="!inputText.trim() || isWaitingForResponse || isAwaitingFormAnswers"
                  class="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="glass-panel w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl animate-scale-in">
        <div class="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="14" y1="11" y2="17"/></svg>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">¿Eliminar este chat?</h3>
        <p class="text-sm text-slate-400 mb-6">Esta acción es permanente y no se puede deshacer.</p>
        <div class="flex gap-3 justify-center">
          <button @click="showDeleteModal = false" class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors text-sm flex-1">
            Cancelar
          </button>
          <button @click="deleteChat" class="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors text-sm flex-1">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { marked } from 'marked';
import { useAuthStore } from '@/features/auth/stores/authStore';

// Get API URL from .env or fallback
const API_URL = 'https://agente.picklechatbot.promolider.org/api/v1/chats';

// Auth and User
const authStore = useAuthStore();
const userId = computed(() => {
  return authStore.user?.id || 1; // Fallback to 1 if no user (should not happen in protected route)
});

// State
const chats = ref([]);
const messages = ref([]);
const currentChatId = ref(null);
const inputText = ref('');
const isWaitingForResponse = ref(false);
const loadingChats = ref(false);
const selectedModel = ref('nvidia');
const messagesContainer = ref(null);

// Form handling state
const isAwaitingFormAnswers = ref(false);

// Modal state
const showDeleteModal = ref(false);
const chatToDelete = ref(null);

// Loading messages
const loadingMessagesList = [
  "Analizando tu mensaje...",
  "Consultando las mejores prácticas...",
  "Estructurando el contenido...",
  "Generando ideas clave...",
  "Diseñando la respuesta...",
  "Casi listo..."
];
const loadingText = ref('Procesando...');
let loadingInterval = null;

// Parse Markdown safely
const parseMarkdown = (text) => {
  if (!text) return '';
  return marked.parse(text);
};

// Scroll to bottom
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Start Loading Animation
const startLoadingAnimation = () => {
  isWaitingForResponse.value = true;
  loadingText.value = 'Procesando...';
  let index = 0;
  loadingInterval = setInterval(() => {
    loadingText.value = loadingMessagesList[index % loadingMessagesList.length];
    index++;
  }, 2500);
  scrollToBottom();
};

// Stop Loading Animation
const stopLoadingAnimation = () => {
  isWaitingForResponse.value = false;
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
};

// Load Chat History
const loadChatHistory = async () => {
  loadingChats.value = true;
  try {
    const res = await fetch(`${API_URL}?userId=${userId.value}`);
    if (res.ok) {
      chats.value = await res.json();
    }
  } catch (err) {
    console.error('Error loading chat history:', err);
  } finally {
    loadingChats.value = false;
  }
};

// Start New Chat
const startNewChat = () => {
  currentChatId.value = null;
  messages.value = [];
  isAwaitingFormAnswers.value = false;
};

// Form Logic Methods
const toggleFormOption = (msg, questionId, answer) => {
  if (!msg.selectedAnswers) msg.selectedAnswers = {};
  if (!msg.customAnswers) msg.customAnswers = {};
  
  msg.selectedAnswers[questionId] = answer;
  
  // Clear custom answer if changing away from 'Otros'
  if (answer !== 'Otros') {
    msg.customAnswers[questionId] = '';
  }
};

const isFormOptionSelected = (msg, questionId, answer) => {
  return msg.selectedAnswers && msg.selectedAnswers[questionId] === answer;
};

const isFormComplete = (msg) => {
  if (!msg.content || !msg.content.questions) return false;
  
  return msg.content.questions.every(q => {
    const selected = msg.selectedAnswers?.[q.id];
    if (!selected) return false;
    if (selected === 'Otros') {
      return !!msg.customAnswers?.[q.id]?.trim();
    }
    return true;
  });
};

const submitForm = async (msg) => {
  if (!isFormComplete(msg)) return;
  
  const answers = msg.content.questions.map(q => {
    const selected = msg.selectedAnswers[q.id];
    const finalAnswer = selected === 'Otros' ? msg.customAnswers[q.id].trim() : selected;
    return {
      questionId: q.id,
      answer: finalAnswer
    };
  });
  
  msg.formSubmitted = true;
  isAwaitingFormAnswers.value = false;
  
  messages.value.push({
    type: 'form_answers',
    role: 'user',
    content: { text: "Respuestas del formulario enviadas." }
  });
  
  await sendPayload({
    role: 'user',
    type: 'form',
    content: { answers }
  });
};

// Load specific chat
const loadChat = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (res.ok) {
      const data = await res.json();
      currentChatId.value = data.id;
      
      // Process messages to inject reactive form state
      messages.value = data.messages.map(m => {
        if (m.type === 'form') {
          return {
            ...m,
            selectedAnswers: {},
            customAnswers: {},
            formSubmitted: data.status !== 'awaiting_form_answers'
          };
        }
        return m;
      });
      
      isAwaitingFormAnswers.value = data.status === 'awaiting_form_answers';
      
      // If awaiting form, ensure the last form message is active
      if (isAwaitingFormAnswers.value) {
        const lastFormMsg = [...messages.value].reverse().find(m => m.type === 'form');
        if (lastFormMsg) {
          lastFormMsg.formSubmitted = false;
        }
      }
      
      scrollToBottom();
    }
  } catch (err) {
    console.error('Error loading chat:', err);
    messages.value.push({
      role: 'assistant',
      type: 'text',
      content: { text: 'Error al cargar el historial del chat.' }
    });
  }
};

// Send Text Message
const sendMessage = () => {
  if (!inputText.value.trim() || isWaitingForResponse.value || isAwaitingFormAnswers.value) return;
  
  const text = inputText.value.trim();
  inputText.value = '';
  
  messages.value.push({
    role: 'user',
    type: 'text',
    content: { text }
  });
  
  sendPayload({
    role: 'user',
    type: 'text',
    content: { text }
  });
};

// Core Send Payload
const sendPayload = async (payload) => {
  // Create chat if it doesn't exist
  if (!currentChatId.value) {
    const title = payload.type === 'text' ? payload.content.text : 'Nuevo Chat';
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    
    try {
      const createRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.value, title: shortTitle })
      });
      const data = await createRes.json();
      currentChatId.value = data.id;
      loadChatHistory();
    } catch (err) {
      console.error("Error creating chat:", err);
      messages.value.push({ role: 'assistant', type: 'text', content: { text: 'Error al conectar con el servidor.' } });
      return;
    }
  }
  
  startLoadingAnimation();
  
  try {
    const res = await fetch(`${API_URL}/${currentChatId.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    stopLoadingAnimation();
    
    if (data.type === 'text') {
      messages.value.push(data);
    } else if (data.type === 'form') {
      isAwaitingFormAnswers.value = true;
      messages.value.push({
        ...data,
        selectedAnswers: {},
        customAnswers: {},
        formSubmitted: false
      });
    }
    
    scrollToBottom();
  } catch (err) {
    stopLoadingAnimation();
    console.error("Error sending message:", err);
    messages.value.push({
      role: 'assistant',
      type: 'text',
      content: { text: 'Hubo un error al procesar tu mensaje.' }
    });
    scrollToBottom();
  }
};

// Delete Chat Logic
const confirmDeleteChat = (id) => {
  chatToDelete.value = id;
  showDeleteModal.value = true;
};

const deleteChat = async () => {
  if (!chatToDelete.value) return;
  
  const id = chatToDelete.value;
  showDeleteModal.value = false;
  chatToDelete.value = null;
  
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (currentChatId.value === id) {
      startNewChat();
    }
    loadChatHistory();
  } catch (err) {
    console.error('Error deleting chat:', err);
  }
};

// Provider Switch Logic
const switchModel = async () => {
  try {
    await fetch(`${API_URL}/config/provider`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedModel.value })
    });
  } catch (err) {
    console.error('Error switching provider:', err);
  }
};

onMounted(() => {
  loadChatHistory();
});
</script>

<style scoped>
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-list::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-list::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Base styles for markdown rendered content inside .prose-invert */
:deep(.prose-invert h1) { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: #f8fafc; }
:deep(.prose-invert h2) { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.25rem; }
:deep(.prose-invert h3) { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 0.75rem; color: #e2e8f0; }
:deep(.prose-invert p) { margin-bottom: 0.75rem; }
:deep(.prose-invert p:last-child) { margin-bottom: 0; }
:deep(.prose-invert ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
:deep(.prose-invert ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
:deep(.prose-invert li) { margin-bottom: 0.25rem; }
:deep(.prose-invert strong) { font-weight: 600; color: #fff; }
:deep(.prose-invert a) { color: #818cf8; text-decoration: underline; }
:deep(.prose-invert code) { background: rgba(0,0,0,0.3); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
:deep(.prose-invert pre) { background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 0.75rem; }
:deep(.prose-invert pre code) { background: transparent; padding: 0; }
</style>
