<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth ? 'w-full' : '',
      variant === 'primary' ? 'bg-primary text-white hover:bg-primary-800 focus:ring-primary-500 shadow-sm hover:shadow-md' : '',
      variant === 'secondary' ? 'bg-gold text-white hover:bg-gold-600 focus:ring-gold-500 shadow-sm hover:shadow-md' : '',
      variant === 'outline' ? 'border-2 border-primary text-primary hover:bg-primary-50 focus:ring-primary-500' : '',
      variant === 'ghost' ? 'text-primary hover:bg-primary-50 focus:ring-primary-500' : '',
      variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm' : '',
      size === 'sm' ? 'px-3 py-1.5 text-sm gap-1.5' : '',
      size === 'md' ? 'px-5 py-2.5 text-sm gap-2' : '',
      size === 'lg' ? 'px-7 py-3.5 text-base gap-2.5' : ''
    ]"
    @click="emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
