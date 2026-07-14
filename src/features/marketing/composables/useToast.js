import { ref } from 'vue'

/**
 * Composable reutilizable para manejar notificaciones toast.
 *
 * Uso:
 *   const toast = useToast()
 *   toast.show('Título', 'Mensaje', 'success')
 *   toast.show('Error', 'Algo salió mal', 'error')
 *   toast.show('Aviso', 'Cuidado', 'warning')
 *   toast.dismiss()  // Cerrar manualmente
 */
export function useToast(duration = 3500) {
  const toast = ref(null)
  let timer = null

  function show(title, message, type = 'success') {
    if (timer) clearTimeout(timer)
    toast.value = { title, message, type }
    timer = setTimeout(() => {
      toast.value = null
    }, duration)
  }

  function dismiss() {
    if (timer) clearTimeout(timer)
    toast.value = null
  }

  return {
    toast,
    show,
    dismiss,
  }
}
