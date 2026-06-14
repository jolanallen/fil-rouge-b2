import { Injectable, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable } from 'rxjs'

export interface SSEMessage {
  event: string
  data: Record<string, unknown>
}

@Injectable()
export class AnalysisProxyService {
  private readonly apiUrl: string

  constructor(config: ConfigService) {
    this.apiUrl = config.get<string>('IMMOPREDICT_API_URL')
      || config.get<string>('IMMOPREDICT_URL')
      || 'http://localhost:8000/api/v1'
    if (this.apiUrl === config.get<string>('IMMOPREDICT_URL')) {
      this.apiUrl += '/api/v1'
    }
  }

  async startAnalysis(departmentCode: string, year?: number): Promise<{ task_id: number }> {
    const res = await fetch(`${this.apiUrl}/analysis/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_code: departmentCode, year: year || new Date().getFullYear() }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`immopredict start-analysis failed (${res.status}): ${text}`)
    }
    return res.json()
  }

  async estimatePrice(postalCode: string, surface: number, type: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.apiUrl}/analysis/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postal_code: postalCode, surface, type }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
      throw new HttpException(body.detail || 'Estimation non disponible', res.status)
    }
    const data = await res.json() as Record<string, unknown>
    return {
      department: data.department,
      postalCode: data.postal_code,
      city: data.city,
      type: data.type,
      surface: data.surface,
      estimatedPrice: data.estimated_price,
      estimatedPricePerM2: data.estimated_price_per_m2,
      confidenceScore: data.confidence_score,
      transactionCount: data.transaction_count,
    }
  }

  connectToTaskSSE(taskId: number): Observable<SSEMessage> {
    return new Observable<SSEMessage>(subscriber => {
      const aborter = new AbortController()
      let cancelled = false

      const run = async () => {
        try {
          const res = await fetch(`${this.apiUrl}/analysis/stream/${taskId}`, {
            signal: aborter.signal,
          })
          if (!res.ok) throw new Error(`SSE connection failed (${res.status})`)

          const reader = res.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (!cancelled) {
            const { done, value } = await reader.read()
            if (done) { subscriber.complete(); return }

            buffer += decoder.decode(value, { stream: true })
            const blocks = buffer.split('\n\n')
            buffer = blocks.pop() || ''

            for (const block of blocks) {
              const msg = this.parseSSEBlock(block)
              if (msg) subscriber.next(msg)
            }
          }
        } catch (err: unknown) {
          if (!cancelled) subscriber.error(err)
        }
      }

      run()
      return () => { cancelled = true; aborter.abort() }
    })
  }

  private parseSSEBlock(block: string): SSEMessage | null {
    const lines = block.trim().split('\n')
    let event = 'message'
    let rawData = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) event = line.slice(7)
      else if (line.startsWith('data: ')) rawData = line.slice(6)
    }

    if (!rawData) return null
    try {
      const parsed = JSON.parse(rawData)
      return { event, data: parsed }
    } catch {
      return { event, data: { raw: rawData } }
    }
  }
}
