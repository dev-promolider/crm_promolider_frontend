<template>
  <button class="btn-cool-animated" @click="$emit('click')">
    <span class="circle1"></span>
    <span class="circle2"></span>
    <span class="circle3"></span>
    <span class="circle4"></span>
    <span class="circle5"></span>
    <span class="text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineEmits(['click']);
</script>
