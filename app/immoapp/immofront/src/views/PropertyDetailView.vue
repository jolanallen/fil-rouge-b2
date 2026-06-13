<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import { cdnUrl } from '@/lib/imageUrl.lib'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { getPropertyById } from '@/lib/propertyAPI.lib'
import type { PropertyDetailResponse } from '@/types/presenters/property.presenter'
import PropertyCard from '@/components/shared/PropertyCard.vue'
import PriceChart from '@/components/shared/PriceChart.vue'
import Button from '@/components/global/Button.vue'
import InputText from '@/components/global/InputText.vue'
import Badge from '@/components/global/Badge.vue'
import Card from '@/components/global/Card.vue'
import Spinner from '@/components/global/Spinner.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const favorites = useFavoritesStore()
useScrollAnimation()

const data = ref<PropertyDetailResponse | null>(null)
const loading = ref(true)
const activeImage = ref(0)
const galleryOpen = ref(false)
const contactForm = ref({ name: '', email: '', phone: '', message: '' })
const sent = ref(false)

onMounted(async () => {
  try {
    data.value = await getPropertyById(route.params.id as string)
    // Record view
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'}/properties/${route.params.id}/view`, { method: 'POST' }).catch(() => {})
  } catch {
    router.push('/properties')
  } finally {
    loading.value = false
  }
})

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p)
}

const typeLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  'local-commercial': 'Local Commercial',
  terrain: 'Terrain'
}

function sendContact() {
  sent.value = true
}

function handleFavorite(id: string) {
  if (!auth.isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(route.path))
    return
  }
  favorites.toggle(id)
}

function openGallery(index: number) {
  activeImage.value = index
  galleryOpen.value = true
}

function prevImage() {
  if (!data.value) return
  activeImage.value = (activeImage.value - 1 + data.value.property.images.length) % data.value.property.images.length
}

function nextImage() {
  if (!data.value) return
  activeImage.value = (activeImage.value + 1) % data.value.property.images.length
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') galleryOpen.value = false
  else if (e.key === 'ArrowLeft') prevImage()
  else if (e.key === 'ArrowRight') nextImage()
}
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <Spinner v-if="loading" class="mx-auto mt-20" size="lg" />

    <template v-if="data">
      <!-- Hero Images -->
      <section class="relative pt-24 h-[50vh] lg:h-[60vh] overflow-hidden group">
        <img
          :src="cdnUrl(data.property.images[activeImage]?.url)"
          :alt="data.property.images[activeImage]?.alt"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
          @click="openGallery(activeImage)"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <button
          class="absolute top-6 left-6 z-50 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer border border-white/20"
          @click="router.back()"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <button
          class="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border"
          :class="favorites.isFavorite(data.property.id) ? 'bg-red-500 border-red-400 text-white' : 'bg-black/40 backdrop-blur-sm border-white/20 text-white hover:bg-black/60'"
          @click="handleFavorite(data.property.id)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <!-- Fullscreen hint overlay -->
        <div
          class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          @click="openGallery(activeImage)"
        >
          <div class="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </div>

        <!-- Thumbnail strip -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            v-for="(img, i) in data.property.images"
            :key="img.id"
            :class="['w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer', activeImage === i ? 'border-gold opacity-100 ring-2 ring-gold/50' : 'border-white/40 opacity-60 hover:opacity-100']"
            @click="activeImage = i"
          >
            <img :src="cdnUrl(img.url)" :alt="img.alt" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Gallery open button -->
        <div class="absolute bottom-6 right-6">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/70 transition-all cursor-pointer border border-white/20"
            @click="openGallery(activeImage)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {{ activeImage + 1 }} / {{ data.property.images.length }}
          </button>
        </div>
      </section>

      <!-- Gallery Modal -->
      <Teleport to="body">
        <div v-if="galleryOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90" @click.self="galleryOpen = false" @keydown="handleKeydown" tabindex="0">
          <button class="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer text-white z-10" @click="galleryOpen = false">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer text-white" @click="prevImage">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            :src="cdnUrl(data.property.images[activeImage]?.url)"
            :alt="data.property.images[activeImage]?.alt"
            class="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
          />

          <button class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer text-white" @click="nextImage">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              v-for="(img, i) in data.property.images"
              :key="img.id"
              :class="['w-12 h-8 rounded overflow-hidden border-2 transition-all cursor-pointer', activeImage === i ? 'border-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-80']"
              @click="activeImage = i"
            >
              <img :src="cdnUrl(img.url)" :alt="img.alt" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </Teleport>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Info Card -->
            <Card padding="lg">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <Badge>{{ typeLabels[data.property.type] }}</Badge>
                    <Badge :variant="data.property.status === 'available' ? 'success' : data.property.status === 'pending' ? 'warning' : 'danger'">
                      {{ data.property.status === 'available' ? 'Disponible' : data.property.status === 'pending' ? 'En cours' : 'Vendu' }}
                    </Badge>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{{ data.property.title }}</h1>
                  <p class="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ data.property.address }}, {{ data.property.city }} ({{ data.property.postalCode }})
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-primary">{{ formatPrice(data.property.price) }}</p>
                  <p class="text-sm text-slate-400">{{ formatPrice(data.property.pricePerM2) }}/m²</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-6 py-4 border-y border-slate-100 mb-4">
                <div>
                  <p class="text-xs text-slate-400">Surface</p>
                  <p class="text-sm font-semibold text-slate-900">{{ data.property.surface }} m²</p>
                </div>
                <div v-if="data.property.rooms > 0">
                  <p class="text-xs text-slate-400">Pièces</p>
                  <p class="text-sm font-semibold text-slate-900">{{ data.property.rooms }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400">DPE</p>
                  <p class="text-sm font-semibold text-slate-900">{{ data.property.energyClass || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400">Agence</p>
                <p class="text-sm font-semibold text-slate-900">{{ data.property.staffName || data.property.agency }}</p>
              </div>
            </div>

            <p class="text-slate-600 leading-relaxed">{{ data.property.description }}</p>
            </Card>

            <!-- Features -->
            <Card padding="lg">
              <h2 class="text-lg font-semibold text-slate-900 mb-4">Caractéristiques</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="f in data.property.features" :key="f.id" class="flex items-center gap-2 text-sm text-slate-600">
                  <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {{ f.name }}
                </div>
              </div>
            </Card>

            <!-- Price History -->
            <Card v-if="data.priceHistory" padding="lg">
              <h2 class="text-lg font-semibold text-slate-900 mb-4">Évolution du prix</h2>
              <PriceChart
                :price-points="data.priceHistory.pricePoints"
                :predicted-price="data.priceHistory.predictedPrice"
                :show-prediction="true"
              />
              <div v-if="data.priceHistory.growthRate" class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span class="text-sm text-slate-500">Croissance annualisée</span>
                <span class="text-sm font-semibold text-emerald-600">+{{ data.priceHistory.growthRate }}%</span>
              </div>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Call to action buttons -->
            <Card padding="md">
              <Button variant="primary" full-width size="md" @click="router.push(`/vendre?address=${encodeURIComponent(data.property.address)}&city=${encodeURIComponent(data.property.city)}`)">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Estimer mon bien
              </Button>
            </Card>

            <!-- Contact -->
            <Card padding="lg">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Contacter l'agent</h3>
              <form v-if="!sent" @submit.prevent="sendContact" class="space-y-3">
                <InputText v-model="contactForm.name" placeholder="Votre nom" required />
                <InputText v-model="contactForm.email" type="email" placeholder="Votre email" required />
                <InputText v-model="contactForm.phone" type="tel" placeholder="Votre téléphone" />
                <textarea v-model="contactForm.message" placeholder="Votre message..." rows="3" class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-none transition-all duration-200 hover:border-slate-300" required></textarea>
                <Button type="submit" variant="primary" full-width>Envoyer</Button>
              </form>
              <div v-else class="text-center py-4">
                <svg class="w-12 h-12 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-slate-600">Message envoyé !</p>
                <p class="text-xs text-slate-400 mt-1">Un agent vous répondra sous 24h</p>
              </div>
            </Card>

            <!-- Agency Info -->
            <Card padding="md">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">YP</div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ data.property.staffName || data.property.agency }}</p>
                  <p class="text-xs text-slate-500">{{ data.property.city }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +33 4 42 00 00 00
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@yplaza.fr
              </div>
            </Card>

            <!-- Similar -->
            <div v-if="data.similarProperties?.length">
              <h3 class="text-sm font-semibold text-slate-900 mb-3">Biens similaires</h3>
              <div class="space-y-3">
                <div v-for="prop in data.similarProperties" :key="prop.id" class="reveal">
                  <PropertyCard :property="prop" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
