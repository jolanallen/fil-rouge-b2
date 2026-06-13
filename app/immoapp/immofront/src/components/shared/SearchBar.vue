<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

withDefaults(defineProps<{
  variant?: 'default' | 'glass'
}>(), {
  variant: 'default'
})

function search() {
  if (query.value.trim()) {
    router.push({ name: 'PropertyList', query: { city: query.value.trim() } })
  }
}
</script>

<template>
  <form @submit.prevent="search" class="relative w-full max-w-2xl">
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" :class="variant === 'glass' ? 'text-white/50' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher une ville, un type de bien..."
        :class="[
          'w-full pl-12 pr-36 py-4 rounded-2xl text-base focus:outline-none focus:ring-2 transition-all',
          variant === 'glass'
            ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 focus:border-white/30'
            : 'bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-lg focus:ring-primary-200 focus:border-primary-300'
        ]"
      />
      <button
        type="submit"
        :class="[
          'absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer',
          variant === 'glass'
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-primary text-white hover:bg-primary-800'
        ]"
      >
        Rechercher
      </button>
    </div>
  </form>
</template>
