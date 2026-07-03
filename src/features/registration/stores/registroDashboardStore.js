import { defineStore } from 'pinia';
import { ref } from 'vue';
import registroDashboardService from '../services/registroDashboardService';

export const useRegistroDashboardStore = defineStore('registroDashboard', () => {
  const activeLink = ref(null);
  const directs = ref([]);
  const isLoading = ref(false);
  const isGenerating = ref(false);

  const fetchActiveLink = async () => {
    try {
      const response = await registroDashboardService.getActiveLink();
      activeLink.value = response.data;
    } catch (error) {
      console.error('Error fetching active link:', error);
      throw error;
    }
  };

  const generateLink = async () => {
    isGenerating.value = true;
    try {
      const response = await registroDashboardService.generateLink();
      activeLink.value = {
        link: response.data.resource,
        tiempoRestanteEnSegundos: 5 * 3600, // 5 hours approx for immediate UI update
        fechaFin: response.data.resource.fecha_fin
      };
      return response.data;
    } catch (error) {
      console.error('Error generating link:', error);
      throw error;
    } finally {
      isGenerating.value = false;
    }
  };

  const suspendLink = async (id) => {
    try {
      await registroDashboardService.suspendLink(id);
      activeLink.value = null;
    } catch (error) {
      console.error('Error suspending link:', error);
      throw error;
    }
  };

  const fetchDirects = async () => {
    isLoading.value = true;
    try {
      const response = await registroDashboardService.getDirects();
      directs.value = response.data.rows || [];
    } catch (error) {
      console.error('Error fetching directs:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    activeLink,
    directs,
    isLoading,
    isGenerating,
    fetchActiveLink,
    generateLink,
    suspendLink,
    fetchDirects
  };
});
