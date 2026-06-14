import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, apiDelete, apiGet } from '@/lib/api.lib'
import type { Property } from '@/types/presenters/property.presenter'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<string[]>([])
  const favoriteProperties = ref<Property[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const favs = await apiGet<Property[]>('/properties/my-favorites')
      ids.value = favs.map(f => f.id)
      favoriteProperties.value = favs
    } catch {
      try {
        const stored = localStorage.getItem('favorites')
        if (stored) ids.value = JSON.parse(stored)
      } catch {
        ids.value = []
      }
      favoriteProperties.value = []
    } finally {
      loading.value = false
    }
  }

  async function toggle(id: string) {
    const idx = ids.value.indexOf(id)
    if (idx >= 0) {
      ids.value.splice(idx, 1)
      favoriteProperties.value = favoriteProperties.value.filter(p => p.id !== id)
      try { await apiDelete(`/properties/${id}/favorites`) } catch { /* ignore */ }
    } else {
      ids.value.push(id)
      try {
        const prop = await apiGet<Property>(`/properties/${id}`)
        favoriteProperties.value.unshift(prop)
        await apiPost(`/properties/${id}/favorites`, {})
      } catch { /* ignore */ }
    }
  }

  function isFavorite(id: string): boolean {
    return ids.value.includes(id)
  }

  const count = computed(() => ids.value.length)

  load()

  return { ids, favoriteProperties, count, loading, load, toggle, isFavorite }
})
