<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isScrolled = ref(false)
const isMobileOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 50
}

watch(() => route.path, () => {
  isMobileOpen.value = false
  isScrolled.value = false
  window.scrollY > 50 && (isScrolled.value = true)
})

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', onScroll)
}

const navLinks = [
  { name: 'Accueil', path: '/' },
  { name: 'Propriétés', path: '/properties' },
  { name: 'Vendre', path: '/vendre' },
  { name: 'Analyse Marché', path: '/analysis' },
  { name: 'À Propos', path: '/about' },
  { name: 'Contact', path: '/contact' }
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <nav
    :class="[
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      isScrolled ? 'glass shadow-sm' : 'bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm group-hover:bg-primary-800 transition-colors">
            YP
          </div>
          <span :class="['text-xl font-serif font-semibold transition-colors', isScrolled ? 'text-primary' : 'text-white']">Y-Plaza</span>
        </router-link>

        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(link.path)
                ? isScrolled ? 'bg-primary text-white' : 'bg-white/20 text-white'
                : isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:bg-white/10 hover:text-white'
            ]"
          >
            {{ link.name }}
          </router-link>
        </div>

        <div class="flex items-center gap-3">
          <template v-if="auth.isAuthenticated">
            <router-link to="/dashboard">
              <div class="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-white text-sm font-medium hover:bg-gold-600 transition-colors cursor-pointer">
                {{ auth.user?.firstName.charAt(0) }}{{ auth.user?.lastName.charAt(0) }}
              </div>
            </router-link>
          </template>
          <template v-else>
            <router-link
              to="/login"
              :class="[
                'hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                isScrolled ? 'text-primary hover:bg-primary-50 border border-primary' : 'text-white hover:bg-white/10 border border-white/30'
              ]"
            >
              Connexion
            </router-link>
            <router-link
              to="/login?register=true"
              :class="[
                'hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                isScrolled ? 'bg-primary text-white hover:bg-primary-800' : 'bg-white text-primary hover:bg-warm-50'
              ]"
            >
              Inscription
            </router-link>
          </template>

          <button
            class="md:hidden p-2 rounded-lg cursor-pointer"
            :class="isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'"
            @click="isMobileOpen = !isMobileOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Transition name="mobile-menu">
      <div v-if="isMobileOpen" class="md:hidden glass border-t border-slate-100 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            :class="{ 'bg-primary-50 text-primary': isActive(link.path) }"
          >
            {{ link.name }}
          </router-link>
          <hr class="my-2 border-slate-100" />
          <template v-if="auth.isAuthenticated">
            <router-link to="/dashboard" class="block px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary-50 transition-colors">
              Tableau de bord
            </router-link>
            <button class="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer" @click="auth.logout()">
              Déconnexion
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="block px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary-50 transition-colors">
              Connexion
            </router-link>
            <router-link to="/login?register=true" class="block px-4 py-3 rounded-xl text-sm font-medium bg-primary text-white text-center mt-1">
              Inscription
            </router-link>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: all 0.25s ease;
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
