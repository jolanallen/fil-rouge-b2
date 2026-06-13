import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/presenters/auth.presenter'
import type { LoginDTO, RegisterDTO } from '@/types/dtos/auth.dto'
import * as authAPI from '@/lib/authAPI.lib'
import { useToast } from '@/composable/useToast'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  const isAuthenticated = computed(() => !!accessToken.value)
  const isStaff = computed(() => user.value?.role === 'staff')
  const fullName = computed(() => user.value ? `${user.value.firstName} ${user.value.lastName}` : '')

  function save() {
    localStorage.setItem('auth', JSON.stringify({
      user: user.value,
      accessToken: accessToken.value,
      refreshToken: refreshToken.value
    }))
  }

  function isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  async function init() {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (!parsed.refreshToken) {
          localStorage.removeItem('auth')
          return
        }
        user.value = parsed.user
        accessToken.value = parsed.accessToken
        refreshToken.value = parsed.refreshToken
        if (accessToken.value && isTokenExpired(accessToken.value)) {
          await refresh()
        }
      } catch {
        localStorage.removeItem('auth')
      }
    }
  }

  async function login(data: LoginDTO) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.login(data)
      user.value = response.user
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      save()
      return true
    } catch (e: any) {
      const msg = e.message || 'Erreur de connexion'
      error.value = msg
      toast.error(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterDTO) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.register(data)
      user.value = response.user
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      save()
      toast.success('Compte créé avec succès')
      return true
    } catch (e: any) {
      const msg = e.message || "Erreur d'inscription"
      error.value = msg
      toast.error(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.loginWithGoogle()
      user.value = response.user
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      save()
      return true
    } catch (e: any) {
      const msg = e.message || 'Erreur de connexion Google'
      error.value = msg
      toast.error(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  async function handleGoogleCallback(accessTokenValue: string, refreshTokenValue: string) {
    accessToken.value = accessTokenValue
    refreshToken.value = refreshTokenValue
    save()
    const response = await authAPI.getProfile()
    user.value = response
    save()
  }

  function clearSession() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('auth')
  }

  async function refresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const response = await authAPI.refreshToken(refreshToken.value)
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      if (response.user) user.value = response.user
      save()
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function logout() {
    clearSession()
    try {
      await authAPI.logout()
    } catch {
      // Backend unreachable — session already cleared locally
    }
  }

  return { user, accessToken, refreshToken, loading, error, isAuthenticated, isStaff, fullName, init, login, register, loginWithGoogle, handleGoogleCallback, refresh, logout, clearSession }
})
