<template>
  <div class="void-wrapper">
    <div class="glow-ring"></div>
    <button class="event-horizon">
      <span class="btn-text">ADMINISTRADOR</span>
      <div class="particles"></div>
    </button>
  </div>
</template>

<style scoped>
  .void-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px 0;
  }

  .glow-ring {
    position: absolute;
    width: calc(100% - 20px);
    height: 100%;
    border-radius: 12px;
    background: linear-gradient(45deg, var(--primary-color, #10b981), #22d3ee, var(--primary-color, #10b981));
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite, pulseGlow 2s infinite alternate;
    opacity: 0.15;
    z-index: 1;
    filter: blur(8px);
    transition: opacity 0.3s ease;
  }

  .void-wrapper:hover .glow-ring {
    opacity: 0.6;
    animation: gradientShift 1.5s ease infinite;
  }

  .event-horizon {
    position: relative;
    z-index: 2;
    padding: 12px 20px;
    background: var(--text-bold, #0f172a);
    color: var(--bg-main, #ffffff);
    border: 1px solid var(--border-color, transparent);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 800;
    letter-spacing: 2px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    width: 100%;
    text-align: center;
    overflow: hidden;
  }

  .btn-text {
    position: relative;
    z-index: 3;
    transition: 0.3s;
  }

  .void-wrapper:hover .event-horizon {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(24, 214, 0, 0.25);
    border-color: var(--primary-color, #10b981);
  }

  .void-wrapper:hover .btn-text {
    color: var(--primary-color, #10b981);
    letter-spacing: 3px;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes pulseGlow {
    0% { transform: scale(0.98); }
    100% { transform: scale(1.02); }
  }
</style>
