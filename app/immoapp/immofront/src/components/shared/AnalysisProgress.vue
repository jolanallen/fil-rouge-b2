<script setup lang="ts">
defineProps<{
  progress: number
  message: string
  currentCity?: string
}>()
</script>

<template>
  <div class="max-w-lg mx-auto">
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="relative w-8 h-8">
          <div class="absolute inset-0 rounded-full bg-primary-100 animate-ping opacity-40" />
          <div class="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <svg class="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">Analyse en cours</p>
          <p class="text-xs text-slate-400">{{ progress }}%</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-primary via-primary-500 to-primary transition-all duration-700 ease-out relative"
          :style="{ width: progress + '%' }"
        >
          <div class="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>

      <!-- Current city -->
      <div v-if="currentCity" class="flex items-center gap-2.5 p-3 bg-primary-50 rounded-xl mb-3">
        <svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <p class="text-xs text-primary-600 font-medium">{{ currentCity }}</p>
          <p class="text-xs text-primary-400">Commune en cours d'analyse</p>
        </div>
      </div>

      <!-- Current message -->
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span>{{ message || 'Initialisation...' }}</span>
      </div>
    </div>
  </div>
</template>
