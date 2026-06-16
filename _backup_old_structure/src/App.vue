<script setup>
// App.vue sirve como contenedor principal
</script>

<template>
  <router-view />
</template>

<style>
/* Estilos globales rápidos para el reseteo */
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

*, *::before, *::after {
  box-sizing: inherit;
}
</style>
