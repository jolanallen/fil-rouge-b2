import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
}

const toasts = ref<Toast[]>([])
let nextId = 0

const DURATION = 5000
const ANIMATION_MS = 300

function removeToast(id: number) {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) toast.visible = false
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, ANIMATION_MS)
}

export function useToast() {
  function addToast(message: string, type: Toast['type'] = 'info') {
    const id = nextId++
    toasts.value.push({ id, message, type, visible: true })
    setTimeout(() => removeToast(id), DURATION)
    return id
  }

  function success(message: string) { return addToast(message, 'success') }
  function error(message: string) { return addToast(message, 'error') }
  function info(message: string) { return addToast(message, 'info') }
  function warning(message: string) { return addToast(message, 'warning') }

  return { toasts, addToast, success, error, info, warning, removeToast }
}
