<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSellProcess } from '@/composable/useSellProcess'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import Button from '@/components/global/Button.vue'
import InputText from '@/components/global/InputText.vue'
import Card from '@/components/global/Card.vue'
import Spinner from '@/components/global/Spinner.vue'
import { estimatePrice } from '@/lib/sellAPI.lib'
import type { Property } from '@/types/presenters/property.presenter'

const router = useRouter()
const auth = useAuthStore()
const { createSellProcess } = useSellProcess()
useScrollAnimation()

const title = ref('')
const description = ref('')
const propertyType = ref<'appartement' | 'maison' | 'local-commercial' | 'terrain'>('appartement')
const surface = ref<number | null>(null)
const rooms = ref<number | null>(null)
const address = ref('')
const city = ref('')
const postalCode = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const images = ref<string[]>([])
const submitting = ref(false)
const estimationLoading = ref(false)
const estimation = ref<{ pricePerM2: number; estimatedPrice: number } | null>(null)
const formError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const departmentCode = computed(() => postalCode.value.slice(0, 2))

const canAutoEstimate = computed(() =>
  !!surface.value && surface.value > 0 && postalCode.value.length >= 2
)

restoreFormData()

function restoreFormData() {
  const saved = localStorage.getItem('sell_form_data')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      title.value = data.title || ''
      description.value = data.description || ''
      propertyType.value = data.propertyType || 'appartement'
      surface.value = data.surface || null
      rooms.value = data.rooms || null
      address.value = data.address || ''
      city.value = data.city || ''
      postalCode.value = data.postalCode || ''
      images.value = data.images || []
    } catch {}
    localStorage.removeItem('sell_form_data')
  }
}

const typeLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  'local-commercial': 'Local Commercial',
  terrain: 'Terrain'
}

let estimateTimer: ReturnType<typeof setTimeout> | null = null

async function runEstimate() {
  if (!canAutoEstimate.value) {
    estimation.value = null
    return
  }
  estimationLoading.value = true
  formError.value = null
  try {
    estimation.value = await estimatePrice(departmentCode.value, surface.value!, propertyType.value)
  } catch {
    estimation.value = null
  } finally {
    estimationLoading.value = false
  }
}

watch([surface, postalCode, propertyType], () => {
  if (estimateTimer) clearTimeout(estimateTimer)
  estimateTimer = setTimeout(runEstimate, 500)
})

function onFilesSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  for (const file of Array.from(target.files)) {
    if (!file.type.startsWith('image/')) continue
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) images.value.push(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

function triggerFilePicker() {
  fileInput.value?.click()
}

async function onSubmit() {
  formError.value = null
  if (!title.value || !surface.value || !address.value || !city.value || !postalCode.value) {
    formError.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }

  if (!auth.isAuthenticated) {
    localStorage.setItem('sell_form_data', JSON.stringify({
      title: title.value,
      description: description.value,
      propertyType: propertyType.value,
      surface: surface.value,
      rooms: rooms.value,
      address: address.value,
      city: city.value,
      postalCode: postalCode.value,
      images: images.value
    }))
    router.push('/login?redirect=/vendre')
    return
  }

  submitting.value = true
  try {
    if (!estimation.value && canAutoEstimate.value) {
      await runEstimate()
    }
    const process = await createSellProcess({
      title: title.value,
      description: description.value,
      surface: surface.value,
      rooms: rooms.value || 0,
      type: propertyType.value,
      address: address.value,
      city: city.value,
      postalCode: postalCode.value,
      department: departmentCode.value,
      images: images.value,
      price: estimation.value?.estimatedPrice
    })
    if (process) {
      successMessage.value = 'Votre bien a été soumis avec succès ! Vous allez être redirigé vers votre tableau de bord.'
      setTimeout(() => router.push('/dashboard?tab=selling'), 1500)
    }
  } catch (e: any) {
    formError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <!-- Header -->
    <section class="relative pt-16 lg:pt-20 pb-16 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="relative z-10 max-w-4xl mx-auto px-4 pt-8 text-center">
        <div class="reveal">
          <span class="inline-block px-4 py-1.5 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-4 border border-white/10">
            Estimation & Mise en Vente
          </span>
        </div>
        <h1 class="reveal text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
          Vendez votre bien avec Y-Plaza
        </h1>
        <p class="reveal text-white/70 text-lg max-w-xl mx-auto">
          Remplissez les détails de votre bien pour obtenir une estimation instantanée basée sur nos données de marché.
        </p>
      </div>
    </section>

    <!-- Form -->
    <div class="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
      <Card padding="lg" class="!shadow-xl">
        <div class="space-y-6">
          <!-- Property Type -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Type de bien <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="(label, key) in typeLabels"
                :key="key"
                :class="[
                  'py-3 px-4 rounded-xl text-sm font-medium border transition-all cursor-pointer',
                  propertyType === key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary'
                ]"
                @click="propertyType = key as any"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText v-model="title" label="Titre de l'annonce" placeholder="Ex: Appartement 3 pièces centre ville" required />
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Surface (m²) <span class="text-red-500">*</span></label>
              <input
                v-model.number="surface"
                type="number"
                placeholder="Ex: 72"
                min="1"
                class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-300 focus:ring-primary-200 hover:border-slate-300"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nombre de pièces</label>
              <input
                v-model.number="rooms"
                type="number"
                placeholder="Ex: 3"
                min="0"
                class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-300 focus:ring-primary-200 hover:border-slate-300"
              />
            </div>
          </div>

          <InputText v-model="address" label="Adresse" placeholder="Ex: 12 Rue de la République" required />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText v-model="city" label="Ville" placeholder="Ex: Aix-en-Provence" required />
            <InputText v-model="postalCode" label="Code postal" placeholder="Ex: 13100" required />
          </div>

          <!-- Images -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Photos du bien</label>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onFilesSelected"
            />

            <div v-if="images.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              <div
                v-for="(dataUrl, i) in images"
                :key="i"
                class="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
              >
                <img :src="dataUrl" alt="Photo du bien" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                <button
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 cursor-pointer shadow-lg"
                  @click="removeImage(i)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <span class="text-xs text-white font-medium">Photo {{ i + 1 }}</span>
                </div>
              </div>

              <!-- Add more button -->
              <button
                class="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1.5 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer group"
                @click="triggerFilePicker"
              >
                <svg class="w-8 h-8 text-slate-300 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-xs text-slate-400 group-hover:text-primary-500 transition-colors">Ajouter</span>
              </button>
            </div>

            <div v-else class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer" @click="triggerFilePicker">
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-slate-600">Ajouter des photos</p>
                <p class="text-xs text-slate-400 mt-0.5">Cliquez pour sélectionner une ou plusieurs images</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="Décrivez votre bien en détail (prestations, état, environnement...)"
              class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-300 focus:ring-primary-200 hover:border-slate-300 resize-none"
            />
          </div>

          <!-- Live Estimation -->
          <div v-if="estimationLoading" class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Spinner size="sm" />
            <span class="text-sm text-slate-500">Calcul de l'estimation...</span>
          </div>

          <div v-else-if="estimation" class="p-6 bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3">Estimation Y-Plaza</p>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-slate-300">Prix estimé</p>
                <p class="text-2xl font-bold text-white">{{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(estimation.estimatedPrice) }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-300">Prix au m²</p>
                <p class="text-2xl font-bold text-gold-400">{{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(estimation.pricePerM2) }}</p>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-3">Estimation basée sur les données DVF et les tendances du marché local.</p>
          </div>

          <div v-else-if="canAutoEstimate" class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <p class="text-sm text-slate-400">Modifiez la surface ou le code postal pour voir l'estimation</p>
          </div>

          <!-- Error -->
          <div v-if="formError" class="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p class="text-xs text-red-600">{{ formError }}</p>
          </div>

          <!-- Success -->
          <div v-if="successMessage" class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p class="text-xs text-emerald-600">{{ successMessage }}</p>
          </div>

          <!-- Submit -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <p class="text-xs text-slate-400">En soumettant, vous acceptez nos conditions générales.</p>
            <Button variant="primary" size="lg" @click="onSubmit" :loading="submitting">
              {{ auth.isAuthenticated ? 'Soumettre mon bien' : 'Se connecter & soumettre' }}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
