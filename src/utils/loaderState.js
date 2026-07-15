import { ref } from 'vue';

export const globalLoading = ref(0);

export function startGlobalLoading() {
  globalLoading.value++;
}

export function stopGlobalLoading() {
  if (globalLoading.value > 0) {
    globalLoading.value--;
  }
}
