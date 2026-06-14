<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { cdnUrl } from '@/lib/imageUrl.lib'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useSellProcess } from '@/composable/useSellProcess'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import StatsCard from '@/components/shared/StatsCard.vue'
import PropertyCard from '@/components/shared/PropertyCard.vue'
import Button from '@/components/global/Button.vue'
import Card from '@/components/global/Card.vue'
import Badge from '@/components/global/Badge.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const favorites = useFavoritesStore()
const { processes, allProcesses, messages, history, fetchUserProcesses, fetchAllProcesses, assignStaff, loading: sellLoading } = useSellProcess()
useScrollAnimation()

type ClientTab = 'properties' | 'analysis' | 'selling' | 'profile'
type StaffTab = 'overview' | 'selling' | 'profile'

const clientTab = ref<ClientTab>('properties')
const staffTab = ref<StaffTab>('overview')

onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  if (route.query.tab === 'selling') {
    if (auth.isStaff) staffTab.value = 'selling'
    else clientTab.value = 'selling'
  }
  if (auth.user?.id) {
    fetchUserProcesses(auth.user.id)
    if (auth.isStaff) {
      fetchAllProcesses()
    }
  }
})

const clientTabs = [
  { id: 'properties' as const, label: 'Mes favoris' },
  { id: 'selling' as const, label: 'Mes ventes' },
  { id: 'profile' as const, label: 'Mon profil' }
]

const staffTabs = [
  { id: 'overview' as const, label: "Vue d'ensemble" },
  { id: 'selling' as const, label: 'Gestion des ventes' },
  { id: 'profile' as const, label: 'Mon profil' }
]

const savedSearches = [
  { name: 'Maison Aix-en-Provence', query: 'Maison à Aix', count: 12 },
  { name: 'Appartement Paris < 900k', query: 'Appartement Paris', count: 8 },
  { name: 'Local commercial Lyon', query: 'Local Lyon', count: 5 }
]

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  estimation: 'Estimation',
  mandate: 'Mandat',
  available: 'Disponible',
  reserved: 'Réservé',
  under_offer: 'Sous offre',
  sold: 'Vendu',
  cancelled: 'Annulé',
  draft: 'Brouillon',
}

const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  estimation: 'info',
  mandate: 'info',
  available: 'success',
  reserved: 'info',
  under_offer: 'warning',
  sold: 'success',
  cancelled: 'danger',
  draft: 'warning',
}

const typeLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  'local-commercial': 'Local Commercial',
  terrain: 'Terrain',
}

const safeProcesses = computed(() => processes.value || [])
const safeAllProcesses = computed(() => allProcesses.value || [])
const staffVisibleProcesses = computed(() => safeAllProcesses.value.filter(p => !p.staffId || p.staffId === auth.user?.id))
const unassignedProcesses = computed(() => staffVisibleProcesses.value.filter(p => !p.staffId))
const myAssignedProcesses = computed(() => staffVisibleProcesses.value.filter(p => p.staffId === auth.user?.id))
const staffAssignmentCount = computed(() => myAssignedProcesses.value.length)
const canAssign = computed(() => staffAssignmentCount.value < 7)

const totalUnreadMessages = computed(() => 0)

const recentActivity = computed(() => {
  const events = staffVisibleProcesses.value.flatMap(p =>
    (p.history || []).map(evt => ({ ...evt, processTitle: p.title }))
  )
  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)
})

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

async function handleAssign(processId: string) {
  if (!auth.user?.id) return
  await assignStaff(processId, auth.user.id)
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
}

function navigateToSellDetail(processId: string) {
  router.push(`/sell/${processId}`)
}
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">

    <!-- ===================== CLIENT HEADER ===================== -->
    <section v-if="!auth.isStaff" class="relative pt-16 lg:pt-20 pb-12 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white">Bonjour, {{ auth.user?.firstName }}</h1>
            <p class="text-slate-300 text-sm mt-1">Client • Tableau de bord</p>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="success">Client</Badge>
            <Button variant="outline" size="sm" class="!border-white/30 !text-white hover:!bg-white/10" @click="auth.logout(); router.push('/')">Déconnexion</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== STAFF HEADER ===================== -->
    <section v-if="auth.isStaff" class="relative pt-16 lg:pt-20 pb-12 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-gold-900" />
      <div class="absolute inset-0 opacity-[0.04]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" />
      <div class="relative z-10 max-w-7xl mx-auto px-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center">
              <svg class="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white">Bonjour, {{ auth.user?.firstName }}</h1>
              <p class="text-gold-300 text-sm mt-1">Agent Y-Plaza • Espace professionnel</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="success">Staff</Badge>
            <Button variant="outline" size="sm" class="!border-white/30 !text-white hover:!bg-white/10" @click="auth.logout(); router.push('/')">Déconnexion</Button>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 -mt-6 relative z-10">

      <!-- ===================== STAFF STATS ===================== -->
      <div v-if="auth.isStaff" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 reveal">
        <StatsCard label="Dossiers actifs" :value="String(staffAssignmentCount)" icon="building" :trend="staffAssignmentCount" />
        <StatsCard label="En attente" :value="String(unassignedProcesses.length)" icon="clock" />
        <StatsCard label="Vues totales" value="0" icon="chart" />
        <StatsCard label="Messages" :value="String(totalUnreadMessages)" icon="heart" />
      </div>

      <!-- ===================== CLIENT TABS ===================== -->
      <div v-if="!auth.isStaff" class="flex gap-1 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm mb-8 reveal overflow-x-auto">
        <button
          v-for="tab in clientTabs"
          :key="tab.id"
          :class="['flex-1 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap', clientTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700']"
          @click="clientTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ===================== STAFF TABS ===================== -->
      <div v-if="auth.isStaff" class="flex gap-1 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm mb-8 reveal overflow-x-auto">
        <button
          v-for="tab in staffTabs"
          :key="tab.id"
          :class="['flex-1 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap', staffTab === tab.id ? 'bg-gold text-white shadow-sm' : 'text-slate-500 hover:text-slate-700']"
          @click="staffTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ============================================================ -->
      <!-- CLIENT: Favorites Tab -->
      <!-- ============================================================ -->
      <div v-if="!auth.isStaff && clientTab === 'properties'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900">Mes favoris</h2>
          <Button variant="outline" size="sm" @click="router.push('/properties')">Parcourir le catalogue</Button>
        </div>
        <div v-if="favorites.favoriteProperties.length" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="prop in favorites.favoriteProperties" :key="prop.id" class="reveal">
            <PropertyCard :property="prop" />
          </div>
        </div>
        <div v-else-if="favorites.loading" class="text-center py-8">
          <p class="text-slate-400 text-sm">Chargement de vos favoris...</p>
        </div>
        <div v-else class="text-center py-12">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">Aucun favori pour le moment</p>
          <p class="text-slate-400 text-sm mt-1">Ajoutez des biens à vos favoris en naviguant dans le catalogue</p>
          <Button variant="primary" size="sm" class="mt-4" @click="router.push('/properties')">Découvrir des biens</Button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- STAFF: Overview Tab -->
      <!-- ============================================================ -->
      <div v-if="auth.isStaff && staffTab === 'overview'">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="lg:col-span-2 space-y-6">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm">
                <p class="text-xs text-slate-500">Dossiers total</p>
                <p class="text-xl font-bold text-slate-900">{{ safeAllProcesses.length }}</p>
              </Card>
              <Card padding="sm">
                <p class="text-xs text-slate-500">Assignés</p>
                <p class="text-xl font-bold text-slate-900">{{ staffAssignmentCount }}</p>
              </Card>
              <Card padding="sm">
                <p class="text-xs text-slate-500">En attente</p>
                <p class="text-xl font-bold text-amber-600">{{ unassignedProcesses.length }}</p>
              </Card>
              <Card padding="sm">
                <p class="text-xs text-slate-500">Terminés</p>
                <p class="text-xl font-bold text-emerald-600">{{ safeAllProcesses.filter(p => p.status === 'sold').length }}</p>
              </Card>
            </div>

            <Card>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-slate-900">Activité récente</h3>
                <Button variant="ghost" size="sm" @click="staffTab = 'selling'">Gérer les ventes</Button>
              </div>
              <div v-if="recentActivity.length" class="space-y-3">
                <div v-for="evt in recentActivity" :key="evt.id" class="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                  <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    :class="evt.type === 'created' ? 'bg-blue-400' : evt.type === 'staff_assigned' ? 'bg-gold-400' : evt.type === 'message' ? 'bg-primary' : 'bg-slate-300'" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-slate-700">{{ evt.description }}</p>
                    <p class="text-xs text-slate-400">{{ formatRelativeDate(evt.createdAt) }}</p>
                  </div>
                  <Badge v-if="evt.processTitle" variant="default" size="sm">{{ evt.processTitle }}</Badge>
                </div>
              </div>
              <p v-else class="text-sm text-slate-400 text-center py-4">Aucune activité récente</p>
            </Card>
          </div>

          <div class="space-y-4">
            <Card>
              <h3 class="font-semibold text-slate-900 mb-3">Indicateurs clés</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span class="text-sm text-slate-500">Dossiers actifs</span>
                  <span class="text-sm font-bold text-slate-900">{{ staffAssignmentCount }}/7</span>
                </div>
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span class="text-sm text-slate-500">En attente</span>
                  <span class="text-sm font-bold text-amber-600">{{ unassignedProcesses.length }}</span>
                </div>
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span class="text-sm text-slate-500">Vues totales</span>
                  <span class="text-sm font-bold text-slate-900">0</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">Messages non lus</span>
                  <span class="text-sm font-bold text-red-500">{{ totalUnreadMessages }}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 class="font-semibold text-slate-900 mb-3">Actions rapides</h3>
              <div class="space-y-2">
                <Button variant="primary" full-width size="sm" @click="staffTab = 'selling'">
                  Gérer les ventes
                </Button>
                <Button variant="outline" full-width size="sm" @click="router.push('/analysis')">
                  Analyses marché
                </Button>
                <Button variant="outline" full-width size="sm" @click="router.push('/properties')">
                  Catalogue biens
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- CLIENT: Selling Tab -->
      <!-- ============================================================ -->
      <div v-if="!auth.isStaff && clientTab === 'selling'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900">Mes biens en vente</h2>
          <Button variant="primary" size="sm" @click="router.push('/vendre')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle vente
          </Button>
        </div>
        <div v-if="safeProcesses.length" class="space-y-3">
          <Card v-for="p in safeProcesses" :key="p.id" hover padding="md" @click="navigateToSellDetail(p.id)">
            <div class="flex items-center gap-4">
              <div class="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                <img :src="cdnUrl(p.images[0]?.url)" :alt="p.title" class="w-full h-full object-cover" loading="lazy" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-medium text-slate-900 truncate">{{ p.title }}</p>
                  <Badge :variant="statusVariants[p.status] || 'default'" size="sm">{{ statusLabels[p.status] || p.status }}</Badge>
                </div>
                <p class="text-xs text-slate-500">{{ p.city }} ({{ p.postalCode }}) • {{ typeLabels[p.type] }} • {{ p.surface }} m²</p>
                <p class="text-sm font-bold text-primary mt-1">{{ formatPrice(p.price) }}</p>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-slate-400">0 vues</span>
                <span class="text-slate-400">0 nouveau</span>
              </div>
              <svg class="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Card>
        </div>
        <div v-else-if="sellLoading" class="text-center py-8">
          <p class="text-slate-400 text-sm">Chargement de vos annonces...</p>
        </div>
        <div v-else class="text-center py-12">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">Vous n'avez aucun bien en vente</p>
          <p class="text-slate-400 text-sm mt-1">Soumettez votre premier bien pour commencer</p>
          <Button variant="primary" size="sm" class="mt-4" @click="router.push('/vendre')">Vendre un bien</Button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- STAFF: Selling Tab -->
      <!-- ============================================================ -->
      <div v-if="auth.isStaff && staffTab === 'selling'">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-lg font-semibold text-slate-900">Gestion des ventes</h2>
          <Badge variant="info">{{ staffAssignmentCount }}/7 dossiers</Badge>
        </div>
        <div v-if="unassignedProcesses.length" class="mb-8">
          <h3 class="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Non assignés ({{ unassignedProcesses.length }})</h3>
          <div class="space-y-3">
            <Card v-for="p in unassignedProcesses" :key="p.id" hover padding="md" @click="navigateToSellDetail(p.id)">
              <div class="flex items-center gap-4">
                <div class="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img :src="cdnUrl(p.images[0]?.url)" :alt="p.title" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-medium text-slate-900 truncate">{{ p.title }}</p>
                    <Badge variant="warning" size="sm">En attente</Badge>
                  </div>
                  <p class="text-xs text-slate-500">{{ p.city }} ({{ p.postalCode }}) • {{ typeLabels[p.type] }} • {{ p.surface }} m²</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm font-bold text-primary">{{ formatPrice(p.price) }}</span>
                  </div>
                </div>
                <Button variant="primary" size="sm" :disabled="!canAssign" :title="!canAssign ? 'Limite de 7 dossiers atteinte' : 'Prendre en charge'" @click.stop="handleAssign(p.id)">
                  Prendre en charge
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Mes dossiers ({{ staffAssignmentCount }})</h3>
          <div v-if="myAssignedProcesses.length" class="space-y-3">
            <Card v-for="p in myAssignedProcesses" :key="p.id" hover padding="md">
              <div class="flex items-start gap-4">
                <div class="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 cursor-pointer" @click="navigateToSellDetail(p.id)">
                  <img :src="cdnUrl(p.images[0]?.url)" :alt="p.title" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 cursor-pointer" @click="navigateToSellDetail(p.id)">
                    <p class="font-medium text-slate-900 truncate">{{ p.title }}</p>
                    <Badge :variant="statusVariants[p.status] || 'default'" size="sm">{{ statusLabels[p.status] || p.status }}</Badge>
                  </div>
                  <p class="text-xs text-slate-500 cursor-pointer" @click="navigateToSellDetail(p.id)">{{ p.city }} ({{ p.postalCode }}) • {{ typeLabels[p.type] }} • {{ p.surface }} m²</p>
                  <div class="flex items-center gap-2 mt-1 cursor-pointer" @click="navigateToSellDetail(p.id)">
                    <span class="text-sm font-bold text-primary">{{ formatPrice(p.price) }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0 mt-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>0 non lu(s)</span>
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>0</span>
                </div>
                <svg class="w-5 h-5 text-slate-300 flex-shrink-0 mt-1 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" @click="navigateToSellDetail(p.id)">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-slate-400 text-sm">Aucun dossier assigné pour le moment</p>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- Profile Tab (same for both) -->
      <!-- ============================================================ -->
      <div v-if="(!auth.isStaff && clientTab === 'profile') || (auth.isStaff && staffTab === 'profile')">
        <Card class="max-w-lg">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-medium">
              {{ auth.user?.firstName.charAt(0) }}{{ auth.user?.lastName.charAt(0) }}
            </div>
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
              <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-500">Rôle</span>
              <span class="text-sm font-medium text-slate-900 capitalize">{{ auth.user?.role }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-500">Email</span>
              <span class="text-sm text-slate-900">{{ auth.user?.email }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-500">Téléphone</span>
              <span class="text-sm text-slate-900">{{ auth.user?.phone || 'Non renseigné' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-slate-500">Membre depuis</span>
              <span class="text-sm text-slate-900">{{ new Date(auth.user?.createdAt || '').toLocaleDateString('fr-FR') }}</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100">
            <Button variant="danger" size="sm" @click="auth.logout(); router.push('/')">Déconnexion</Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
