<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cdnUrl } from '@/lib/imageUrl.lib'
import { useAuthStore } from '@/stores/authStore'
import { useSellProcess } from '@/composable/useSellProcess'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import { getAgencies } from '@/lib/sellAPI.lib'
import Button from '@/components/global/Button.vue'
import Card from '@/components/global/Card.vue'
import Badge from '@/components/global/Badge.vue'
import Spinner from '@/components/global/Spinner.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { currentProcess, fetchProcessById, sendMessage, staffSendMessage, updateProperty, updateProcessStatus, updateProcessTags, loading } = useSellProcess()
useScrollAnimation()

const agencies = ref<{ id: string; name: string; city: string }[]>([])

const newMessage = ref('')
const activeSection = ref<'details' | 'conversation' | 'history' | 'edit'>('details')

const editForm = ref({ title: '', description: '', estimatedPrice: 0, agency: '', images: [] as string[], features: [] as string[], energyClass: '' })
const editSaving = ref(false)
const editSuccess = ref(false)
const newTag = ref('')
const newFeature = ref('')

const processId = route.params.id as string

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  agencies.value = await getAgencies()
  await fetchProcessById(processId)
})

const STATUS_ORDER: Record<string, number> = {
  draft: 0, pending: 1, estimation: 2, mandate: 3, available: 4, reserved: 5, under_offer: 6, sold: 7, cancelled: -1
}

const announcementSteps = computed(() => {
  const s = currentProcess.value?.status || 'draft'
  const idx = STATUS_ORDER[s] ?? 0
  const hasImages = (currentProcess.value?.images?.length ?? 0) > 0
  return [
    { label: 'Création', done: true },
    { label: 'Assignation agent', done: !!currentProcess.value?.staffId },
    { label: 'Estimation', done: idx >= 2 },
    { label: 'Photos & description', done: hasImages && idx >= 1 },
    { label: 'Mise en ligne', done: idx >= 4 },
    { label: 'Vente', done: idx >= 7 },
  ]
})

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  estimation: 'Estimation',
  mandate: 'Mandat',
  available: 'Disponible',
  reserved: 'Réservé',
  under_offer: 'Sous offre',
  sold: 'Vendu',
  cancelled: 'Annulé'
}

const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'default' | 'danger'> = {
  draft: 'default',
  pending: 'warning',
  estimation: 'info',
  mandate: 'info',
  available: 'success',
  reserved: 'warning',
  under_offer: 'warning',
  sold: 'success',
  cancelled: 'danger'
}

const AGENCY_OPTIONS = computed(() => agencies.value.map(a => a.name))

const typeLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  'local-commercial': 'Local Commercial',
  terrain: 'Terrain'
}

const allSections = [
  { id: 'details' as const, label: 'Détails' },
  { id: 'conversation' as const, label: 'Conversation' },
  { id: 'history' as const, label: 'Historique' },
  { id: 'edit' as const, label: 'Modifier' }
]

const visibleSections = computed(() =>
  auth.isStaff ? allSections : allSections.filter(s => s.id !== 'edit')
)

async function onSendMessage() {
  if (!newMessage.value.trim() || !currentProcess.value) return
  const content = newMessage.value.trim()
  newMessage.value = ''
  if (auth.isStaff) {
    await staffSendMessage(processId, content, auth.user?.firstName + ' ' + auth.user?.lastName)
  } else {
    await sendMessage(processId, content)
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function dpeColorClass(energyClass: string): string {
  const colors: Record<string, string> = {
    A: 'bg-emerald-500',
    B: 'bg-green-500',
    C: 'bg-yellow-400',
    D: 'bg-amber-500',
    E: 'bg-orange-500',
    F: 'bg-red-500',
    G: 'bg-red-700'
  }
  return colors[energyClass] || 'bg-slate-400'
}

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function openEdit() {
  if (!currentProcess.value) return
  editForm.value = {
    title: currentProcess.value.title,
    description: currentProcess.value.description,
    estimatedPrice: currentProcess.value.price,
    agency: currentProcess.value.agency,
    images: currentProcess.value.images.map(i => i.url),
    features: currentProcess.value.features.map(f => f.name),
    energyClass: currentProcess.value.energyClass || ''
  }
  editSuccess.value = false
  activeSection.value = 'edit'
}

async function saveEdit() {
  if (!currentProcess.value) return
  editSaving.value = true
  editSuccess.value = false
  const updated = await updateProperty(currentProcess.value.id, {
    title: editForm.value.title,
    description: editForm.value.description,
    price: editForm.value.estimatedPrice,
    agency: editForm.value.agency,
    images: editForm.value.images,
    features: editForm.value.features,
    energyClass: editForm.value.energyClass
  })
  editSaving.value = false
  if (updated) {
    editSuccess.value = true
    setTimeout(() => { editSuccess.value = false }, 3000)
  }
}

function handleImageUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      if (!editForm.value.images.includes(url)) {
        editForm.value.images.push(url)
      }
    }
    reader.readAsDataURL(file)
  })
  ;(e.target as HTMLInputElement).value = ''
}

function removeImage(index: number) {
  editForm.value.images.splice(index, 1)
}

function addFeature() {
  if (!newFeature.value.trim()) return
  editForm.value.features.push(newFeature.value.trim())
  newFeature.value = ''
}

function removeFeature(index: number) {
  editForm.value.features.splice(index, 1)
}

async function updatePropertyStatus(status: string) {
  if (!currentProcess.value) return
  await updateProcessStatus(currentProcess.value.id, status)
}

async function addTag() {
  if (!newTag.value.trim() || !currentProcess.value) return
  const tags = [...(currentProcess.value.tags || []), newTag.value.trim()]
  await updateProcessTags(currentProcess.value.id, tags)
  newTag.value = ''
}

async function removeEditTag(tag: string) {
  if (!currentProcess.value) return
  const tags = (currentProcess.value.tags || []).filter(t => t !== tag)
  await updateProcessTags(currentProcess.value.id, tags)
}
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <!-- Header -->
    <section class="relative pt-16 lg:pt-20 pb-12 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 pt-6">
        <div class="flex items-center gap-3 mb-4">
          <button class="text-white/60 hover:text-white transition-colors cursor-pointer" @click="router.push('/dashboard?tab=selling')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span class="text-white/40 text-sm">Tableau de bord</span>
          <span class="text-white/40 text-sm">/</span>
          <span class="text-white/70 text-sm" v-if="currentProcess">{{ currentProcess.title }}</span>
        </div>

        <div v-if="currentProcess" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white">{{ currentProcess.title }}</h1>
            <p class="text-slate-300 text-sm mt-1">{{ currentProcess.city }} ({{ currentProcess.postalCode }})</p>
          </div>
          <div class="flex items-center gap-3">
            <Badge :variant="statusVariants[currentProcess.status] || 'default'" size="md">
              {{ statusLabels[currentProcess.status] || currentProcess.status }}
            </Badge>
          </div>
        </div>
        <div v-else-if="loading" class="flex items-center gap-3">
          <Spinner color="text-white" />
          <span class="text-white/60 text-sm">Chargement...</span>
        </div>
      </div>
    </section>

    <div v-if="currentProcess" class="max-w-7xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
      <!-- Section Tabs -->
      <Card padding="sm" class="!sticky top-20 z-30">
        <div class="flex gap-1">
          <button
            v-for="section in visibleSections"
            :key="section.id"
            :class="['flex-1 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer', activeSection === section.id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            @click="section.id === 'edit' ? openEdit() : (activeSection = section.id)"
          >
            {{ section.label }}
          </button>
        </div>
      </Card>

      <!-- Details Section -->
      <div v-if="activeSection === 'details'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Property details -->
        <div class="lg:col-span-2 space-y-6">
          <Card>
            <div class="flex items-start gap-4 mb-6">
              <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                <img :src="cdnUrl(currentProcess.images[0]?.url)" :alt="currentProcess.title" class="w-full h-full object-cover" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-900">{{ currentProcess.title }}</h2>
                <p class="text-slate-500 text-sm mt-1">{{ currentProcess.address }}, {{ currentProcess.city }} ({{ currentProcess.postalCode }})</p>
                <div class="flex items-center gap-3 mt-2">
                  <Badge variant="info" size="sm">{{ typeLabels[currentProcess.type] }}</Badge>
                  <span class="text-sm text-slate-400">{{ currentProcess.surface }} m²</span>
                  <span v-if="currentProcess.rooms > 0" class="text-sm text-slate-400">{{ currentProcess.rooms }} pièces</span>
                </div>
              </div>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed">{{ currentProcess.description }}</p>

            <div v-if="currentProcess.features.length" class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
              <div
                v-for="f in currentProcess.features"
                :key="f.id"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs rounded-lg border border-slate-100"
              >
                <svg class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                {{ f.name }}
              </div>
            </div>
            <div v-if="currentProcess.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
              <span
                v-for="tag in currentProcess.tags || []"
                :key="tag"
                class="px-2.5 py-1 bg-primary-50 text-primary text-xs rounded-full border border-primary-100"
              >
                {{ tag }}
              </span>
            </div>
          </Card>

          <!-- Price Details -->
          <Card>
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Détails du prix</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 bg-primary-50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Prix estimé total</p>
                <p class="text-xl font-bold text-slate-900">{{ formatPrice(currentProcess.price) }}</p>
              </div>
              <div class="p-4 bg-emerald-50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Prix au m²</p>
                <p class="text-xl font-bold text-emerald-700">{{ formatPrice(currentProcess.pricePerM2) }}</p>
              </div>
              <div class="p-4 bg-amber-50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Surface</p>
                <p class="text-xl font-bold text-amber-700">{{ currentProcess.surface }} m²</p>
              </div>
            </div>
          </Card>

          <!-- Stats -->
          <Card>
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Statistiques de l'annonce</h3>
            <template v-if="currentProcess.stats">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div class="text-center p-3 border border-slate-100 rounded-xl">
                  <p class="text-2xl font-bold text-primary">{{ currentProcess.stats.totalViews }}</p>
                  <p class="text-xs text-slate-500">Consultations</p>
                </div>
                <div class="text-center p-3 border border-slate-100 rounded-xl">
                  <p class="text-2xl font-bold text-emerald-600">{{ currentProcess.stats.totalClicks }}</p>
                  <p class="text-xs text-slate-500">Clics</p>
                </div>
                <div class="text-center p-3 border border-slate-100 rounded-xl">
                  <p class="text-2xl font-bold text-amber-600">{{ currentProcess.stats.totalContacts }}</p>
                  <p class="text-xs text-slate-500">Contacts</p>
                </div>
                <div class="text-center p-3 border border-slate-100 rounded-xl">
                  <p class="text-2xl font-bold text-rose-600">{{ currentProcess.stats.totalFavorites }}</p>
                  <p class="text-xs text-slate-500">Favoris</p>
                </div>
              </div>

              <!-- Daily Stats Chart (simplified bar chart) -->
              <div v-if="currentProcess.stats.dailyViews.length" class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-slate-700 mb-2">Consultations par jour</p>
                  <div class="flex items-end gap-1.5 h-20">
                    <div
                      v-for="(day, i) in currentProcess.stats.dailyViews"
                      :key="i"
                      class="flex-1 bg-primary/20 rounded-t flex flex-col items-center justify-end transition-all"
                      :style="{ height: `${Math.max(8, (day.count / Math.max(...currentProcess.stats.dailyViews.map(d => d.count))) * 100)}%` }"
                    >
                      <span class="text-[10px] text-primary font-medium -mt-4">{{ day.count }}</span>
                    </div>
                  </div>
                  <div class="flex gap-1.5 mt-1">
                    <div
                      v-for="(day, i) in currentProcess.stats.dailyViews"
                      :key="i"
                      class="flex-1 text-center text-[10px] text-slate-400"
                    >
                      {{ formatShortDate(day.date) }}
                    </div>
                  </div>
                </div>
                <div v-if="currentProcess.stats.dailyClicks.length">
                  <p class="text-sm font-medium text-slate-700 mb-2">Clics par jour</p>
                  <div class="flex items-end gap-1.5 h-16">
                    <div
                      v-for="(day, i) in currentProcess.stats.dailyClicks"
                      :key="i"
                      class="flex-1 bg-emerald-500/20 rounded-t rounded-sm transition-all"
                      :style="{ height: `${Math.max(8, (day.count / Math.max(...currentProcess.stats.dailyClicks.map(d => d.count))) * 100)}%` }"
                    >
                      <span class="text-[10px] text-emerald-600 font-medium block text-center -mt-4">{{ day.count }}</span>
                    </div>
                  </div>
                  <div class="flex gap-1.5 mt-1">
                    <div
                      v-for="(day, i) in currentProcess.stats.dailyClicks"
                      :key="i"
                      class="flex-1 text-center text-[10px] text-slate-400"
                    >
                      {{ formatShortDate(day.date) }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <p v-if="!currentProcess.stats?.dailyViews?.length" class="text-sm text-slate-400 text-center py-4">Aucune statistique pour le moment</p>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <Card>
            <h3 class="font-semibold text-slate-900 mb-3">Informations</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-1.5 border-b border-slate-50">
                <span class="text-slate-500">Type</span>
                <span class="font-medium text-slate-900">{{ typeLabels[currentProcess.type] }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-50">
                <span class="text-slate-500">Surface</span>
                <span class="font-medium text-slate-900">{{ currentProcess.surface }} m²</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-50">
                <span class="text-slate-500">Pièces</span>
                <span class="font-medium text-slate-900">{{ currentProcess.rooms || 'N/A' }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-50">
                <span class="text-slate-500">Département</span>
                <span class="font-medium text-slate-900">{{ currentProcess.department }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-50">
                <span class="text-slate-500">DPE</span>
                <span v-if="currentProcess.energyClass" class="font-medium"><span :class="dpeColorClass(currentProcess.energyClass)" class="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white">{{ currentProcess.energyClass }}</span></span>
                <span v-else class="text-slate-400 text-sm">Non renseigné</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-50">
                <span class="text-slate-500">Agence</span>
                <span class="font-medium text-slate-900">{{ currentProcess.agency }}</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="text-slate-500">Agent assigné</span>
                <span class="font-medium" :class="currentProcess.staffId ? 'text-emerald-600' : 'text-amber-600'">
                  {{ currentProcess.staffId ? 'Oui' : 'En attente' }}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 class="font-semibold text-slate-900 mb-3">État de l'annonce</h3>
            <div class="space-y-2">
              <div v-for="step in announcementSteps" :key="step.label" class="flex items-center gap-3">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', step.done ? 'bg-emerald-500' : 'bg-slate-200']">
                  <svg v-if="step.done" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else class="w-2 h-2 rounded-full bg-slate-300" />
                </div>
                <span :class="['text-sm', step.done ? 'text-slate-900' : 'text-slate-400']">{{ step.label }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Conversation Section -->
      <div v-if="activeSection === 'conversation'">
        <Card>
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Conversation avec votre agent</h3>

          <div class="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            <div v-if="!currentProcess.messages?.length" class="text-center py-8">
              <p class="text-slate-400 text-sm">Aucun message pour le moment</p>
            </div>
            <div
              v-for="msg in currentProcess.messages || []"
              :key="msg.id"
              :class="['flex', msg.senderRole === 'staff' ? 'justify-start' : 'justify-end']"
            >
              <div
                :class="[
                  'max-w-[75%] rounded-2xl p-3',
                  msg.senderRole === 'staff' ? 'bg-slate-100 text-slate-900' : 'bg-primary text-white'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium" :class="msg.senderRole === 'staff' ? 'text-primary' : 'text-white/80'">{{ msg.senderName }}</span>
                  <span class="text-[10px]" :class="msg.senderRole === 'staff' ? 'text-slate-400' : 'text-white/50'">{{ formatDate(msg.createdAt) }}</span>
                </div>
                <p class="text-sm">{{ msg.content }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <input
              v-model="newMessage"
              placeholder="Écrivez votre message..."
              class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              @keydown.enter="onSendMessage"
            />
            <Button variant="primary" size="md" :disabled="!newMessage.trim()" @click="onSendMessage">
              Envoyer
            </Button>
          </div>
        </Card>
      </div>

      <!-- History Section -->
      <div v-if="activeSection === 'history'">
        <Card>
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Historique des actions</h3>
          <div class="relative">
            <div class="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />
            <div class="space-y-6">
              <div
                v-for="evt in [...(currentProcess.history ?? [])].reverse()"
                :key="evt.id"
                class="relative pl-10"
              >
                <div
                  :class="[
                    'absolute left-2.5 w-3.5 h-3.5 rounded-full border-2 bg-white -translate-x-1/2',
                    evt.type === 'created' ? 'border-primary' : '',
                    evt.type === 'staff_assigned' ? 'border-gold' : '',
                    evt.type === 'status_change' ? 'border-amber-500' : '',
                    evt.type === 'message' ? 'border-blue-500' : '',
                    evt.type === 'view' || evt.type === 'click' || evt.type === 'contact' || evt.type === 'favorite' ? 'border-emerald-500' : ''
                  ]"
                />
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ evt.description }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(evt.createdAt) }}</p>
                  </div>
                  <Badge
                    :variant="evt.type === 'created' || evt.type === 'staff_assigned' ? 'info' : evt.type === 'status_change' ? 'warning' : evt.type === 'message' ? 'default' : 'success'"
                    size="sm"
                  >
                    {{ evt.type === 'created' ? 'Création' : evt.type === 'staff_assigned' ? 'Assignation' : evt.type === 'status_change' ? 'Statut' : evt.type === 'message' ? 'Message' : 'Interaction' }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Edit Section (staff only) -->
      <div v-if="activeSection === 'edit'">
        <Card>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-900">Modifier la propriété</h3>
            <div class="flex items-center gap-2">
              <span v-if="editSuccess" class="text-xs text-emerald-600 font-medium">Modifications enregistrées</span>
              <Button variant="primary" size="sm" :loading="editSaving" @click="saveEdit">Enregistrer</Button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Titre</label>
                <input v-model="editForm.title" class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <textarea v-model="editForm.description" rows="4" class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">Prix estimé (€)</label>
                  <input v-model.number="editForm.estimatedPrice" type="number" class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">Agence</label>
                  <select
                    v-model="editForm.agency"
                    class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                  >
                    <option value="" disabled>Sélectionner une agence</option>
                    <option v-for="a in AGENCY_OPTIONS" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
              </div>

              <!-- Images -->
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-2">Images</label>
                <div class="flex flex-wrap gap-2 mb-3">
                  <div
                    v-for="(img, i) in editForm.images"
                    :key="i"
                    class="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group"
                  >
                    <img :src="cdnUrl(img)" alt="" class="w-full h-full object-cover" />
                    <button
                      class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="removeImage(i)"
                    >
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <label class="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-50/30 transition-all">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
                  </label>
                </div>
                <p class="text-xs text-slate-400">{{ editForm.images.length }} image(s)</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Statut du bien</label>
                <select
                  :value="currentProcess.status"
                  @change="updatePropertyStatus(($event.target as HTMLSelectElement).value)"
                  class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                >
                  <option value="available">Actif</option>
                  <option value="pending">En attente</option>
                  <option value="sold">Vendu</option>
                  <option value="cancelled">Annulé</option>
                </select>
                <p class="text-xs text-slate-400 mt-1">
                  <span class="inline-block w-2 h-2 rounded-full mr-1"
                    :class="currentProcess.status === 'available' ? 'bg-emerald-500' : currentProcess.status === 'pending' ? 'bg-amber-500' : currentProcess.status === 'sold' ? 'bg-red-500' : 'bg-slate-400'"
                  />
                  {{ currentProcess.status === 'available' ? 'Actif' : currentProcess.status === 'pending' ? 'En attente' : currentProcess.status === 'sold' ? 'Vendu' : 'Annulé' }}
                </p>
              </div>

              <!-- DPE -->
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">DPE (Diagnostic de Performance Énergétique)</label>
                <select
                  v-model="editForm.energyClass"
                  class="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                >
                  <option value="">Non renseigné</option>
                  <option v-for="c in ['A','B','C','D','E','F','G']" :key="c" :value="c">{{ c }}</option>
                </select>
                <p v-if="editForm.energyClass" class="text-xs text-slate-400 mt-1">
                  Classe <span :class="dpeColorClass(editForm.energyClass)" class="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white">{{ editForm.energyClass }}</span>
                </p>
              </div>

              <!-- Features -->
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-2">Caractéristiques</label>
                <div class="flex flex-wrap gap-1.5 mb-2">
                  <span
                    v-for="(f, i) in editForm.features"
                    :key="i"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-700 text-xs rounded-lg border border-slate-100"
                  >
                    <svg class="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                    {{ f }}
                    <button class="hover:text-red-500 transition-colors" @click="removeFeature(i)">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newFeature"
                    placeholder="Ajouter une caractéristique..."
                    class="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                    @keydown.enter.prevent="addFeature"
                  />
                  <Button variant="outline" size="sm" :disabled="!newFeature.trim()" @click="addFeature">Ajouter</Button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-500 mb-2">Tags</label>
                <div class="flex flex-wrap gap-1.5 mb-2">
                  <span
                    v-for="tag in currentProcess.tags || []"
                    :key="tag"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary text-xs rounded-full border border-primary-100"
                  >
                    {{ tag }}
                    <button class="hover:text-red-500 transition-colors" @click="removeEditTag(tag)">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newTag"
                    placeholder="Ajouter un tag..."
                    class="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                    @keydown.enter.prevent="addTag"
                  />
                  <Button variant="outline" size="sm" :disabled="!newTag.trim()" @click="addTag">Ajouter</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <p class="text-slate-400">Processus de vente introuvable</p>
      <Button variant="primary" size="sm" class="mt-4" @click="router.push('/dashboard')">Retour au tableau de bord</Button>
    </div>
  </div>
</template>
