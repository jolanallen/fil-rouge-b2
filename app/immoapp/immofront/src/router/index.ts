import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallbackView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/properties',
    name: 'PropertyList',
    component: () => import('@/views/PropertyListView.vue')
  },
  {
    path: '/properties/:id',
    name: 'PropertyDetail',
    component: () => import('@/views/PropertyDetailView.vue'),
    props: true
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/AnalysisView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue')
  },
  {
    path: '/vendre',
    name: 'SellEstimation',
    component: () => import('@/views/SellEstimationView.vue')
  },
  {
    path: '/sell/:id',
    name: 'SellProcessDetail',
    component: () => import('@/views/SellProcessDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mentions-legales',
    name: 'LegalNotice',
    component: () => import('@/views/LegalNoticeView.vue')
  },
  {
    path: '/rgpd',
    name: 'RGPD',
    component: () => import('@/views/RGPDView.vue')
  },
  {
    path: '/cgv',
    name: 'CGV',
    component: () => import('@/views/CGVView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      const stored = localStorage.getItem('auth')
      if (stored) {
        await auth.init()
      }
      if (!auth.isAuthenticated) {
        return { name: 'Login', query: { redirect: to.fullPath } }
      }
    }
  }
})

export default router
