module.exports = {
  content: [
    "../src/features/registration/views/PreregistroLandingView.vue",
    "../src/features/picklebot/views/PickleBotView.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfff3', 100: '#d5ffe2', 200: '#aeffc8', 300: '#70ff9e',
          400: '#2bfd68', 500: '#0BF50B', 600: '#09d609', 700: '#00a800',
          800: '#008400', 900: '#006b00',
        },
        dark: { 900: '#0a0a0a', 800: '#111827', 700: '#1f2937' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  corePlugins: {
    preflight: false,
  }
}
