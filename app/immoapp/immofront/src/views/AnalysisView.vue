<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import { useAnalysis } from '@/composable/useAnalysis'
import Button from '@/components/global/Button.vue'
import Card from '@/components/global/Card.vue'
import Badge from '@/components/global/Badge.vue'
import AnalysisProgress from '@/components/shared/AnalysisProgress.vue'

const { result, loading, error, progress, progressMessage, currentCity, runAnalysis, fetchResults } = useAnalysis()
useScrollAnimation()

const DEPARTMENTS = [
  { code: '01', name: 'Ain' }, { code: '02', name: 'Aisne' }, { code: '03', name: 'Allier' },
  { code: '04', name: 'Alpes-de-Haute-Provence' }, { code: '05', name: 'Hautes-Alpes' },
  { code: '06', name: 'Alpes-Maritimes' }, { code: '07', name: 'Ardèche' },
  { code: '08', name: 'Ardennes' }, { code: '09', name: 'Ariège' }, { code: '10', name: 'Aube' },
  { code: '11', name: 'Aude' }, { code: '12', name: 'Aveyron' }, { code: '13', name: 'Bouches-du-Rhône' },
  { code: '14', name: 'Calvados' }, { code: '15', name: 'Cantal' }, { code: '16', name: 'Charente' },
  { code: '17', name: 'Charente-Maritime' }, { code: '18', name: 'Cher' },
  { code: '19', name: 'Corrèze' }, { code: '2A', name: 'Corse-du-Sud' },
  { code: '2B', name: 'Haute-Corse' }, { code: '21', name: "Côte-d'Or" },
  { code: '22', name: "Côtes-d'Armor" }, { code: '23', name: 'Creuse' },
  { code: '24', name: 'Dordogne' }, { code: '25', name: 'Doubs' }, { code: '26', name: 'Drôme' },
  { code: '27', name: 'Eure' }, { code: '28', name: 'Eure-et-Loir' },
  { code: '29', name: 'Finistère' }, { code: '30', name: 'Gard' },
  { code: '31', name: 'Haute-Garonne' }, { code: '32', name: 'Gers' },
  { code: '33', name: 'Gironde' }, { code: '34', name: 'Hérault' },
  { code: '35', name: 'Ille-et-Vilaine' }, { code: '36', name: 'Indre' },
  { code: '37', name: 'Indre-et-Loire' }, { code: '38', name: 'Isère' },
  { code: '39', name: 'Jura' }, { code: '40', name: 'Landes' },
  { code: '41', name: 'Loir-et-Cher' }, { code: '42', name: 'Loire' },
  { code: '43', name: 'Haute-Loire' }, { code: '44', name: 'Loire-Atlantique' },
  { code: '45', name: 'Loiret' }, { code: '46', name: 'Lot' },
  { code: '47', name: 'Lot-et-Garonne' }, { code: '48', name: 'Lozère' },
  { code: '49', name: 'Maine-et-Loire' }, { code: '50', name: 'Manche' },
  { code: '51', name: 'Marne' }, { code: '52', name: 'Haute-Marne' },
  { code: '53', name: 'Mayenne' }, { code: '54', name: 'Meurthe-et-Moselle' },
  { code: '55', name: 'Meuse' }, { code: '56', name: 'Morbihan' },
  { code: '57', name: 'Moselle' }, { code: '58', name: 'Nièvre' },
  { code: '59', name: 'Nord' }, { code: '60', name: 'Oise' },
  { code: '61', name: 'Orne' }, { code: '62', name: 'Pas-de-Calais' },
  { code: '63', name: 'Puy-de-Dôme' }, { code: '64', name: 'Pyrénées-Atlantiques' },
  { code: '65', name: 'Hautes-Pyrénées' }, { code: '66', name: 'Pyrénées-Orientales' },
  { code: '67', name: 'Bas-Rhin' }, { code: '68', name: 'Haut-Rhin' },
  { code: '69', name: 'Rhône' }, { code: '70', name: 'Haute-Saône' },
  { code: '71', name: 'Saône-et-Loire' }, { code: '72', name: 'Sarthe' },
  { code: '73', name: 'Savoie' }, { code: '74', name: 'Haute-Savoie' },
  { code: '75', name: 'Paris' }, { code: '76', name: 'Seine-Maritime' },
  { code: '77', name: 'Seine-et-Marne' }, { code: '78', name: 'Yvelines' },
  { code: '79', name: 'Deux-Sèvres' }, { code: '80', name: 'Somme' },
  { code: '81', name: 'Tarn' }, { code: '82', name: 'Tarn-et-Garonne' },
  { code: '83', name: 'Var' }, { code: '84', name: 'Vaucluse' },
  { code: '85', name: 'Vendée' }, { code: '86', name: 'Vienne' },
  { code: '87', name: 'Haute-Vienne' }, { code: '88', name: 'Vosges' },
  { code: '89', name: 'Yonne' }, { code: '90', name: 'Territoire de Belfort' },
  { code: '91', name: 'Essonne' }, { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' }, { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: "Val-d'Oise" }, { code: '971', name: 'Guadeloupe' },
  { code: '972', name: 'Martinique' }, { code: '973', name: 'Guyane' },
  { code: '974', name: 'La Réunion' }, { code: '976', name: 'Mayotte' },
]

const selectedDept = ref('13')
const searchInput = ref('')
const dropdownOpen = ref(false)
let blurTimer: ReturnType<typeof setTimeout> | null = null

const filteredDepartments = computed(() => {
  const q = searchInput.value.toLowerCase()
  if (!q) return DEPARTMENTS
  return DEPARTMENTS.filter(d =>
    d.code.startsWith(q) || d.name.toLowerCase().includes(q)
  )
})

function selectDept(code: string) {
  selectedDept.value = code
  const dept = DEPARTMENTS.find(d => d.code === code)
  searchInput.value = dept ? `${dept.name} (${dept.code})` : code
  dropdownOpen.value = false
}

function onInputFocus() {
  if (blurTimer) clearTimeout(blurTimer)
  dropdownOpen.value = true
}

function onInputBlur() {
  blurTimer = setTimeout(() => { dropdownOpen.value = false }, 200)
}

onMounted(() => {
  fetchResults(selectedDept.value)
})

watch(selectedDept, (code) => {
  fetchResults(code)
})

function analyze() {
  runAnalysis({ departmentCode: selectedDept.value })
}

function formatCompact(p: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 2 }).format(p)
}

function formatGrowth(r: number) {
  return r > 0 ? `+${r}%` : `${r}%`
}
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <section class="relative pt-16 lg:pt-20 pb-20 lg:pb-24 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 text-center pt-6">
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal">Analyse IA</span>
        <h1 class="text-3xl sm:text-4xl font-serif font-bold text-white reveal">Analyse Prédictive du Marché</h1>
        <p class="text-slate-300 mt-2 max-w-xl mx-auto reveal">Basé sur les données DVF et notre modèle de prédiction IA</p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
      <!-- Controls -->
      <Card class="max-w-lg mx-auto mb-10 reveal">
        <div class="flex items-center gap-3">
          <div class="flex-1 relative">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Département</label>
            <input
              v-model="searchInput"
              placeholder="Rechercher un département..."
              class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              @focus="onInputFocus"
              @blur="onInputBlur"
              @input="dropdownOpen = true"
            />
            <svg class="absolute right-3 top-1/2 mt-3 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <div
              v-if="dropdownOpen && filteredDepartments.length > 0"
              class="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <button
                v-for="d in filteredDepartments"
                :key="d.code"
                type="button"
                class="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center justify-between"
                :class="{ 'bg-primary-50 text-primary-700': d.code === selectedDept }"
                @mousedown.prevent="selectDept(d.code)"
              >
                <span>{{ d.name }}</span>
                <span class="text-xs text-slate-400 font-mono">{{ d.code }}</span>
              </button>
            </div>
            <div
              v-if="dropdownOpen && filteredDepartments.length === 0"
              class="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg px-4 py-3 text-sm text-slate-400"
            >
              Aucun département trouvé
            </div>
          </div>
          <Button variant="primary" class="sm:mt-6 mt-0" :loading="loading" @click="analyze">Analyser</Button>
        </div>
      </Card>

      <!-- Progress indicator -->
      <div v-if="loading && !result" class="mb-10 reveal">
        <AnalysisProgress :progress="progress" :message="progressMessage" :current-city="currentCity" />
      </div>

      <div v-if="error && !loading" class="text-center py-20 max-w-md mx-auto">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-slate-400 font-medium">Analyse indisponible</p>
        <p class="text-sm text-slate-300 mt-1 mb-6">Les données d'analyse n'ont pas pu être chargées. Veuillez réessayer.</p>
        <button class="text-sm font-medium text-primary hover:text-primary-600 transition-colors cursor-pointer underline underline-offset-4" @click="fetchResults(selectedDept)">Réessayer</button>
      </div>

      <template v-if="result">
        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 mt-8">
          <Card padding="md" class="text-center reveal">
            <p class="text-xs text-slate-500 mb-1">Transactions</p>
            <p class="text-xl font-bold text-slate-900">{{ result.departmentSummary.totalTransactions.toLocaleString('fr-FR') }}</p>
          </Card>
          <Card padding="md" class="text-center reveal">
            <p class="text-xs text-slate-500 mb-1">Prix/m² Moyen</p>
            <p class="text-lg font-bold text-slate-900">{{ formatCompact(result.departmentSummary.avgPricePerM2) }}</p>
          </Card>
          <Card padding="md" class="text-center reveal">
            <p class="text-xs text-slate-500 mb-1">Prévision N+1</p>
            <p class="text-lg font-bold text-emerald-600">{{ formatCompact(result.departmentSummary.predictedAvgPriceNextYear) }}</p>
          </Card>
          <Card padding="md" class="text-center reveal">
            <p class="text-xs text-slate-500 mb-1">Croissance</p>
            <p class="text-lg font-bold" :class="result.departmentSummary.overallGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-500'">{{ formatGrowth(result.departmentSummary.overallGrowthRate) }}</p>
          </Card>
        </div>

        <Card class="mb-10 reveal">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Top Villes par Croissance</h2>
          <div class="space-y-3">
            <div
              v-for="(city, i) in result.departmentSummary.topCities"
              :key="city.city"
              class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
              :class="i < result.departmentSummary.topCities.length - 1 ? 'border-b border-slate-100' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-xs font-medium text-primary">{{ i + 1 }}</span>
                <span class="text-sm font-medium text-slate-900">{{ city.city }}</span>
              </div>
              <span class="text-sm font-semibold" :class="city.growthRate >= 0 ? 'text-emerald-600' : 'text-red-500'">{{ formatGrowth(city.growthRate) }}</span>
            </div>
          </div>
        </Card>

        <h2 class="text-xl font-semibold text-slate-900 mb-6 reveal">Analyse par Secteur</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="sector in result.sectors" :key="sector.id" class="reveal">
            <Card hover padding="lg">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">{{ sector.city }}</h3>
                  <p class="text-sm text-slate-400">{{ sector.postalCode ? sector.postalCode + ' • ' : '' }}{{ sector.departmentCode }}</p>
                </div>
                <Badge :variant="sector.growthRate >= 0 ? 'success' : 'danger'">{{ formatGrowth(sector.growthRate) }}</Badge>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-slate-400">Transactions</p>
                  <p class="text-lg font-bold text-slate-900">{{ sector.transactionCount.toLocaleString('fr-FR') }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400">Prix/m²</p>
                  <p class="text-sm font-semibold text-slate-900">{{ formatCompact(sector.avgPricePerM2) }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400">Prévision N+1</p>
                  <p class="text-sm font-semibold text-emerald-600">{{ formatCompact(sector.predictedPriceNextYear) }}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
