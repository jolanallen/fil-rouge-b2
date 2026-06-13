<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string
  icon?: string
  trend?: number
  color?: string
  glass?: boolean
}>(), {
  color: 'primary',
  glass: false
})
</script>

<template>
  <div :class="['rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300', glass ? 'bg-white/10 border border-white/20 hover:bg-white/20' : 'bg-white border border-slate-100']">
    <div class="flex items-start justify-between">
      <div>
        <p :class="['text-sm mb-1', glass ? 'text-white/70' : 'text-slate-500']">{{ label }}</p>
        <p :class="['text-2xl font-bold', glass ? 'text-white' : 'text-slate-900']">{{ value }}</p>
        <div v-if="trend !== undefined" class="flex items-center gap-1 mt-1.5">
          <svg
            v-if="trend >= 0"
            class="w-4 h-4 text-emerald-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <svg
            v-else
            class="w-4 h-4 text-red-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span :class="['text-xs font-medium', glass ? (trend >= 0 ? 'text-emerald-300' : 'text-red-300') : (trend >= 0 ? 'text-emerald-600' : 'text-red-600')]">
            {{ trend >= 0 ? '+' : '' }}{{ trend }}%
          </span>
        </div>
      </div>
      <div v-if="icon" :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', glass ? 'bg-white/15 text-white' : 'bg-primary-50 text-primary']">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="icon === 'chart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          <path v-else-if="icon === 'building'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          <path v-else-if="icon === 'user'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    </div>
  </div>
</template>
