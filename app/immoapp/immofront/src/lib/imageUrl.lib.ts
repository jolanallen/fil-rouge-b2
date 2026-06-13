const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

export function cdnUrl(url: string | undefined | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  const base = API_BASE.replace('/api/v1', '')
  return `${base}/cdn${url.startsWith('/') ? '' : '/'}${url}`
}
