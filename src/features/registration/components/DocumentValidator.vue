<template>
  <div class="document-validator">
    <div class="form-group">
      <label for="tipo_documento">Tipo de Documento</label>
      <select id="tipo_documento" v-model="localType" @change="emitUpdate">
        <option value="">Selecciona un tipo</option>
        <option value="dni">DNI</option>
        <option value="carnet_extranjeria">Carnet de Extranjería</option>
        <option value="pasaporte">Pasaporte</option>
      </select>
    </div>
    <div class="form-group">
      <label for="numero_documento">Número de Documento</label>
      <div class="input-wrapper">
        <input 
          type="text" 
          id="numero_documento" 
          v-model="localNumber" 
          @input="validateDocument"
          placeholder="Ingresa tu número de documento"
        />
      </div>
      <span v-if="error" class="error-text">{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  documentType: String,
  documentNumber: String,
  serverError: String
});

const emit = defineEmits(['update:documentType', 'update:documentNumber', 'valid']);

const localType = ref(props.documentType || '');
const localNumber = ref(props.documentNumber || '');
const error = ref('');

watch(() => props.serverError, (newVal) => {
  if (newVal) {
    error.value = newVal;
  }
});

const validateDocument = () => {
  error.value = '';
  let isValid = true;
  const num = localNumber.value;
  const type = localType.value;

  if (!type) {
    error.value = 'Selecciona un tipo de documento primero.';
    isValid = false;
  } else if (type === 'dni' && !/^[0-9]{8}$/.test(num)) {
    error.value = 'El DNI debe tener exactamente 8 dígitos numéricos.';
    isValid = false;
  } else if (type === 'carnet_extranjeria' && !/^[A-Za-z0-9]{6,12}$/.test(num)) {
    error.value = 'El Carnet de Extranjería debe tener entre 6 y 12 caracteres alfanuméricos.';
    isValid = false;
  } else if (type === 'pasaporte' && !/^[A-Za-z0-9]{6,20}$/.test(num)) {
    error.value = 'El pasaporte debe tener entre 6 y 20 caracteres alfanuméricos.';
    isValid = false;
  }

  emit('update:documentNumber', num);
  emit('valid', isValid && num.length > 0);
};

const emitUpdate = () => {
  emit('update:documentType', localType.value);
  validateDocument();
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--sidebar-hover-bg);
  border-radius: 10px;
  background-color: var(--sidebar-bg);
  color: var(--white);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  appearance: none;
}

select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(24, 214, 0, 0.1);
}

.error-text {
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}
</style>
