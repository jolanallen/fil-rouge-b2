<script setup lang="ts">
withDefaults(defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  glass?: boolean
  class?: string
}>(), {
  padding: 'md',
  hover: false,
  glass: false
})
</script>

<template>
  <div
    :class="[
      'rounded-2xl bg-white border border-slate-100 transition-all duration-300',
      glass ? 'glass' : '',
      hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'shadow-sm',
      padding === 'none' ? '' : '',
      padding === 'sm' ? 'p-4' : '',
      padding === 'md' ? 'p-6' : '',
      padding === 'lg' ? 'p-8' : ''
    ]"
  >
    <slot />
  </div>
</template>
