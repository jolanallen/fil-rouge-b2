<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePropertyFilter } from '@/composable/usePropertyFilter'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import PropertyCard from '@/components/shared/PropertyCard.vue'
import InputText from '@/components/global/InputText.vue'
import Button from '@/components/global/Button.vue'
import type { PropertySearchDTO } from '@/types/dtos/property.dto'

const router = useRouter()
const route = useRoute()
const { filters, properties, totalPages, total, loading, error, search, setPage } = usePropertyFilter()
useScrollAnimation()

const typeOptions = [
  { value: '', label: 'Tous types' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'local-commercial', label: 'Local Commercial' },
  { value: 'terrain', label: 'Terrain' }
]

const localFilters = ref({
  query: '',
  type: '' as string,
  minPrice: '',
  maxPrice: '',
  minSurface: '',
  maxSurface: '',
  city: ''
})

function applyFilters() {
  const params: PropertySearchDTO = {}
  if (localFilters.value.query) params.query = localFilters.value.query
  if (localFilters.value.type) params.type = localFilters.value.type as any
  if (localFilters.value.minPrice) params.minPrice = Number(localFilters.value.minPrice)
  if (localFilters.value.maxPrice) params.maxPrice = Number(localFilters.value.maxPrice)
  if (localFilters.value.minSurface) params.minSurface = Number(localFilters.value.minSurface)
  if (localFilters.value.maxSurface) params.maxSurface = Number(localFilters.value.maxSurface)
  if (localFilters.value.city) params.city = localFilters.value.city
  search(params)
}

onMounted(() => {
  if (route.query.city) {
    localFilters.value.city = route.query.city as string
    const params: PropertySearchDTO = { city: route.query.city as string }
    search(params)
  } else {
    search()
  }
})
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <!-- Header -->
    <section class="relative pt-16 lg:pt-20 pb-12 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 text-center pt-6">
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal">Propriétés</span>
        <h1 class="text-3xl sm:text-4xl font-serif font-bold text-white reveal">Nos Propriétés</h1>
        <p class="text-slate-300 mt-2 max-w-xl mx-auto reveal">Découvrez notre sélection de biens d'exception à travers la France</p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
      <!-- Filters -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8 reveal">
        <form @submit.prevent="applyFilters">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <InputText v-model="localFilters.query" placeholder="Rechercher..." icon='<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>' />
            <div>
              <select
                v-model="localFilters.type"
                class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              >
                <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <InputText v-model="localFilters.city" placeholder="Ville" />
            <InputText v-model="localFilters.minPrice" placeholder="Prix min (€)" type="number" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <InputText v-model="localFilters.maxPrice" placeholder="Prix max (€)" type="number" />
            <InputText v-model="localFilters.minSurface" placeholder="Surface min (m²)" type="number" />
            <InputText v-model="localFilters.maxSurface" placeholder="Surface max (m²)" type="number" />
            <div />
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="primary" type="submit" :loading="loading">Appliquer les filtres</Button>
            <Button variant="ghost" @click="localFilters = { query: '', type: '', minPrice: '', maxPrice: '', minSurface: '', maxSurface: '', city: '' }; search()">Réinitialiser</Button>
            <span class="text-sm text-slate-400 sm:ml-auto">{{ total }} résultat(s)</span>
          </div>
        </form>
      </div>

      <!-- Results -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-primary-200 border-t-primary rounded-full animate-spin" />
      </div>

      <div v-else-if="error" class="text-center py-20 max-w-md mx-auto">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01" />
        </svg>
        <p class="text-slate-400 font-medium">Chargement impossible</p>
        <p class="text-sm text-slate-300 mt-1 mb-6">Les données n'ont pas pu être récupérées. Veuillez réessayer.</p>
        <button class="text-sm font-medium text-primary hover:text-primary-600 transition-colors cursor-pointer underline underline-offset-4" @click="search()">Réessayer</button>
      </div>

      <div v-else-if="properties.length === 0" class="text-center py-20">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-slate-400">Aucun bien ne correspond à vos critères</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="prop in properties" :key="prop.id" class="reveal">
          <PropertyCard :property="prop" />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10 reveal">
        <button
          v-for="p in (() => {
            const current = filters.page || 1
            const pages: (number | string)[] = []
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i)
            } else {
              pages.push(1)
              if (current > 3) pages.push('...')
              for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                pages.push(i)
              }
              if (current < totalPages - 2) pages.push('...')
              pages.push(totalPages)
            }
            return pages
          })()"
          :key="p"
          :class="['w-10 h-10 rounded-xl text-sm font-medium transition-all cursor-pointer', p === (filters.page || 1) ? 'bg-primary text-white' : p === '...' ? 'bg-transparent cursor-default border-0' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200']"
          @click="p !== '...' && setPage(p as number)"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>
