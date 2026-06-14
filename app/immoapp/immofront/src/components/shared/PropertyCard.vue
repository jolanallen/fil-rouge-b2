<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Property } from '@/types/presenters/property.presenter'
import { cdnUrl } from '@/lib/imageUrl.lib'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

const router = useRouter()
const auth = useAuthStore()

const props = defineProps<{
  property: Property
}>()

const favorites = useFavoritesStore()

function trackClick() {
  fetch(`${API_BASE}/properties/${props.property.id}/click`, { method: 'POST' }).catch(() => {})
}

function handleFavorite(e: MouseEvent) {
  e.preventDefault()
  if (!auth.isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.path))
    return
  }
  favorites.toggle(props.property.id)
}

const typeLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  'local-commercial': 'Local Commercial',
  terrain: 'Terrain'
}

const typeIcons: Record<string, string> = {
  appartement: 'building',
  maison: 'home',
  'local-commercial': 'building',
  terrain: 'map'
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
}

</script>

<template>
  <router-link
    :to="`/properties/${property.id}`"
    class="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    @click="trackClick"
  >
    <div class="relative h-52 overflow-hidden">
      <img
        :src="cdnUrl(property.images[0]?.url)"
        :alt="property.images[0]?.alt"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div class="absolute top-3 left-3">
        <span class="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-700">
          {{ typeLabels[property.type] }}
        </span>
      </div>
      <div class="absolute top-3 right-3 flex items-center gap-2">
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
          :class="favorites.isFavorite(property.id) ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white'"
          @click="handleFavorite"
        >
          <svg class="w-4 h-4" :class="favorites.isFavorite(property.id) ? 'fill-current' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <span
          class="px-2.5 py-1 rounded-lg text-xs font-medium"
          :class="property.status === 'available' ? 'bg-emerald-500 text-white' : property.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'"
        >
          {{ property.status === 'available' ? 'Disponible' : property.status === 'pending' ? 'En cours' : 'Vendu' }}
        </span>
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <h3 class="text-white font-semibold text-lg leading-tight drop-shadow-sm">{{ property.title }}</h3>
      </div>
    </div>
    <div class="p-4">
      <div class="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-sm">{{ property.city }} ({{ property.postalCode }})</span>
      </div>

      <div class="flex items-center gap-4 text-sm text-slate-600 mb-3">
        <div class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span>{{ property.surface }} m²</span>
        </div>
        <div v-if="property.rooms > 0" class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>{{ property.rooms }} pièces</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <span class="text-lg font-bold text-primary">{{ formatPrice(property.price) }}</span>
          <span class="text-xs text-slate-400 ml-1">({{ formatPrice(property.pricePerM2) }}/m²)</span>
        </div>
        <span class="text-xs font-medium px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">{{ property.staffName || property.agency }}</span>
      </div>
    </div>
  </router-link>
</template>
