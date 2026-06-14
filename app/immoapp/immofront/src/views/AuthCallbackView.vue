<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

onMounted(async () => {
  const accessToken = route.query.accessToken as string
  const refreshToken = route.query.refreshToken as string

  if (!accessToken) {
    router.push('/login')
    return
  }

  try {
    await auth.handleGoogleCallback(accessToken, refreshToken)
    router.push('/dashboard')
  } catch {
    router.push('/login')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-warm-50">
    <div class="text-center">
      <div class="w-12 h-12 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center">
        <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p class="text-slate-600 text-sm">Connexion en cours...</p>
    </div>
  </div>
</template>
