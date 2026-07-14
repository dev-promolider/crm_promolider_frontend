import { ref } from 'vue'

/**
 * Composable reutilizable para manejar modales de confirmación.
 *
 * Uso:
 *   const confirm = useConfirm()
 *   // Mostrar confirmación:
 *   const confirmed = await confirm.show({
 *     title: 'Eliminar elemento',
 *     message: '¿Estás seguro?',
 *     confirmText: 'Eliminar',
 *     type: 'danger',
 *   })
 *   if (confirmed) { ... }
 */
export function useConfirm() {
  const showConfirm = ref(false)
  const confirmLoading = ref(false)
  const confirmData = ref({
    title: '¿Estás seguro?',
    message: '',
    confirmText: 'Confirmar',
    type: 'danger',
  })

  let resolvePromise = null

  function show(opts = {}) {
    confirmData.value = {
      title: opts.title || '¿Estás seguro?',
      message: opts.message || '',
      confirmText: opts.confirmText || 'Confirmar',
      type: opts.type || 'danger',
    }
    confirmLoading.value = false
    showConfirm.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function onConfirm() {
    if (resolvePromise) resolvePromise(true)
    showConfirm.value = false
    resolvePromise = null
  }

  function onCancel() {
    if (resolvePromise) resolvePromise(false)
    showConfirm.value = false
    resolvePromise = null
  }

  return {
    showConfirm,
    confirmLoading,
    confirmData,
    show,
    onConfirm,
    onCancel,
  }
}
