        <template>
  <div class="creator-ai-layout w-full grid grid-cols-1 md:grid-cols-[17rem_1fr] gap-4 relative overflow-hidden rounded-xl">
    <!-- Background accents -->
    <div class="creator-ai-glow absolute top-[20%] left-[10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="creator-ai-glow absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Sidebar -->
    <div class="sidebar w-full order-2 md:order-1 glass-panel overflow-hidden flex flex-col rounded-2xl z-10 min-h-0">
      <div class="flex flex-col h-full min-h-0 p-4 md:p-6">

          <!-- Header -->
        <div class="chat-header p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="creator-ai-avatar w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-lg">
                P
              </div>
              <div>
                <h2 class="creator-ai-title font-semibold text-sm">Creator AI™</h2>
              </div>
            </div>
          </div>

        <button @click="startNewChat" class="creator-ai-primary-btn new-chat-btn w-full font-semibold py-3 px-4 rounded-xl transition-colors duration-200 mb-5 flex items-center justify-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nuevo Chat
        </button>

        <p class="creator-ai-label text-xs font-semibold uppercase tracking-wider mb-2 px-1 pb-2">Historial</p>

        <div class="chat-list flex-1 min-h-0 overflow-y-auto pr-1 mt-1 flex flex-col gap-1">
          <div v-if="creatorAiStore.loadingChats" class="creator-ai-text-muted flex flex-col items-center justify-center gap-2 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="creator-ai-spinner animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span class="text-xs">Cargando historiales...</span>
          </div>
          <div v-else-if="creatorAiStore.chats.length === 0" class="creator-ai-text-muted flex flex-col items-center justify-center gap-2 py-8 text-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="text-xs">No hay chats recientes</span>
          </div>
          <div v-else v-for="chat in creatorAiStore.chats" :key="chat.id" role="button" tabindex="0"
               class="creator-ai-chat-item group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 border-l-2"
               :class="{ 'creator-ai-chat-item--active': creatorAiStore.currentChat?.id === chat.id }"
               :aria-current="creatorAiStore.currentChat?.id === chat.id ? 'true' : undefined"
               :title="chat.title || 'Nuevo Chat'"
               @click="loadChat(chat.id)"
               @keydown.enter="loadChat(chat.id)"
               @keydown.space.prevent="loadChat(chat.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 opacity-60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="chat-title truncate flex-1 text-xs">{{ chat.title || 'Nuevo Chat' }}</span>
            <button type="button"
                    @click.stop="confirmDeleteChat(chat.id)"
                    class="creator-ai-delete-btn shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-all duration-150"
                    :aria-label="`Eliminar chat ${chat.title || 'Nuevo Chat'}`">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-container order-1 md:order-2 min-h-0 glass-panel flex flex-col rounded-2xl z-10 overflow-hidden shadow-2xl">

      <!-- Messages -->
      <div class="chat-messages flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scroll-smooth" ref="messagesContainer"
           role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación con Creator AI™">

        <!-- Welcome Message (only if new chat) -->
        <div v-if="!creatorAiStore.currentChat && creatorAiStore.messages.length === 0" class="creator-ai-msg creator-ai-msg--assistant message assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] animate-fade-in-up">
          <div class="prose prose-invert max-w-none text-xs leading-relaxed">
            ¡Hola! Soy Creator AI™. Escribe algo para comenzar a crear tu curso.
          </div>
        </div>

        <!-- Render Messages -->
        <template v-for="(msg, index) in creatorAiStore.messages" :key="index">

          <!-- Text Message (also covers the persisted echo of the user's form/title submissions,
               which share the 'form'/'titles' type with the assistant's own messages but carry
               no questions/options of their own) -->
          <div v-if="msg.type === 'text' || msg.type === 'form_answers' || msg.type === 'title_selection' || (msg.role === 'user' && (msg.type === 'form' || msg.type === 'titles'))"
               class="message py-3 px-4 rounded-2xl max-w-[85%] animate-fade-in-up break-words"
               :class="msg.role === 'user' ? 'creator-ai-msg creator-ai-msg--user user self-end rounded-br-sm shadow-lg' : 'creator-ai-msg creator-ai-msg--assistant assistant self-start rounded-bl-sm'">
            <div v-if="msg.role === 'assistant'" class="prose prose-invert max-w-none text-xs leading-relaxed" v-html="parseMarkdown(msg.content.text || msg.content)"></div>
            <div v-else class="text-xs whitespace-pre-wrap">{{ msg.content.text || (msg.type === 'titles' ? 'Título seleccionado.' : 'Respuestas enviadas.') }}</div>
          </div>

          <!-- Form Message -->
          <CreatorAiFormMessage v-if="msg.type === 'form' && msg.role === 'assistant'" :msg="msg"
                              :disabled="msg.formSubmitted || creatorAiStore.isSending"
                              @submit="submitForm(msg)" />

          <!-- Title Selection Message -->
          <CreatorAiTitlesMessage v-if="msg.type === 'titles' && msg.role === 'assistant'" :msg="msg"
                                :disabled="msg.titlesSubmitted || creatorAiStore.isSending"
                                @select="(id) => selectTitle(msg, id)"
                                @regenerate="(rec) => regenerateTitles(msg, rec)" />

          <!-- Course Draft Message -->
          <CreatorAiCourseDraftMessage v-if="msg.type === 'course_draft' && msg.role === 'assistant'" :content="msg.content" />

          <!-- Fallback: unrecognized message type from the backend — never fail silently -->
          <div v-if="!KNOWN_MESSAGE_TYPES.includes(msg.type)"
               class="creator-ai-msg creator-ai-msg--assistant assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] animate-fade-in-up">
            <p class="creator-ai-error-text text-[11px] font-medium mb-1">Tipo de mensaje no reconocido: "{{ msg.type }}"</p>
            <pre class="text-[10px] whitespace-pre-wrap break-all opacity-70">{{ JSON.stringify(msg.content, null, 2) }}</pre>
          </div>
        </template>

        <!-- Typing Indicator -->
        <div v-show="creatorAiStore.isSending" class="creator-ai-msg creator-ai-msg--assistant typing-indicator assistant self-start rounded-2xl rounded-bl-sm py-3 px-4 max-w-[85%] flex items-center gap-3 animate-fade-in-up"
             role="status" aria-live="polite">
          <div v-if="pendingAction === 'titles'" class="typing-icon typing-icon--search shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <div v-else-if="pendingAction === 'draft'" class="typing-icon typing-icon--draft shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 4.9L5 9.8l4.1 3-1.5 5.2L12 15l4.4 3-1.5-5.2 4.1-3-5.1-1.9L12 3Z"/></svg>
          </div>
          <div v-else class="flex gap-1.5">
            <div class="creator-ai-dot w-1.5 h-1.5 rounded-full animate-bounce" style="animation-delay: -0.32s"></div>
            <div class="creator-ai-dot w-1.5 h-1.5 rounded-full animate-bounce" style="animation-delay: -0.16s"></div>
            <div class="creator-ai-dot w-1.5 h-1.5 rounded-full animate-bounce"></div>
          </div>
          <span class="creator-ai-text-muted text-xs">{{ loadingText }}</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input p-4 md:p-5">
        <p v-if="!userId" class="creator-ai-error-text text-xs mb-2" role="alert">
          No se pudo identificar tu usuario. Vuelve a iniciar sesión para usar Creator AI™.
        </p>
        <div v-else-if="creatorAiStore.error" class="creator-ai-error-banner flex items-start gap-2 text-xs mb-2 px-3 py-2 rounded-lg" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span class="flex-1 min-w-0 break-words">{{ creatorAiStore.error }}</span>
          <button type="button" class="creator-ai-error-dismiss shrink-0" @click="creatorAiStore.error = null" aria-label="Cerrar aviso">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="sendMessage" class="flex items-center gap-3 relative">
          <!-- Model Selector -->
          <div class="model-selector relative shrink-0" @click.stop>
            <button type="button" @click="toggleModelMenu"
                    class="creator-ai-model-btn flex items-center gap-2 h-12 md:h-14 text-xs px-3.5 rounded-full outline-none transition-all cursor-pointer"
                    :class="{ 'creator-ai-model-btn--open': isModelMenuOpen }"
                    aria-haspopup="listbox" :aria-expanded="isModelMenuOpen" aria-label="Elegir modelo de IA">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: selectedModelInfo.color }"></span>
              <span class="truncate max-w-[90px] sm:max-w-[130px]">{{ selectedModelInfo.label }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="creator-ai-text-muted transition-transform duration-150 shrink-0" :class="{ 'rotate-180': isModelMenuOpen }"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <Transition name="model-menu-fade">
              <div v-if="isModelMenuOpen" class="creator-ai-model-menu model-menu rounded-xl p-1.5 shadow-2xl z-30 overflow-hidden" role="listbox">
                <button v-for="m in models" :key="m.value" type="button" @click="chooseModel(m.value)"
                        class="creator-ai-model-menu-item w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg transition-colors"
                        :class="{ 'creator-ai-model-menu-item--active': m.value === selectedModel }"
                        role="option" :aria-selected="m.value === selectedModel">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0 mt-1" :style="{ backgroundColor: m.color }"></span>
                  <div class="flex-1 min-w-0">
                    <div class="creator-ai-model-menu-item-title text-xs font-medium">{{ m.label }}</div>
                    <div class="creator-ai-text-muted text-xs mt-0.5">{{ m.description }}</div>
                  </div>
                  <svg v-if="m.value === selectedModel" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="creator-ai-check-icon shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Embedding Provider Selector (RAG) -->
          <div class="model-selector relative shrink-0" @click.stop title="Proveedor de embeddings (RAG)">
            <button type="button" @click="toggleEmbeddingMenu"
                    class="creator-ai-model-btn flex items-center gap-2 h-12 md:h-14 text-xs px-3.5 rounded-full outline-none transition-all cursor-pointer"
                    :class="{ 'creator-ai-model-btn--open': isEmbeddingMenuOpen }"
                    aria-haspopup="listbox" :aria-expanded="isEmbeddingMenuOpen" aria-label="Elegir proveedor de embeddings (RAG)">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" :style="{ color: selectedEmbeddingModelInfo.color }"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              <span class="truncate max-w-[90px] sm:max-w-[130px]">{{ selectedEmbeddingModelInfo.label }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="creator-ai-text-muted transition-transform duration-150 shrink-0" :class="{ 'rotate-180': isEmbeddingMenuOpen }"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <Transition name="model-menu-fade">
              <div v-if="isEmbeddingMenuOpen" class="creator-ai-model-menu model-menu rounded-xl p-1.5 shadow-2xl z-30 overflow-hidden" role="listbox">
                <button v-for="m in embeddingModels" :key="m.value" type="button" @click="chooseEmbeddingModel(m.value)"
                        class="creator-ai-model-menu-item w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg transition-colors"
                        :class="{ 'creator-ai-model-menu-item--active': m.value === selectedEmbeddingModel }"
                        role="option" :aria-selected="m.value === selectedEmbeddingModel">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0 mt-1" :style="{ backgroundColor: m.color }"></span>
                  <div class="flex-1 min-w-0">
                    <div class="creator-ai-model-menu-item-title text-xs font-medium">{{ m.label }}</div>
                    <div class="creator-ai-text-muted text-xs mt-0.5">{{ m.description }}</div>
                  </div>
                  <svg v-if="m.value === selectedEmbeddingModel" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="creator-ai-check-icon shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
              </div>
            </Transition>
          </div>

          <label for="creator-ai-chat-input" class="sr-only">Mensaje para Creator AI™</label>
          <input id="creator-ai-chat-input" type="text"
                 v-model="inputText"
                 placeholder="Escribe tu mensaje aquí..."
                 :disabled="!userId || creatorAiStore.isSending || creatorAiStore.isAwaitingFormAnswers || creatorAiStore.isAwaitingTitleSelection"
                 class="creator-ai-input flex-1 rounded-full px-5 py-3.5 text-sm outline-none transition-all disabled:opacity-40"
                 autocomplete="off">
          <button type="submit"
                  :disabled="!inputText.trim() || !userId || creatorAiStore.isSending || creatorAiStore.isAwaitingFormAnswers || creatorAiStore.isAwaitingTitleSelection"
                  class="creator-ai-send-btn w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Enviar mensaje">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
         @click.self="showDeleteModal = false" @keydown.esc="showDeleteModal = false">
      <div class="glass-panel w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl animate-scale-in"
           role="alertdialog" aria-modal="true" aria-labelledby="creator-ai-delete-title" aria-describedby="creator-ai-delete-desc">
        <div class="creator-ai-danger-icon w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="14" y1="11" y2="17"/></svg>
        </div>
        <h3 id="creator-ai-delete-title" class="creator-ai-title text-base font-semibold mb-2">¿Eliminar este chat?</h3>
        <p id="creator-ai-delete-desc" class="creator-ai-text-muted text-xs mb-6">Esta acción es permanente y no se puede deshacer.</p>
        <div class="flex gap-3 justify-center">
          <button ref="cancelDeleteBtn" @click="showDeleteModal = false" class="creator-ai-btn-cancel px-5 py-2.5 rounded-xl font-medium transition-colors text-xs flex-1">
            Cancelar
          </button>
          <button @click="deleteChat" class="creator-ai-btn-danger px-5 py-2.5 rounded-xl font-medium transition-colors text-xs flex-1">
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
import { useCreatorAiStore } from '@/features/creator-ai/stores/creatorAiStore';
import CreatorAiFormMessage from '@/features/creator-ai/components/CreatorAiFormMessage.vue';
import CreatorAiTitlesMessage from '@/features/creator-ai/components/CreatorAiTitlesMessage.vue';
import CreatorAiCourseDraftMessage from '@/features/creator-ai/components/CreatorAiCourseDraftMessage.vue';

// Auth and User
const authStore = useAuthStore();
const creatorAiStore = useCreatorAiStore();
const userId = computed(() => authStore.userId);

const KNOWN_MESSAGE_TYPES = ['text', 'form_answers', 'title_selection', 'form', 'titles', 'course_draft'];

// Local UI state
const inputText = ref('');
const selectedModel = ref(creatorAiStore.provider);
const messagesContainer = ref(null);

// Model Selector
const models = [
  { value: 'deepseek', label: 'DeepSeek Chat', description: 'Proveedor por defecto de Creator AI™', color: '#4f6bed' },
  { value: 'nvidia', label: 'NVIDIA Llama 3', description: 'Modelo open-source, rápido y económico', color: '#76b900' },
  { value: 'gemini', label: 'Gemini 2.0 Flash', description: 'Rápido y equilibrado', color: '#4285f4' },
  { value: 'openai', label: 'GPT-4o Mini', description: 'Modelo compacto de OpenAI', color: '#10a37f' },
];
const isModelMenuOpen = ref(false);
const selectedModelInfo = computed(() => models.find(m => m.value === selectedModel.value) || models[0]);

// Embedding Provider Selector (RAG) — switch independiente del LLM, DeepSeek
// no ofrece embeddings así que queda fuera de esta lista.
const selectedEmbeddingModel = ref(creatorAiStore.embeddingProvider);
const embeddingModels = [
  { value: 'nvidia', label: 'NVIDIA e5-v5', description: 'Proveedor por defecto de embeddings', color: '#76b900' },
  { value: 'gemini', label: 'Gemini Embeddings', description: 'Embeddings de Google', color: '#4285f4' },
  { value: 'openai', label: 'OpenAI Embeddings', description: 'Embeddings de OpenAI', color: '#10a37f' },
];
const isEmbeddingMenuOpen = ref(false);
const selectedEmbeddingModelInfo = computed(() => embeddingModels.find(m => m.value === selectedEmbeddingModel.value) || embeddingModels[0]);

// Modal state
const showDeleteModal = ref(false);
const chatToDelete = ref(null);
const cancelDeleteBtn = ref(null);

// Foco por defecto en "Cancelar" al abrir el modal: es una acción destructiva,
// así que el foco no debe caer accidentalmente sobre "Eliminar".
watch(showDeleteModal, async (open) => {
  if (open) {
    await nextTick();
    cancelDeleteBtn.value?.focus();
  }
});

// Loading messages
const loadingMessagesList = [
  "Analizando tu mensaje...",
  "Consultando las mejores prácticas...",
  "Estructurando el contenido...",
  "Generando ideas clave...",
  "Diseñando la respuesta...",
  "Casi listo..."
];
// Se muestran mientras se generan/regeneran títulos, que implica scraping en
// vivo y puede tardar bastante más que una respuesta de chat normal.
const titleSearchMessagesList = [
  "Buscando cursos similares en internet...",
  "Explorando qué se vende mejor ahora mismo...",
  "Comparando precios del mercado...",
  "Analizando títulos exitosos de la competencia...",
  "Afinando los mejores títulos para tu curso...",
  "Casi listo..."
];
// Se muestran mientras se genera el boceto completo del curso a partir del
// título elegido.
const draftGenerationMessagesList = [
  "Creando el boceto de tu curso...",
  "Redactando la descripción...",
  "Definiendo los objetivos de aprendizaje...",
  "Armando el contenido del curso...",
  "Puliendo los últimos detalles...",
  "Casi listo..."
];
// Qué está esperando el usuario en este envío: define qué lista de mensajes
// y qué ícono muestra el indicador de carga.
const pendingAction = ref('default');
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

const LOADING_MESSAGES_BY_ACTION = {
  default: loadingMessagesList,
  titles: titleSearchMessagesList,
  draft: draftGenerationMessagesList,
};

// Drive the rotating loading text off the store's isSending flag
watch(() => creatorAiStore.isSending, (sending) => {
  if (sending) {
    const messages = LOADING_MESSAGES_BY_ACTION[pendingAction.value] || loadingMessagesList;
    let index = 0;
    loadingText.value = messages[index];
    index++;
    loadingInterval = setInterval(() => {
      loadingText.value = messages[index % messages.length];
      index++;
    }, 2500);
    scrollToBottom();
  } else if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
    pendingAction.value = 'default';
    scrollToBottom();
  }
});

// Start New Chat
const startNewChat = () => {
  creatorAiStore.startNewChat();
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
  pendingAction.value = 'titles';
  await creatorAiStore.sendFormAnswers(answers);
  scrollToBottom();
};

// Title Selection Methods
const selectTitle = async (msg, titleId) => {
  msg.titlesSubmitted = true;
  pendingAction.value = 'draft';
  await creatorAiStore.sendTitleSelection(titleId);
  scrollToBottom();
};

const regenerateTitles = async (msg, instructions) => {
  msg.titlesSubmitted = true;
  pendingAction.value = 'titles';
  await creatorAiStore.regenerateTitles(instructions || undefined);
  scrollToBottom();
};

// Load specific chat
const loadChat = async (id) => {
  await creatorAiStore.openChat(id);
  scrollToBottom();
};

// Send Text Message
const sendMessage = async () => {
  if (!inputText.value.trim() || creatorAiStore.isSending || creatorAiStore.isAwaitingFormAnswers || !userId.value) return;

  const text = inputText.value.trim();
  inputText.value = '';

  pendingAction.value = 'default';
  await creatorAiStore.sendTextMessage(userId.value, text);
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

  await creatorAiStore.removeChat(id);
};

// Provider Switch Logic
const toggleModelMenu = (e) => {
  e.stopPropagation();
  isEmbeddingMenuOpen.value = false;
  isModelMenuOpen.value = !isModelMenuOpen.value;
};

const closeModelMenu = () => {
  isModelMenuOpen.value = false;
};

const chooseModel = async (value) => {
  isModelMenuOpen.value = false;
  if (value === selectedModel.value) return;
  selectedModel.value = value;
  await creatorAiStore.switchProvider(value);
};

// Embedding Provider Switch Logic
const toggleEmbeddingMenu = (e) => {
  e.stopPropagation();
  isModelMenuOpen.value = false;
  isEmbeddingMenuOpen.value = !isEmbeddingMenuOpen.value;
};

const closeEmbeddingMenu = () => {
  isEmbeddingMenuOpen.value = false;
};

const chooseEmbeddingModel = async (value) => {
  isEmbeddingMenuOpen.value = false;
  if (value === selectedEmbeddingModel.value) return;
  selectedEmbeddingModel.value = value;
  await creatorAiStore.switchEmbeddingProvider(value);
};

onMounted(() => {
  if (userId.value) {
    creatorAiStore.fetchChats(userId.value);
  }
  window.addEventListener('click', closeModelMenu);
  window.addEventListener('click', closeEmbeddingMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeModelMenu);
  window.removeEventListener('click', closeEmbeddingMenu);
});
</script>

<style scoped>
/* Grid en vez de Flexbox para el layout principal: con Grid, ambas
   columnas (sidebar y chat-container) comparten exactamente la misma
   altura de fila del contenedor, sin depender de "align-items: stretch"
   ni de que box-sizing sea border-box en cada hijo. Esto evita el bug
   donde, con box-sizing:content-box heredado (preflight desactivado),
   un panel con padding terminaba más alto que el otro. */
.creator-ai-layout {
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
.creator-ai-layout .sidebar,
.creator-ai-layout .chat-container {
  height: 100%;
  min-height: 0;
}

/* Mantenemos este fix como red de seguridad adicional, por si algún
   hijo interno sigue heredando content-box de un reset externo. */
.creator-ai-layout,
.creator-ai-layout .sidebar,
.creator-ai-layout .chat-container,
.creator-ai-layout .chat-list,
.creator-ai-layout .chat-header,
.creator-ai-layout .chat-messages,
.creator-ai-layout .chat-input {
  box-sizing: border-box;
}

/* Acentos decorativos de fondo: sutiles en tema claro, más visibles en oscuro */
.creator-ai-glow {
  background: var(--primary-color);
  opacity: 0.08;
}
body.dark-theme .creator-ai-glow {
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

.creator-ai-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--white);
}

.creator-ai-title {
  color: var(--text-bold);
}

.creator-ai-text-muted {
  color: var(--text-muted);
}

.creator-ai-label {
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}

.creator-ai-spinner {
  color: var(--primary-color);
}

.creator-ai-primary-btn {
  background: var(--primary-color);
  color: var(--white);
}
.creator-ai-primary-btn:hover {
  background: var(--primary-hover);
}

.creator-ai-chat-item {
  border-left-color: transparent;
  color: var(--text-muted);
}
.creator-ai-chat-item:hover {
  background: var(--tint-1);
}
.creator-ai-chat-item--active {
  background: var(--primary-tint);
  border-left-color: var(--primary-color);
  color: var(--text-bold);
}

.creator-ai-delete-btn {
  color: var(--text-light);
}
.creator-ai-delete-btn:hover {
  background: color-mix(in srgb, var(--danger-color) 15%, transparent);
  color: var(--danger-color);
}

.creator-ai-msg {
  color: var(--text-main);
}
.creator-ai-msg--assistant {
  background: var(--tint-1);
  border: 1px solid var(--border-color);
}
.creator-ai-msg--user {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--white);
  box-shadow: 0 10px 20px -5px var(--primary-shadow);
}

.creator-ai-dot {
  background: var(--primary-color);
}

.typing-icon--search {
  background: color-mix(in srgb, var(--primary-color) 14%, transparent);
  color: var(--primary-color);
  animation: creator-ai-search-pulse 1.6s ease-in-out infinite;
}

.typing-icon--draft {
  background: color-mix(in srgb, var(--primary-color) 14%, transparent);
  color: var(--primary-color);
  animation: creator-ai-draft-spin 1.8s linear infinite;
}

@keyframes creator-ai-search-pulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.12); opacity: 1; }
}

@keyframes creator-ai-draft-spin {
  0% { transform: rotate(0deg) scale(1); opacity: 0.85; }
  50% { transform: rotate(180deg) scale(1.1); opacity: 1; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.85; }
}

.creator-ai-error-text {
  color: var(--danger-color);
}

.creator-ai-error-banner {
  background: color-mix(in srgb, var(--danger-color) 12%, transparent);
  color: var(--danger-color);
  border: 1px solid color-mix(in srgb, var(--danger-color) 25%, transparent);
}
.creator-ai-error-dismiss {
  color: var(--danger-color);
  opacity: 0.7;
  transition: opacity 0.15s ease;
}
.creator-ai-error-dismiss:hover {
  opacity: 1;
}

/* Foco visible consistente para navegación por teclado en todo el módulo */
.creator-ai-chat-item:focus-visible,
.creator-ai-delete-btn:focus-visible,
.creator-ai-primary-btn:focus-visible,
.creator-ai-send-btn:focus-visible,
.creator-ai-error-dismiss:focus-visible,
.creator-ai-btn-cancel:focus-visible,
.creator-ai-btn-danger:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.creator-ai-input {
  background: var(--tint-1);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.creator-ai-input::placeholder {
  color: var(--text-muted);
}
.creator-ai-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--primary-tint);
}

.creator-ai-send-btn {
  background: var(--primary-color);
  color: var(--white);
  box-shadow: 0 10px 20px -5px var(--primary-shadow);
}
.creator-ai-send-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.creator-ai-model-btn {
  background: var(--tint-1);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.creator-ai-model-btn:hover {
  background: var(--tint-2);
}
.creator-ai-model-btn--open {
  background: var(--tint-2);
}
.creator-ai-model-btn:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-tint);
}

.creator-ai-model-menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  width: 288px;
  max-width: calc(100vw - 3rem);
  background: var(--bg-main);
  border: 1px solid var(--border-color);
}

.creator-ai-model-menu-item {
  background: transparent;
  color: var(--text-main);
}
.creator-ai-model-menu-item:hover {
  background: var(--tint-1);
}
.creator-ai-model-menu-item--active {
  background: var(--tint-2);
}
.creator-ai-model-menu-item-title {
  color: var(--text-main);
}
.creator-ai-model-menu-item--active .creator-ai-model-menu-item-title {
  color: var(--text-bold);
}
.creator-ai-check-icon {
  color: var(--primary-color);
}

.creator-ai-danger-icon {
  background: color-mix(in srgb, var(--danger-color) 18%, transparent);
  color: var(--danger-color);
}

.creator-ai-btn-cancel {
  background: var(--tint-1);
  color: var(--text-bold);
}
.creator-ai-btn-cancel:hover {
  background: var(--tint-2);
}

.creator-ai-btn-danger {
  background: var(--danger-color);
  color: var(--white);
}
.creator-ai-btn-danger:hover {
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
