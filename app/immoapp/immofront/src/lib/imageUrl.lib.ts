const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || API_BASE.replace('/api/v1', '')

export function cdnUrl(url: string | undefined | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  return `${CDN_BASE}/cdn${url.startsWith('/') ? '' : '/'}${url}`
}
