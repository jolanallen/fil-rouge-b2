<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  role: string
  content: string
  avatar?: string
  rating?: number
}>(), {
  rating: 5
})

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => i < n)
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
    <div class="flex gap-1 mb-4">
      <svg v-for="(filled, i) in stars(rating)" :key="i" class="w-4 h-4" :class="filled ? 'text-gold-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
    <p class="text-slate-600 text-sm leading-relaxed mb-5 italic">"{{ content }}"</p>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium text-sm">
        {{ name.charAt(0) }}{{ name.split(' ')[1]?.charAt(0) }}
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ name }}</p>
        <p class="text-xs text-slate-500">{{ role }}</p>
      </div>
    </div>
  </div>
</template>
