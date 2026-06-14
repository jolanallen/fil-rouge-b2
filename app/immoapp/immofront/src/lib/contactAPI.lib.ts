import { apiPost } from './api.lib'
import type { ContactDTO } from '@/types/dtos/analysis.dto'

export async function submitContact(data: ContactDTO): Promise<{ success: boolean; message: string }> {
  try {
    return await apiPost('/contact', data)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return { success: true, message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.' }
  }
}
