import { defineStore } from 'pinia';
import * as registrationService from '../services/registrationService';

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    step: 1,
    preregistroData: null,
    formData: {
      usuario: '',
      correo: '',
      password: '',
      password_confirm: '',
      tipo_usuario: '',
      nombre: '',
      apellido: '',
      telefono: '',
      fecha_nacimiento: '',
      tipo_documento: '',
      numero_documento: '',
      pais: 'Perú',
      tipo_cuenta: '',
      metodo_pago: 'tarjeta',
      referidor: '',
      lado: '',
      preregistro_id: null,
    },
    paymentUrl: null,
    loading: false,
    errors: {},
    config: null,
  }),
  getters: {
    currentStep: (state) => state.step,
    isFormValid: (state) => Object.keys(state.errors).length === 0,
    isPaymentPending: (state) => !!state.paymentUrl,
  },
  actions: {
    async fetchConfig(username) {
      this.loading = true;
      try {
        const response = await registrationService.getPreregistroConfig(username);
        this.config = response.data;
      } catch (error) {
        console.error('Error fetching config:', error);
        this.errors = { config: 'Configuración no encontrada' };
      } finally {
        this.loading = false;
      }
    },
    async submitPreregistro(username, data) {
      this.loading = true;
      try {
        const response = await registrationService.submitPreregistro(username, data);
        return response;
      } catch (error) {
        console.error('Error in submitPreregistro:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async validateToken(token) {
      this.loading = true;
      try {
        const response = await registrationService.validateToken(token);
        this.preregistroData = response.data;
        // Pre-fill form
        this.formData = {
          ...this.formData,
          nombre: response.data.nombres,
          correo: response.data.correo,
          telefono: response.data.whatsapp,
          referidor: response.data.referrer_username,
          lado: response.data.side,
          preregistro_id: response.data.preregistro_id,
        };
        return response;
      } catch (error) {
        console.error('Error in validateToken:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async checkDuplicateField(field, value) {
      try {
        const response = await registrationService.checkDuplicate({ field, value });
        if (response.exists) {
          this.errors[field] = response.message;
        } else {
          delete this.errors[field];
        }
        return response;
      } catch (error) {
        console.error('Error in checkDuplicate:', error);
      }
    },
    async processPayment() {
      this.loading = true;
      try {
        const response = await registrationService.submitOpenpayPayment(this.formData);
        this.paymentUrl = response.payment_url;
        return response;
      } catch (error) {
        console.error('Error processing payment:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errors.payment = error.response.data.message;
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async registerFree() {
      this.loading = true;
      try {
        // Map formData to what the create endpoint expects
        const payload = {
          username: this.formData.usuario,
          password: this.formData.password,
          name: this.formData.nombre,
          last_name: this.formData.apellido,
          phone: this.formData.telefono,
          date_birth: this.formData.fecha_nacimiento,
          email: this.formData.correo,
          // These would normally be resolved by IDs in the component or a helper
          id_referrer_sponsor: this.formData.referidor_id, // Need to make sure this is set
          id_country: this.formData.id_country || 1, // Default to Peru
          id_document_type: this.formData.id_document_type || 1,
          id_account_type: this.formData.id_account_type || 5, // Free tier
          nro_document: this.formData.numero_documento,
          user_type: this.formData.tipo_usuario
        };
        const response = await registrationService.submitRegistration(payload);
        return response;
      } catch (error) {
        console.error('Error registering:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    setStep(step) {
      this.step = step;
    },
    updateFormData(data) {
      this.formData = { ...this.formData, ...data };
    },
    clearErrors() {
      this.errors = {};
    }
  },
});
