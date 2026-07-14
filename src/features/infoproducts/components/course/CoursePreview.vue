<template>
  <el-dialog
    :model-value="outerVisible"
    width="80%"
    top="1vh"
    title="Previsualización del curso"
    class="full-screen-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @update:model-value="handleDialogVisibility"
  >
    <div v-loading="loading">
      <div
        v-if="items.length > 0"
        class="row course-container"
      >
        <!-- Reproductor y contenido -->
        <div
          v-if="urlVideo"
          class="col-md-7 col-lg-8 video-section"
        >
          <h4 class="course-title">
            <strong>{{ nameCourse }}</strong>
          </h4>

          <div class="video-container">
            <VideoPlayer
              class="video-player-box"
              :src="urlVideo"
              :options="playerOptions"
              :playsinline="true"
              @mounted="handlePlayerMounted"
              @unmounted="cleanupPlayer"
            />
          </div>

          <!-- Navegación -->
          <ul
            id="pills-tab"
            class="nav nav-pills mt-3"
            role="tablist"
          >
            <li class="nav-item" role="presentation">
              <button
                id="pills-home-tab"
                class="nav-link active"
                data-toggle="pill"
                data-target="#pills-home"
                type="button"
                role="tab"
                aria-controls="pills-home"
                aria-selected="true"
              >
                <strong class="bt-title">
                  RESUMEN
                </strong>
              </button>
            </li>

            <li class="nav-item" role="presentation">
              <button
                id="pills-profile-tab"
                class="nav-link"
                data-toggle="pill"
                data-target="#pills-profile"
                type="button"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
              >
                <strong class="bt-title">
                  RECURSOS
                </strong>
              </button>
            </li>

            <li class="nav-item" role="presentation">
              <button
                id="pills-contact-tab"
                class="nav-link"
                data-toggle="pill"
                data-target="#pills-contact"
                type="button"
                role="tab"
                aria-controls="pills-contact"
                aria-selected="false"
              >
                <strong class="bt-title">
                  EXAMEN
                </strong>
              </button>
            </li>

            <li class="nav-item" role="presentation">
              <button
                id="pills-dynamics-tab"
                class="nav-link"
                data-toggle="pill"
                data-target="#pills-dynamics"
                type="button"
                role="tab"
                aria-controls="pills-dynamics"
                aria-selected="false"
              >
                <strong class="bt-title">
                  DINÁMICAS
                </strong>
              </button>
            </li>

            <li class="nav-item">
              <el-tooltip placement="right-end">
                <template #content>
                  Fecha de inicio: 2023-11-27
                  <br />
                  Fecha de finalización: 2024-11-27
                </template>

                <el-button class="nav-link active">
                  <strong class="bt-title">
                    DÍAS RESTANTES DEL CURSO: 30
                  </strong>
                </el-button>
              </el-tooltip>
            </li>
          </ul>

          <!-- Contenido de las pestañas -->
          <div
            id="pills-tabContent"
            class="tab-content"
          >
            <div
              id="pills-home"
              class="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="pills-home-tab"
            >
              <div class="content-box">
                <h4 class="content-title">
                  {{ nameCourse }}
                </h4>

                <div class="content-body" />
              </div>
            </div>

            <div
              id="pills-profile"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="pills-profile-tab"
            >
              <div class="content-box">
                Recursos del curso
              </div>
            </div>

            <div
              id="pills-contact"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="pills-contact-tab"
            >
              <div class="content-box">
                Examen del curso
              </div>
            </div>

            <div
              id="pills-dynamics"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="pills-dynamics-tab"
            >
              <div class="content-box">
                Dinámicas del curso
              </div>
            </div>
          </div>
        </div>

        <!-- Temario -->
        <div
          :class="
            urlVideo
              ? 'col-md-5 col-lg-4'
              : 'col-12'
          "
        >
          <div class="temary-container">
            <div class="card card-temary">
              <h2 class="title-temary">
                Temario
              </h2>

              <div class="modules-list">
                <div
                  v-for="(element, index) in items"
                  :key="`${element.type}-${element.id ?? index}`"
                  class="module-class"
                >
                  <!-- Módulo -->
                  <div
                    v-if="element.type === 'module'"
                    class="module-header"
                  >
                    <strong class="title-module">
                      {{ getModuleNumber(index) }}.
                      {{ element.name }}
                    </strong>
                  </div>

                  <!-- Clase -->
                  <div
                    v-else-if="element.type === 'class'"
                    class="class-item"
                  >
                    <input
                      type="checkbox"
                      :checked="Boolean(element.completed)"
                      disabled
                    />

                    <a
                      href="#"
                      class="class-link"
                      :class="{
                        active: selectedClassId === element.id,
                      }"
                      @click.prevent="previewVideo(element)"
                    >
                      {{ element.name }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin módulos -->
      <div
        v-else-if="!loading"
        class="empty-state"
      >
        <strong>No hay módulos disponibles</strong>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from "vue";

import axios from "axios";
import { ElMessage } from "element-plus";

import { VideoPlayer } from "@videojs-player/vue";
import "video.js/dist/video-js.css";

import { infoproductService } from '@/features/infoproducts/services/infoproductService';

const STORAGE_URL = import.meta.env.VITE_APP_STORAGE_URL;

const props = defineProps({
  courses: {
    type: Object,
    default: null,
  },

  outerVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "closeModalPreview",
  "update:outerVisible",
]);

const loading = ref(false);
const nameCourse = ref("");
const urlVideo = ref("");
const items = ref([]);
const selectedClassId = ref(null);

/*
 * Se utiliza shallowRef porque la instancia del reproductor
 * pertenece a una librería externa y no necesita convertirse
 * en un objeto reactivo profundo.
 */
const playerInstance = shallowRef(null);

let playerContainer = null;
let playerClickHandler = null;

const playerOptions = {
  responsive: true,
  fluid: true,
  aspectRatio: "16:9",
  preload: "auto",
  autoplay: false,
  muted: false,
  controls: true,
  language: "es",
  playbackRates: [0.7, 1, 1.5, 2],

  controlBar: {
    children: [
      "playToggle",
      "volumePanel",
      "currentTimeDisplay",
      "timeDivider",
      "durationDisplay",
      "progressControl",
      "playbackRateMenuButton",
      "fullscreenToggle",
    ],
  },
};

/**
 * Recibe la instancia del reproductor cuando VideoPlayer
 * termina de montarse.
 */
function handlePlayerMounted({ player }) {
  cleanupPlayerListener();

  playerInstance.value = player;
  playerContainer = player.el();

  if (!playerContainer) {
    return;
  }

  playerContainer.style.cursor = "pointer";

  playerClickHandler = (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    /*
     * Solo alterna reproducción cuando se hace clic
     * directamente sobre el video, no sobre los controles.
     */
    const clickedVideo =
      target.classList.contains("vjs-tech") ||
      target.classList.contains("video-js");

    if (!clickedVideo) {
      return;
    }

    if (player.paused()) {
      const playPromise = player.play();

      if (playPromise instanceof Promise) {
        playPromise.catch((error) => {
          console.error("No se pudo reproducir el video:", error);
        });
      }
    } else {
      player.pause();
    }
  };

  playerContainer.addEventListener(
    "click",
    playerClickHandler,
  );
}

/**
 * Elimina el listener manual agregado al reproductor.
 */
function cleanupPlayerListener() {
  if (playerContainer && playerClickHandler) {
    playerContainer.removeEventListener(
      "click",
      playerClickHandler,
    );
  }

  playerContainer = null;
  playerClickHandler = null;
}

function cleanupPlayer() {
  cleanupPlayerListener();
  playerInstance.value = null;
}

/**
 * Cuenta cuántos módulos existen hasta la posición actual.
 */
function getModuleNumber(index) {
  return items.value
    .slice(0, index + 1)
    .filter((item) => item.type === "module")
    .length;
}

/**
 * Controla el cierre de Element Plus y actualiza
 * el estado del componente padre.
 */
function handleDialogVisibility(visible) {
  emit("update:outerVisible", visible);

  if (!visible) {
    close();
  }
}

function close() {
  playerInstance.value?.pause();

  emit("update:outerVisible", false);
  emit("closeModalPreview");
}

/**
 * Obtiene módulos y clases del curso.
 */
async function getModulesData() {
  if (!props.courses?.id) {
    items.value = [];
    return;
  }

  loading.value = true;
  items.value = [];
  urlVideo.value = "";
  nameCourse.value = "";
  selectedClassId.value = null;

  try {
    const response = await infoproductService.getModuleAndClassesData(props.courses.id);

    items.value = Array.isArray(response.data)
      ? response.data
      : [];

    const firstClassWithVideo = items.value.find(
      (item) =>
        item.type === "class" &&
        item.videos?.[0]?.path,
    );

    const firstClass = firstClassWithVideo ??
      items.value.find(
        (item) => item.type === "class",
      );

    if (firstClass) {
      previewVideo(firstClass);
    }
  } catch (error) {
    console.error("Error al cargar los módulos:", error);

    ElMessage.error(
      error.response?.data?.message ??
        "No se pudo cargar el contenido del curso.",
    );
  } finally {
    loading.value = false;
  }
}

/**
 * Selecciona el video de una clase.
 */
function previewVideo(courseClass) {
  if (
    !courseClass ||
    courseClass.type !== "class"
  ) {
    return;
  }

  playerInstance.value?.pause();

  selectedClassId.value = courseClass.id;
  nameCourse.value = courseClass.name ?? "";

  const videoPath =
    courseClass.videos?.[0]?.path;

  if (!videoPath) {
    urlVideo.value = "";

    ElMessage.warning(
      "La clase seleccionada no tiene un video disponible.",
    );

    return;
  }

  urlVideo.value = videoPath.startsWith("http")
    ? videoPath
    : `${STORAGE_URL}/${videoPath}`;
}

/*
 * Se carga el temario al abrir el modal. Esto permite
 * reutilizar el componente con diferentes cursos.
 */
watch(
  [
    () => props.outerVisible,
    () => props.courses?.id,
  ],
  async ([visible, courseId]) => {
    if (visible && courseId) {
      await getModulesData();
    }

    if (!visible) {
      playerInstance.value?.pause();
    }
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  cleanupPlayerListener();
});
</script>