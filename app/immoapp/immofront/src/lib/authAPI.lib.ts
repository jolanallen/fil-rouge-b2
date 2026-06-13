import { apiGet, apiPost } from './api.lib'
import type { LoginDTO, RegisterDTO } from '@/types/dtos/auth.dto'
import type { AuthResponse, User } from '@/types/presenters/auth.presenter'

const MOCK_USERS = [
  {
    id: '1',
    email: 'client@yplaza.fr',
    password: 'client123',
    firstName: 'Marie',
    lastName: 'Dubois',
    phone: '0612345678',
    role: 'client' as const,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marie',
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: '2',
    email: 'staff@yplaza.fr',
    password: 'staff123',
    firstName: 'Thomas',
    lastName: 'Lefebvre',
    phone: '0687654321',
    role: 'staff' as const,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Thomas',
    createdAt: '2025-01-10T08:00:00Z'
  }
]

export async function login(data: LoginDTO): Promise<AuthResponse> {
  try {
    return await apiPost<AuthResponse>('/auth/login', data)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    const user = MOCK_USERS.find(u => u.email === data.email && u.password === data.password)
    if (!user) {
      throw new Error('Identifiants invalides')
    }
    return {
      user: { ...user, password: undefined } as any,
      accessToken: 'mock-access-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id,
      expiresIn: 3600
    }
  }
}

export async function register(data: RegisterDTO): Promise<AuthResponse> {
  try {
    return await apiPost<AuthResponse>('/auth/register', data)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    const newUser = {
      id: String(Date.now()),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.firstName}`,
      createdAt: new Date().toISOString()
    }
    return {
      user: newUser,
      accessToken: 'mock-access-token-' + newUser.id,
      refreshToken: 'mock-refresh-token-' + newUser.id,
      expiresIn: 3600
    }
  }
}

export async function loginWithGoogle(): Promise<AuthResponse> {
  // Mock implementation — real flow redirects to backend /auth/google
  const newUser = {
    id: 'google-' + Date.now(),
    email: 'client.google@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'client' as const,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jean',
    createdAt: new Date().toISOString()
  }
  return {
    user: newUser,
    accessToken: 'mock-access-token-google-' + newUser.id,
    refreshToken: 'mock-refresh-token-google-' + newUser.id,
    expiresIn: 3600
  }
}

export async function getProfile(): Promise<User> {
  try {
    return await apiGet<User>('/auth/profile')
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    const stored = localStorage.getItem('auth')
    if (stored) {
      return JSON.parse(stored).user
    }
    throw new Error('Not authenticated')
  }
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  try {
    return await apiPost<AuthResponse>('/auth/refresh', { refreshToken: token })
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return {
      user: { id: 'mock', email: '', firstName: '', lastName: '', role: 'client', createdAt: '' },
      accessToken: 'mock-refreshed-access-token',
      refreshToken: 'mock-refreshed-refresh-token',
      expiresIn: 3600
    }
  }
}

export async function logout(): Promise<void> {
  try {
    await apiPost('/auth/logout', {})
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    // mock: always succeed
  }
}
