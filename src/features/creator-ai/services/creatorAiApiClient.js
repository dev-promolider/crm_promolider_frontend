import axios from 'axios';

// CreatorAi tiene su propio indicador de "escribiendo..." en el chat,
// por eso este cliente NO dispara el loader global de la app (a diferencia
// de src/services/apiClient.js): hacerlo tapa todo el panel de chat con el
// overlay de PageLoader.vue en cada mensaje, dando la sensación de recarga.
const creatorAiApiClient = axios.create({
  baseURL: import.meta.env.VITE_CREATOR_AI_API_URL || 'https://agente.creatorai.promolider.org/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default creatorAiApiClient;
