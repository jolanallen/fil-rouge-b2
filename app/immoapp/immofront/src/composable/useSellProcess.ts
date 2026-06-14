import { ref } from 'vue'
import type { Property } from '@/types/presenters/property.presenter'
import type { CreateSellPropertyDTO } from '@/types/dtos/sell.dto'
import * as sellAPI from '@/lib/sellAPI.lib'
import { useToast } from '@/composable/useToast'

export function useSellProcess() {
  const processes = ref<Property[]>([])
  const currentProcess = ref<Property | null>(null)
  const allProcesses = ref<Property[]>([])
  const messages = ref<Array<{ id: string; propertyId: string; senderId: string; senderName: string; senderRole: string; content: string; createdAt: string; isRead: boolean }>>([])
  const history = ref<Array<{ id: string; propertyId: string; type: string; description: string; createdAt: string }>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  async function fetchUserProcesses(userId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await sellAPI.getSellProcessesForUser(userId)
      processes.value = response.data
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllProcesses() {
    loading.value = true
    error.value = null
    try {
      const response = await sellAPI.getAllSellProcesses()
      allProcesses.value = response.data
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function fetchProcessById(id: string) {
    loading.value = true
    error.value = null
    try {
      currentProcess.value = await sellAPI.getSellProcessById(id)
      messages.value = await sellAPI.getMessages(id)
      history.value = await sellAPI.getHistory(id)
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function createSellProcess(data: CreateSellPropertyDTO) {
    loading.value = true
    error.value = null
    try {
      const prop = await sellAPI.createSellProperty(data)
      processes.value.unshift(prop)
      return prop
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function assignStaff(processId: string, staffId: string) {
    loading.value = true
    error.value = null
    try {
      const updated = await sellAPI.assignStaffToProcess(processId, staffId)
      const idx = allProcesses.value.findIndex(p => p.id === processId)
      if (idx >= 0) allProcesses.value[idx] = updated
      if (currentProcess.value?.id === processId) currentProcess.value = updated
      return updated
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
      return null
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(processId: string, content: string) {
    error.value = null
    try {
      const msg = await sellAPI.sendMessage(processId, content)
      messages.value.push(msg)
      if (currentProcess.value?.messages) currentProcess.value.messages.push(msg)
      return msg
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
      return null
    }
  }

  async function updateProcessTags(processId: string, tags: string[]) {
    error.value = null
    try {
      const updated = await sellAPI.updateProcessTags(processId, tags)
      const idx = allProcesses.value.findIndex(p => p.id === processId)
      if (idx >= 0) allProcesses.value[idx] = updated
      const pIdx = processes.value.findIndex(p => p.id === processId)
      if (pIdx >= 0) processes.value[pIdx] = updated
      if (currentProcess.value?.id === processId) currentProcess.value = updated
      return updated
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
      return null
    }
  }

  async function staffSendMessage(processId: string, content: string, staffName: string) {
    error.value = null
    try {
      const msg = await sellAPI.staffSendMessage(processId, content, staffName)
      messages.value.push(msg)
      if (currentProcess.value?.messages) currentProcess.value.messages.push(msg)
      return msg
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
      return null
    }
  }

  async function updateProcessStatus(processId: string, status: string) {
    error.value = null
    try {
      const updated = await sellAPI.updateSellPropertyStatus(processId, status)
      const idx = allProcesses.value.findIndex(p => p.id === processId)
      if (idx >= 0) allProcesses.value[idx] = updated
      const pIdx = processes.value.findIndex(p => p.id === processId)
      if (pIdx >= 0) processes.value[pIdx] = updated
      if (currentProcess.value?.id === processId) currentProcess.value = updated
      return updated
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
      return null
    }
  }

  async function updateProperty(processId: string, data: Record<string, any>) {
    error.value = null
    try {
      const updated = await sellAPI.updateSellProperty(processId, data)
      const idx = allProcesses.value.findIndex(p => p.id === processId)
      if (idx >= 0) allProcesses.value[idx] = updated
      const pIdx = processes.value.findIndex(p => p.id === processId)
      if (pIdx >= 0) processes.value[pIdx] = updated
      if (currentProcess.value?.id === processId) currentProcess.value = updated
      return updated
    } catch (e: any) {
      const msg = e.message
      error.value = msg
      toast.error(msg)
      return null
    }
  }

  return {
    processes, currentProcess, allProcesses, messages, history, loading, error,
    fetchUserProcesses, fetchAllProcesses, fetchProcessById,
    createSellProcess, assignStaff, sendMessage, staffSendMessage,
    updateProcessTags, updateProcessStatus, updateProperty
  }
}
