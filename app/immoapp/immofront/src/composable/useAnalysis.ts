import { ref, onUnmounted } from 'vue'
import type { AnalysisResult, AnalysisTask } from '@/types/presenters/analysis.presenter'
import type { StartAnalysisDTO } from '@/types/dtos/analysis.dto'
import * as analysisAPI from '@/lib/analysisAPI.lib'
import { useToast } from '@/composable/useToast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

export function useAnalysis() {
  const result = ref<AnalysisResult | null>(null)
  const task = ref<AnalysisTask | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)
  const progressMessage = ref('')
  const currentCity = ref('')
  const toast = useToast()
  let eventSource: EventSource | null = null

  onUnmounted(() => {
    eventSource?.close()
  })

  async function runAnalysis(data: StartAnalysisDTO) {
    loading.value = true
    error.value = null
    result.value = null
    progress.value = 0
    progressMessage.value = 'Lancement de l\'analyse...'
    try {
      const createdTask = await analysisAPI.startAnalysis(data)
      task.value = createdTask
      if (!createdTask?.id) return

      await new Promise<void>((resolve, reject) => {
        eventSource = new EventSource(`${API_BASE}/analysis/task/${createdTask.id}/events`)

        function handleProgress(msg: any) {
          const payload = msg.data
          if (payload.progress !== undefined) progress.value = payload.progress
          if (payload.message) progressMessage.value = payload.message
          if (payload.current_city) {
            currentCity.value = payload.current_city
            progressMessage.value = `Analyse de ${payload.current_city}...`
          }
          task.value = { ...task.value!, status: payload.status ?? 'in_progress', progress: payload.progress ?? progress.value, message: payload.message ?? '' }
        }

        function parseData(raw: any): any {
          return typeof raw === 'string' ? JSON.parse(raw) : raw
        }

        eventSource.onmessage = (e) => {
          try { handleProgress(parseData(e.data)) } catch { /* ignore */ }
        }

        eventSource.addEventListener('complete', (e: any) => {
          try {
            const payload = parseData(e.data)
            progress.value = 100
            progressMessage.value = 'Analyse terminée'
            task.value = { ...task.value!, status: 'completed', progress: 100, message: payload.message ?? 'Analyse terminée' }
          } catch { /* ignore */ }
          eventSource?.close()
          resolve()
        })

        eventSource.addEventListener('error', (e: any) => {
          try {
            const payload = parseData(e.data)
            error.value = payload.message || "L'analyse a échoué"
            toast.error(error.value)
            task.value = { ...task.value!, status: 'error', message: error.value }
          } catch { /* ignore */ }
          eventSource?.close()
          resolve()
        })

        eventSource.onerror = () => {
          // Let EventSource auto-reconnect on transient errors
        }

        setTimeout(() => {
          eventSource?.close()
          resolve()
        }, 300_000)
      })

      if (task.value?.status === 'error') return

      result.value = await analysisAPI.getAnalysisResults(data.departmentCode)
    } catch (e: any) {
      error.value = e.message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  async function fetchResults(department: string) {
    loading.value = true
    error.value = null
    try {
      result.value = await analysisAPI.getAnalysisResults(department)
    } catch (e: any) {
      error.value = e.message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  return { result, task, loading, error, progress, progressMessage, currentCity, runAnalysis, fetchResults }
}
