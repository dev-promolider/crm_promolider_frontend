import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    loadingRequests: 0,
  }),
  getters: {
    isLoading: (state) => state.loadingRequests > 0,
  },
  actions: {
    startLoading() {
      this.loadingRequests++;
    },
    stopLoading() {
      if (this.loadingRequests > 0) {
        this.loadingRequests--;
      }
    }
  }
});
