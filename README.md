# Promolíder - Frontend App (Vue 3 + Vite)

Este repositorio contiene la aplicación cliente (Single Page Application) del sistema Promolíder. Hemos migrado las antiguas vistas de Laravel Blade hacia un sistema moderno, reactivo y de alto rendimiento utilizando **Vue 3 (Composition API)** y **Vite**.

## Arquitectura y Organización del Proyecto

El frontend utiliza una arquitectura basada en **Features** (Características) para mantener el código modular, escalable y evitar el acoplamiento global en aplicaciones grandes.

*   **`src/features/`**: Cada módulo importante del sistema tiene su propia carpeta aquí (ej: `auth`, `dashboard`, `marketing`, `courses`). Cada feature agrupa sus propias vistas, componentes específicos y servicios asociados.
*   **`src/layouts/`**: Contiene las plantillas de diseño principales de la aplicación (ej: `DashboardLayout.vue`, `AuthLayout.vue`). Estos layouts sirven de esqueleto para las vistas.
*   **`src/components/`**: Exclusivamente para componentes genéricos y reutilizables en toda la aplicación (ej: Botones, Modales globales, Alertas).
*   **`src/router/index.js`**: Enrutador principal de Vue Router. Las rutas están protegidas mediante *navigation guards* para evitar acceso sin autenticación.
*   **`src/services/apiClient.js`**: Instancia global de Axios configurada para interceptar peticiones, incluir tokens Bearer (Authorization) y manejar errores genéricos de red o autenticación.

## Reglas y Directrices para el Equipo

1.  **Aislamiento de Features:** Un componente específico del Dashboard (`src/features/dashboard/components`) NO debe ser importado en la sección de Marketing. Si un componente se usa en dos módulos distintos, muévelo a `src/components`.
2.  **Llamadas a la API:** Toda comunicación con el backend (Arquitectura Hexagonal) debe hacerse usando la instancia centralizada `apiClient` (`import api from '@/services/apiClient'`). No uses Axios de forma cruda ni hardcodees URLs (Usa las variables del `.env`).
3.  **Manejo del Estado:** Utilizamos `Pinia` (ej: `authStore.js`) para manejar el estado global (como la sesión del usuario activo).
4.  **Composition API:** Todo nuevo componente de Vue debe usar `<script setup>` en lugar del Options API clásico (`data()`, `methods: {}`).

## Ejecución Local

1.  Asegúrate de instalar las dependencias con `npm install`.
2.  Copia o ajusta tu archivo `.env` configurando la ruta base de la API (`VITE_API_BASE_URL=http://127.0.0.1:8000/api`).
3.  Inicia el servidor de desarrollo con `npm run dev`.
