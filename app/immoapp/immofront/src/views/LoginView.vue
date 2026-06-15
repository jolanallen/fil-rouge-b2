<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { LoginDTO, RegisterDTO } from '@/types/dtos/auth.dto'
import Button from '@/components/global/Button.vue'
import InputText from '@/components/global/InputText.vue'
import { useBackgroundImage } from '@/composable/useBackgroundImage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { currentImage } = useBackgroundImage()

const isRegister = ref(route.query.register === 'true')
const isClientLogin = ref(true)

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const error = ref<string | null>(null)

const agentCode = ref('')

const onboardingFirstName = ref('')
const onboardingLastName = ref('')
const onboardingEmail = ref('')
const onboardingPhone = ref('')

function toggleMode() {
  if (!isClientLogin.value) return
  isRegister.value = !isRegister.value
  error.value = null
}

async function handleSubmit() {
  error.value = null
  if (!password.value || (isClientLogin.value ? !email.value : !agentCode.value)) {
    error.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }
  if (isRegister.value && password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (isRegister.value && !isClientLogin.value) {
    error.value = 'Inscriptions uniquement possible pour les clients.'
    return
  }
  if (isRegister.value && isClientLogin.value) {
    const data: RegisterDTO = {
      email: email.value,
      password: password.value,
      firstName: firstName.value || 'Utilisateur',
      lastName: lastName.value || 'Y-Plaza',
      phone: phone.value || undefined,
    }
    const success = await auth.register(data)
    if (success) router.push('/dashboard')
    else error.value = auth.error
    return
  }
  if (!isRegister.value && isClientLogin.value) {
    const data: LoginDTO = {
      email: email.value,
      password: password.value,
    }
    const success = await auth.login(data)
    if (success) router.push('/dashboard')
    else error.value = auth.error
    return
  }
  if (!isRegister.value && !isClientLogin.value) {
    const success = await auth.staffLogin({
      username: agentCode.value || email.value,
      password: password.value,
    })
    if (success && auth.needsOnboarding) return
    if (success) router.push('/dashboard')
    else error.value = auth.error
  }
}

async function handleOnboardingSubmit() {
  error.value = null
  if (!onboardingFirstName.value || !onboardingLastName.value || !onboardingEmail.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }
  const success = await auth.completeOnboarding({
    firstName: onboardingFirstName.value,
    lastName: onboardingLastName.value,
    email: onboardingEmail.value,
    phone: onboardingPhone.value || undefined,
  })
  if (success) router.push('/dashboard')
  else error.value = auth.error
}

async function handleGoogleLogin() {
  error.value = null
  if (USE_MOCK) {
    const success = await auth.loginWithGoogle()
    if (success) router.push('/dashboard')
    else error.value = auth.error
  } else {
    window.location.href = `${API_BASE}/auth/google`
  }
}

function fillDemoCredentials() {
  if (isClientLogin.value) {
    email.value = 'client@yplaza.fr'
    password.value = 'client123'
  } else {
    agentCode.value = 'staff@yplaza.fr'
    password.value = 'staff123'
  }
}


</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left - Image -->
    <div class="hidden lg:block relative w-1/2">
      <img :src="currentImage" alt="Domaine" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent" />
      <div class="absolute bottom-12 left-12 z-10">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">YP</div>
          <span class="text-2xl font-serif font-semibold text-white">Y-Plaza</span>
        </div>
        <p class="text-white/60 text-sm max-w-xs">Gestion immobilière & Analyse de Marché</p>
      </div>
    </div>

    <!-- Right - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-warm-50">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-2 mb-4 lg:hidden">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">YP</div>
            <span class="text-lg font-serif font-semibold text-primary">Y-Plaza</span>
          </div>
          <h1 class="text-2xl font-serif font-bold text-slate-900">
            {{ auth.needsOnboarding ? 'Finaliser votre inscription' : isRegister ? 'Créer un compte' : 'Connexion' }}
          </h1>
          <p class="text-slate-500 text-sm mt-2">
            {{ auth.needsOnboarding ? 'Complétez votre profil pour accéder à l\'espace agent' : isRegister ? 'Rejoignez Y-Plaza dès aujourd\'hui' : 'Accédez à votre espace personnel' }}
          </p>
        </div>

        <!-- Role Switch -->
        <div v-if="!auth.needsOnboarding" class="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer', isClientLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            @click="isClientLogin = true"
          >
            Client
          </button>
          <button
            :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer', !isClientLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            @click="isClientLogin = false; isRegister = false; error = null"
          >
            Agent Y-Plaza
          </button>
        </div>

        <form v-if="!auth.needsOnboarding" @submit.prevent="handleSubmit" class="space-y-4">
          <template v-if="isRegister && isClientLogin">
            <div class="grid grid-cols-2 gap-3">
              <InputText v-model="firstName" label="Prénom" placeholder="Jean" />
              <InputText v-model="lastName" label="Nom" placeholder="Dupont" required />
            </div>
            <InputText v-model="phone" label="Téléphone" placeholder="0612345678" type="tel" />
          </template>

          <!-- LDAP badge for staff -->
          <div v-if="!isClientLogin" class="flex items-center gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl">
            <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-xs text-primary-700">Authentification LDAP — Agents uniquement</span>
          </div>

          <InputText v-if="isClientLogin" v-model="email" label="Email" placeholder="exemple@email.com" type="email" required />
          <InputText v-if="!isClientLogin" v-model="agentCode" label="Identifiant LDAP" placeholder="identifiant@yplaza.fr" required />
          <InputText v-model="password" label="Mot de passe" placeholder="••••••••" type="password" required />
          <InputText v-if="isRegister && isClientLogin" v-model="confirmPassword" label="Confirmer le mot de passe" placeholder="••••••••" type="password" required />

          <div v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p class="text-xs text-red-600">{{ error }}</p>
          </div>

          <Button type="submit" variant="primary" full-width :loading="auth.loading" size="lg">
            {{ isRegister && isClientLogin ? 'Créer mon compte' : !isClientLogin ? 'Connexion LDAP' : 'Se connecter' }}
          </Button>

          <div v-if="isClientLogin && !isRegister" class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200" />
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="bg-warm-50 px-2 text-slate-400">ou</span>
            </div>
          </div>

          <Button
            v-if="isClientLogin && !isRegister"
            type="button"
            variant="outline"
            full-width
            size="lg"
            @click="handleGoogleLogin"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </Button>
        </form>

        <!-- Onboarding Form -->
        <form v-if="auth.needsOnboarding" @submit.prevent="handleOnboardingSubmit" class="space-y-4">
          <div class="flex items-center gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl">
            <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-xs text-primary-700">Authentifié via LDAP — Complétez votre profil</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <InputText v-model="onboardingFirstName" label="Prénom" placeholder="Jean" required />
            <InputText v-model="onboardingLastName" label="Nom" placeholder="Dupont" required />
          </div>
          <InputText v-model="onboardingEmail" label="Email" placeholder="exemple@email.com" type="email" required />
          <InputText v-model="onboardingPhone" label="Téléphone" placeholder="0612345678" type="tel" />

          <div v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p class="text-xs text-red-600">{{ error }}</p>
          </div>

          <Button type="submit" variant="primary" full-width :loading="auth.loading" size="lg">
            Finaliser mon inscription
          </Button>
        </form>

        <p v-if="isClientLogin && !auth.needsOnboarding" class="text-center text-sm text-slate-500 mt-6">
          {{ isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
          <button class="text-primary font-medium hover:text-primary-700 cursor-pointer" @click="toggleMode">
            {{ isRegister ? 'Se connecter' : 'S\'inscrire' }}
          </button>
        </p>

        <div v-if="!auth.needsOnboarding" class="mt-4 p-3 bg-primary-50 border border-primary-100 rounded-xl">
          <p class="text-xs text-primary-700 font-medium mb-1">Comptes de démonstration :</p>
          <button class="text-xs text-primary-500 hover:text-primary-700 underline cursor-pointer" @click="fillDemoCredentials">
            Remplir automatiquement
          </button>
          <p class="text-xs text-primary-400 mt-1">
            Client: client@yplaza.fr / client123<br />
            Staff (LDAP): staff@yplaza.fr / staff123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
