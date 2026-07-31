<template>
  <div class="pickle-layout w-full grid grid-cols-1 md:grid-cols-[17rem_1fr] gap-4 relative overflow-hidden rounded-xl">
    <!-- Background accents -->
    <div class="pickle-glow absolute top-[20%] left-[10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="pickle-glow absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Sidebar -->
    <div class="sidebar w-full order-2 md:order-1 glass-panel overflow-hidden flex flex-col rounded-2xl z-10 min-h-0">
      <div class="flex flex-col h-full min-h-0 p-4 md:p-6">

          <!-- Header -->
        <div class="chat-header p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="pickle-avatar w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-lg">
                P
              </div>
              <div>
                <h2 class="pickle-title font-semibold text-sm">Pickle Bot</h2>
              </div>
            </div>
          </div>

        <button @click="startNewChat" class="pickle-primary-btn new-chat-btn w-full font-semibold py-3 px-4 rounded-xl transition-colors duration-200 mb-5 flex items-center justify-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nuevo Chat
        </button>

        <p class="pickle-label text-xs font-semibold uppercase tracking-wider mb-2 px-1 pb-2">Historial</p>

        <div class="chat-list flex-1 min-h-0 overflow-y-auto pr-1 mt-1 flex flex-col gap-1">
          <div v-if="pickleBotStore.loadingChats" class="pickle-text-muted flex flex-col items-center justify-center gap-2 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pickle-spinner animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span class="text-xs">Cargando historiales...</span>
          </div>
          <div v-else-if="pickleBotStore.chats.length === 0" class="pickle-text-muted flex flex-col items-center justify-center gap-2 py-8 text-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="text-xs">No hay chats recientes</span>
          </div>
          <div v-else v-for="chat in pickleBotStore.chats" :key="chat.id"
               class="pickle-chat-item group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 border-l-2"
               :class="{ 'pickle-chat-item--active': pickleBotStore.currentChat?.id === chat.id }"
               @click="loadChat(chat.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 opacity-60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="chat-title truncate flex-1 text-xs">{{ chat.title || 'Nuevo Chat' }}</span>
            <button @click.stop="confirmDeleteChat(chat.id)"
                    class="pickle-delete-btn shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-transparent md:opacity-0 md:group-hover:opacity-100 transition-all duration-150"
                    title="Eliminar chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-container order-1 md:order-2 min-h-0 glass-panel flex flex-col rounded-2xl z-10 overflow-hidden shadow-2xl">

      <!-- Messages -->
      <div class="chat-messages flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scroll-smooth" ref="messagesContainer">

        <!-- Welcome Message (only if new chat) -->
        <div v-if="!pickleBotStore.currentChat && pickleBotStore.messages.length === 0" class="pickle-msg pickle-msg--assistant message assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] animate-fade-in-up">
          <div class="prose prose-invert max-w-none text-xs leading-relaxed">
            ¡Hola! Soy Pickle. Escribe algo para comenzar a crear tu curso.
          </div>
        </div>

        <!-- Render Messages -->
        <template v-for="(msg, index) in pickleBotStore.messages" :key="index">

          <!-- Text Message -->
          <div v-if="msg.type === 'text' || msg.type === 'form_answers' || msg.type === 'title_selection'"
               class="message py-3 px-4 rounded-2xl max-w-[85%] animate-fade-in-up break-words"
               :class="msg.role === 'user' ? 'pickle-msg pickle-msg--user user self-end rounded-br-sm shadow-lg' : 'pickle-msg pickle-msg--assistant assistant self-start rounded-bl-sm'">
            <div v-if="msg.role === 'assistant'" class="prose prose-invert max-w-none text-xs leading-relaxed" v-html="parseMarkdown(msg.content.text || msg.content)"></div>
            <div v-else class="text-xs whitespace-pre-wrap">{{ msg.content.text || 'Respuestas enviadas' }}</div>
          </div>

          <!-- Form Message -->
          <PickleFormMessage v-if="msg.type === 'form'" :msg="msg"
                              :disabled="msg.formSubmitted || pickleBotStore.isSending"
                              @submit="submitForm(msg)" />

          <!-- Title Selection Message -->
          <PickleTitlesMessage v-if="msg.type === 'titles'" :msg="msg"
                                :disabled="msg.titlesSubmitted || pickleBotStore.isSending"
                                @select="(id) => selectTitle(msg, id)"
                                @regenerate="(rec) => regenerateTitles(msg, rec)" />

          <!-- Course Draft Message -->
          <PickleCourseDraftMessage v-if="msg.type === 'course_draft'" :content="msg.content" />
        </template>

        <!-- Typing Indicator -->
        <div v-show="pickleBotStore.isSending" class="pickle-msg pickle-msg--assistant typing-indicator assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] flex items-center gap-3 animate-fade-in-up">
          <div class="flex gap-1.5">
            <div class="pickle-dot w-1.5 h-1.5 rounded-full animate-bounce" style="animation-delay: -0.32s"></div>
            <div class="pickle-dot w-1.5 h-1.5 rounded-full animate-bounce" style="animation-delay: -0.16s"></div>
            <div class="pickle-dot w-1.5 h-1.5 rounded-full animate-bounce"></div>
          </div>
          <span class="pickle-text-muted text-xs">{{ loadingText }}</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input p-4 md:p-5">
        <p v-if="!userId" class="pickle-error-text text-xs mb-2">
          No se pudo identificar tu usuario. Vuelve a iniciar sesión para usar Pickle Bot.
        </p>
        <form @submit.prevent="sendMessage" class="flex items-center gap-3 relative">
          <!-- Model Selector -->
          <div class="model-selector relative shrink-0" @click.stop>
            <button type="button" @click="toggleModelMenu"
                    class="pickle-model-btn flex items-center gap-2 h-12 md:h-14 text-xs px-3.5 rounded-full outline-none transition-all cursor-pointer"
                    :class="{ 'pickle-model-btn--open': isModelMenuOpen }">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: selectedModelInfo.color }"></span>
              <span class="truncate max-w-[90px] sm:max-w-[130px]">{{ selectedModelInfo.label }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pickle-text-muted transition-transform duration-150 shrink-0" :class="{ 'rotate-180': isModelMenuOpen }"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <Transition name="model-menu-fade">
              <div v-if="isModelMenuOpen" class="pickle-model-menu model-menu rounded-xl p-1.5 shadow-2xl z-30 overflow-hidden">
                <button v-for="m in models" :key="m.value" type="button" @click="chooseModel(m.value)"
                        class="pickle-model-menu-item w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg transition-colors"
                        :class="{ 'pickle-model-menu-item--active': m.value === selectedModel }">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0 mt-1" :style="{ backgroundColor: m.color }"></span>
                  <div class="flex-1 min-w-0">
                    <div class="pickle-model-menu-item-title text-xs font-medium">{{ m.label }}</div>
                    <div class="pickle-text-muted text-xs mt-0.5">{{ m.description }}</div>
                  </div>
                  <svg v-if="m.value === selectedModel" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="pickle-check-icon shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
              </div>
            </Transition>
          </div>

          <input type="text"
                 v-model="inputText"
                 placeholder="Escribe tu mensaje aquí..."
                 :disabled="!userId || pickleBotStore.isSending || pickleBotStore.isAwaitingFormAnswers || pickleBotStore.isAwaitingTitleSelection"
                 class="pickle-input flex-1 rounded-full px-5 py-3.5 text-sm outline-none transition-all disabled:opacity-40"
                 autocomplete="off">
          <button type="submit"
                  :disabled="!inputText.trim() || !userId || pickleBotStore.isSending || pickleBotStore.isAwaitingFormAnswers || pickleBotStore.isAwaitingTitleSelection"
                  class="pickle-send-btn w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="glass-panel w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl animate-scale-in">
        <div class="pickle-danger-icon w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="14" y1="11" y2="17"/></svg>
        </div>
        <h3 class="pickle-title text-base font-semibold mb-2">¿Eliminar este chat?</h3>
        <p class="pickle-text-muted text-xs mb-6">Esta acción es permanente y no se puede deshacer.</p>
        <div class="flex gap-3 justify-center">
          <button @click="showDeleteModal = false" class="pickle-btn-cancel px-5 py-2.5 rounded-xl font-medium transition-colors text-xs flex-1">
            Cancelar
          </button>
          <button @click="deleteChat" class="pickle-btn-danger px-5 py-2.5 rounded-xl font-medium transition-colors text-xs flex-1">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/landing-tailwind.css';
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
import { marked } from 'marked';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usePickleBotStore } from '@/features/picklebot/stores/pickleBotStore';
import PickleFormMessage from '@/features/picklebot/components/PickleFormMessage.vue';
import PickleTitlesMessage from '@/features/picklebot/components/PickleTitlesMessage.vue';
import PickleCourseDraftMessage from '@/features/picklebot/components/PickleCourseDraftMessage.vue';

// Auth and User
const authStore = useAuthStore();
const pickleBotStore = usePickleBotStore();
const userId = computed(() => authStore.userId);

// Local UI state
const inputText = ref('');
const selectedModel = ref(pickleBotStore.provider);
const messagesContainer = ref(null);

// Model Selector
const models = [
  { value: 'nvidia', label: 'NVIDIA Llama 3', description: 'Modelo open-source, rápido y económico', color: '#76b900' },
  { value: 'gemini', label: 'Gemini 2.0 Flash', description: 'Rápido y equilibrado', color: '#4285f4' },
  { value: 'openai', label: 'GPT-4o Mini', description: 'Modelo compacto de OpenAI', color: '#10a37f' },
];
const isModelMenuOpen = ref(false);
const selectedModelInfo = computed(() => models.find(m => m.value === selectedModel.value) || models[0]);

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

// Algunos proveedores (ej. GPT-4o Mini) envuelven toda la respuesta en un
// bloque de código ```markdown ... ```, que `marked` renderiza tal cual
// (correcto para bloques de código reales), mostrando los "#" sin parsear.
// Si el texto completo es un único bloque envolvente, se desenvuelve antes.
const FENCE_WRAPPER_RE = /^\s*```(?:markdown|md)?\s*\n([\s\S]*?)\n?```\s*$/i;

// Parse Markdown safely
const parseMarkdown = (text) => {
  if (!text) return '';
  const unwrapped = text.replace(FENCE_WRAPPER_RE, '$1');
  return marked.parse(unwrapped);
};

// Scroll to bottom
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Drive the rotating loading text off the store's isSending flag
watch(() => pickleBotStore.isSending, (sending) => {
  if (sending) {
    loadingText.value = 'Procesando...';
    let index = 0;
    loadingInterval = setInterval(() => {
      loadingText.value = loadingMessagesList[index % loadingMessagesList.length];
      index++;
    }, 2500);
    scrollToBottom();
  } else if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
    scrollToBottom();
  }
});

// Start New Chat
const startNewChat = () => {
  pickleBotStore.startNewChat();
};

// Form Logic Methods
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

  await pickleBotStore.sendFormAnswers(answers);
  scrollToBottom();
};

// Title Selection Methods
const selectTitle = async (msg, titleId) => {
  msg.titlesSubmitted = true;
  await pickleBotStore.sendTitleSelection(titleId);
  scrollToBottom();
};

const regenerateTitles = async (msg, recommendation) => {
  msg.titlesSubmitted = true;
  await pickleBotStore.sendTitleSelection('regenerate', recommendation || undefined);
  scrollToBottom();
};

// Load specific chat
const loadChat = async (id) => {
  await pickleBotStore.openChat(id);
  scrollToBottom();
};

// Send Text Message
const sendMessage = async () => {
  if (!inputText.value.trim() || pickleBotStore.isSending || pickleBotStore.isAwaitingFormAnswers || !userId.value) return;

  const text = inputText.value.trim();
  inputText.value = '';

  await pickleBotStore.sendTextMessage(userId.value, text);
  scrollToBottom();
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

  await pickleBotStore.removeChat(id);
};

// Provider Switch Logic
const toggleModelMenu = (e) => {
  e.stopPropagation();
  isModelMenuOpen.value = !isModelMenuOpen.value;
};

const closeModelMenu = () => {
  isModelMenuOpen.value = false;
};

const chooseModel = async (value) => {
  isModelMenuOpen.value = false;
  if (value === selectedModel.value) return;
  selectedModel.value = value;
  await pickleBotStore.switchProvider(value);
};

onMounted(() => {
  if (userId.value) {
    pickleBotStore.fetchChats(userId.value);
  }
  window.addEventListener('click', closeModelMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeModelMenu);
});
</script>

<style scoped>
/* Grid en vez de Flexbox para el layout principal: con Grid, ambas
   columnas (sidebar y chat-container) comparten exactamente la misma
   altura de fila del contenedor, sin depender de "align-items: stretch"
   ni de que box-sizing sea border-box en cada hijo. Esto evita el bug
   donde, con box-sizing:content-box heredado (preflight desactivado),
   un panel con padding terminaba más alto que el otro. */
.pickle-layout {
  /* Encaja el chat en la ventana sin que la página scrollee:
     topbar (85px) + padding del contenedor (60px) + footer (46px) del DashboardLayout */
  height: calc(100vh - 195px);
  min-height: 500px;
  /* Fuerza a que la única fila de la grilla ocupe el 100% del alto
     disponible. Sin esto, "grid-auto-rows" queda en "auto" y la fila
     se dimensiona según el contenido más alto (content-based sizing),
     por lo que "stretch" no tiene una altura definida y clara que
     repartir entre sidebar y chat-container: uno de los dos termina
     más corto que el otro según cuánto contenido tenga. */
  grid-auto-rows: 1fr;
  align-items: stretch;

  /* Tokens de color: se derivan de las variables globales del proyecto
     (src/assets/css/variables.css), que ya cambian con body.dark-theme,
     así el chat se adapta automáticamente al tema claro/oscuro. */
  --tint-1: color-mix(in srgb, var(--text-bold) 5%, transparent);
  --tint-2: color-mix(in srgb, var(--text-bold) 9%, transparent);
  --tint-3: color-mix(in srgb, var(--text-bold) 14%, transparent);
  --primary-tint: color-mix(in srgb, var(--primary-color) 15%, transparent);
  --primary-shadow: color-mix(in srgb, var(--primary-color) 25%, transparent);
  --danger-hover: color-mix(in srgb, var(--danger-color) 88%, black);

  background: var(--bg-main);
  color: var(--text-main);
}

/* Ambos paneles deben ocupar el 100% de la fila del grid de forma
   explícita, no solo por herencia del "stretch" implícito. Esto es
   necesario porque cada uno es a su vez un flex-col: un contenedor
   flex NO adquiere altura 100% de su celda de grid automáticamente
   en todos los motores de render si no se lo indicamos, y el hijo
   con "h-full" dentro del sidebar necesita que .sidebar tenga una
   altura ya resuelta (no "auto") para poder heredarla en porcentaje. */
.pickle-layout .sidebar,
.pickle-layout .chat-container {
  height: 100%;
  min-height: 0;
}

/* Mantenemos este fix como red de seguridad adicional, por si algún
   hijo interno sigue heredando content-box de un reset externo. */
.pickle-layout,
.pickle-layout .sidebar,
.pickle-layout .chat-container,
.pickle-layout .chat-list,
.pickle-layout .chat-header,
.pickle-layout .chat-messages,
.pickle-layout .chat-input {
  box-sizing: border-box;
}

/* Acentos decorativos de fondo: sutiles en tema claro, más visibles en oscuro */
.pickle-glow {
  background: var(--primary-color);
  opacity: 0.08;
}
body.dark-theme .pickle-glow {
  opacity: 0.15;
}

.glass-panel {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
}

.chat-header {
  border-bottom: 1px solid var(--border-color);
}

.chat-input {
  border-top: 1px solid var(--border-color);
}

.pickle-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--white);
}

.pickle-title {
  color: var(--text-bold);
}

.pickle-text-muted {
  color: var(--text-muted);
}

.pickle-label {
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}

.pickle-spinner {
  color: var(--primary-color);
}

.pickle-primary-btn {
  background: var(--primary-color);
  color: var(--white);
}
.pickle-primary-btn:hover {
  background: var(--primary-hover);
}

.pickle-chat-item {
  border-left-color: transparent;
  color: var(--text-muted);
}
.pickle-chat-item:hover {
  background: var(--tint-1);
}
.pickle-chat-item--active {
  background: var(--primary-tint);
  border-left-color: var(--primary-color);
  color: var(--text-bold);
}

.pickle-delete-btn {
  color: var(--text-light);
}
.pickle-delete-btn:hover {
  background: color-mix(in srgb, var(--danger-color) 15%, transparent);
  color: var(--danger-color);
}

.pickle-msg {
  color: var(--text-main);
}
.pickle-msg--assistant {
  background: var(--tint-1);
  border: 1px solid var(--border-color);
}
.pickle-msg--user {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--white);
  box-shadow: 0 10px 20px -5px var(--primary-shadow);
}

.pickle-dot {
  background: var(--primary-color);
}

.pickle-error-text {
  color: var(--danger-color);
}

.pickle-input {
  background: var(--tint-1);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.pickle-input::placeholder {
  color: var(--text-muted);
}
.pickle-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-tint);
}

.pickle-send-btn {
  background: var(--primary-color);
  color: var(--white);
  box-shadow: 0 10px 20px -5px var(--primary-shadow);
}
.pickle-send-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.pickle-model-btn {
  background: var(--tint-1);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.pickle-model-btn:hover {
  background: var(--tint-2);
}
.pickle-model-btn--open {
  background: var(--tint-2);
}
.pickle-model-btn:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-tint);
}

.pickle-model-menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  width: 288px;
  max-width: calc(100vw - 3rem);
  background: var(--bg-main);
  border: 1px solid var(--border-color);
}

.pickle-model-menu-item {
  background: transparent;
  color: var(--text-main);
}
.pickle-model-menu-item:hover {
  background: var(--tint-1);
}
.pickle-model-menu-item--active {
  background: var(--tint-2);
}
.pickle-model-menu-item-title {
  color: var(--text-main);
}
.pickle-model-menu-item--active .pickle-model-menu-item-title {
  color: var(--text-bold);
}
.pickle-check-icon {
  color: var(--primary-color);
}

.pickle-danger-icon {
  background: color-mix(in srgb, var(--danger-color) 18%, transparent);
  color: var(--danger-color);
}

.pickle-btn-cancel {
  background: var(--tint-1);
  color: var(--text-bold);
}
.pickle-btn-cancel:hover {
  background: var(--tint-2);
}

.pickle-btn-danger {
  background: var(--danger-color);
  color: var(--white);
}
.pickle-btn-danger:hover {
  background: var(--danger-hover);
}

.model-menu-fade-enter-active,
.model-menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.model-menu-fade-enter-from,
.model-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.chat-list::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-list::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: var(--tint-3);
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
:deep(.prose-invert h1) { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-bold); }
:deep(.prose-invert h2) { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 1rem; color: var(--text-bold); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; }
:deep(.prose-invert h3) { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 0.75rem; color: var(--text-bold); }
:deep(.prose-invert p) { margin-bottom: 0.75rem; }
:deep(.prose-invert p:last-child) { margin-bottom: 0; }
:deep(.prose-invert ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
:deep(.prose-invert ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
:deep(.prose-invert li) { margin-bottom: 0.25rem; }
:deep(.prose-invert strong) { font-weight: 600; color: var(--text-bold); }
:deep(.prose-invert a) { color: var(--primary-color); text-decoration: underline; }
:deep(.prose-invert code) { background: var(--tint-2); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
:deep(.prose-invert pre) { background: var(--tint-2); padding: 0.75rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 0.75rem; }
:deep(.prose-invert pre code) { background: transparent; padding: 0; }
</style>
