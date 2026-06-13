<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}>(), {
  variant: 'default',
  size: 'sm'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variant === 'default' ? 'bg-slate-100 text-slate-700' : '',
      variant === 'success' ? 'bg-emerald-50 text-emerald-700' : '',
      variant === 'warning' ? 'bg-amber-50 text-amber-700' : '',
      variant === 'danger' ? 'bg-red-50 text-red-700' : '',
      variant === 'info' ? 'bg-blue-50 text-blue-700' : ''
    ]"
  >
    <slot />
  </span>
</template>
