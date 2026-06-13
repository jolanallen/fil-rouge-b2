const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function getToken(): string | null {
  const stored = localStorage.getItem('auth')
  if (!stored) return null
  try {
    return JSON.parse(stored).accessToken
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  const stored = localStorage.getItem('auth')
  if (!stored) return null
  try {
    return JSON.parse(stored).refreshToken
  } catch {
    return null
  }
}

export async function mockDelay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function unwrap<T>(response: Response): Promise<T> {
  const json = await response.json() as any
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  return json as T
}

const FRENDLY_ERRORS: Record<number, string> = {
  400: 'Données invalides. Veuillez vérifier votre saisie.',
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  409: 'Conflit avec les données existantes.',
  422: 'Données invalides.',
  429: 'Trop de requêtes. Veuillez patienter.',
  500: 'Une erreur serveur est survenue. Veuillez réessayer.',
  503: 'Service temporairement indisponible.',
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (body && typeof body === 'object') {
      if (typeof body.message === 'string' && !/^[A-Z]/.test(body.message)) {
        return body.message
      }
      if (Array.isArray(body.message)) {
        return body.message.join(', ')
      }
    }
  } catch {
    // ignore parse failure
  }
  return FRENDLY_ERRORS[res.status] || 'Une erreur est survenue. Veuillez réessayer.'
}

async function attemptTokenRefresh(): Promise<boolean> {
  const rt = getRefreshToken()
  if (!rt) return false
  const stored = localStorage.getItem('auth')
  const parsed = stored ? JSON.parse(stored) : {}
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt })
    })
    if (!res.ok) return false
    const json = await res.json()
    const data = json?.data || json
    if (!data.accessToken) return false
    localStorage.setItem('auth', JSON.stringify({
      user: parsed.user || null,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || rt
    }))
    return true
  } catch {
    return false
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, triedRefresh = false): Promise<T> {
  if (USE_MOCK) {
    await mockDelay()
    throw new Error('MOCK_NEEDS_HANDLER')
  }
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401 && !triedRefresh && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      const refreshed = await attemptTokenRefresh()
      if (refreshed) return request<T>(endpoint, options, true)
    }
    throw new Error(await parseError(res))
  }
  return unwrap<T>(res)
}

export async function apiGet<T>(endpoint: string, _params?: Record<string, string | number | undefined>): Promise<T> {
  const qs = _params
    ? '?' + Object.entries(_params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : ''
  return request<T>(`${endpoint}${qs}`)
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) })
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' })
}
