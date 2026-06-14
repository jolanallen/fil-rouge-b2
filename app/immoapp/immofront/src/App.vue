<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import ToastNotification from '@/components/global/ToastNotification.vue'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const auth = useAuthStore()
auth.init()

const route = useRoute()
const showLayout = computed(() => !route.meta.hideLayout)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="showLayout" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer v-if="showLayout" />
    <ToastNotification />
  </div>
</template>


