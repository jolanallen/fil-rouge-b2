import { ref, computed } from 'vue'
import type { Property, PropertyListResponse } from '@/types/presenters/property.presenter'
import type { PropertySearchDTO } from '@/types/dtos/property.dto'
import { getProperties } from '@/lib/propertyAPI.lib'
import { useToast } from '@/composable/useToast'

export function usePropertyFilter() {
  const filters = ref<PropertySearchDTO>({
    page: 1,
    limit: 6,
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const properties = ref<Property[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  async function search(initialFilters?: PropertySearchDTO) {
    if (initialFilters) {
      filters.value = { ...filters.value, ...initialFilters, page: 1 }
    }
    loading.value = true
    error.value = null
    try {
      const response: PropertyListResponse = await getProperties(filters.value)
      properties.value = response.data
      total.value = response.total
      totalPages.value = response.totalPages
    } catch (e: any) {
      error.value = e.message
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  function setPage(page: number) {
    filters.value.page = page
    search()
  }

  function setSort(sortBy: PropertySearchDTO['sortBy']) {
    filters.value.sortBy = sortBy
    filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
    search()
  }

  const filteredCount = computed(() => total.value)

  return { filters, properties, total, totalPages, loading, error, filteredCount, search, setPage, setSort }
}
