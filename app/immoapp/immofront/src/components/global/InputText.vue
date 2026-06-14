<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  icon?: string
  disabled?: boolean
  required?: boolean
}>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="label" class="block text-sm font-medium text-slate-700 mb-1.5">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <span class="text-lg" v-html="icon" />
      </div>
      <input
        :id="label"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400',
          icon ? 'pl-10' : '',
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-primary-300 focus:ring-primary-200 hover:border-slate-300'
        ]"
        @input="onInput"
      />
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
