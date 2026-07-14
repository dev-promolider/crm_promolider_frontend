<template>
    <div class="course-request-card">
        <h2>Solicitud requerida</h2>
        <p>
            Actualmente no tienes permiso para gestionar infoproductos.
            Puedes solicitar acceso para crear cursos o libros.
        </p>

        <button class="btn-primary">
            Solicitar acceso
        </button>
    </div>
</template>

<script setup></script>

<style scoped>
.course-request-card {
  padding: 28px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.course-request-card h2 {
  margin: 0 0 10px;
  font-size: 22px;
}

.course-request-card p {
  margin-bottom: 20px;
  color: var(--text-muted);
}

.btn-primary {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
</style>