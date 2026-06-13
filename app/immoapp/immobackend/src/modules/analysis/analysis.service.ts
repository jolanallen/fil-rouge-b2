import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Observable, Subject, Subscription, defer, of, switchMap, map } from 'rxjs'
import { AnalysisProxyService } from './analysis-proxy.service'
import { SectorAnalysis } from './entities/sector-analysis.entity'
import { AnalysisTask } from './entities/analysis-task.entity'
import { PropertyTransaction } from './entities/property-transaction.entity'

interface SSEBridge {
  subject: Subject<MessageEvent>
  upstreamSub: Subscription
  refCount: number
}

@Injectable()
export class AnalysisService {
  private readonly sseBridges = new Map<number, SSEBridge>()

  constructor(
    private readonly proxy: AnalysisProxyService,
    @InjectRepository(SectorAnalysis)
    private readonly sectorRepo: Repository<SectorAnalysis>,
    @InjectRepository(AnalysisTask)
    private readonly taskRepo: Repository<AnalysisTask>,
    @InjectRepository(PropertyTransaction)
    private readonly txRepo: Repository<PropertyTransaction>,
  ) {}

  async start(departmentCode: string, year?: number) {
    const task = new AnalysisTask()
    task.department = departmentCode
    task.status = 'pending'
    task.progress = 0
    const saved = await this.taskRepo.save(task)

    try {
      const result = await this.proxy.startAnalysis(departmentCode, year)
      saved.pythonTaskId = result.task_id
      saved.status = 'in_progress'
      saved.startedAt = new Date()
      await this.taskRepo.save(saved)
    } catch (err: unknown) {
      saved.status = 'error'
      saved.message = err instanceof Error ? err.message : 'Unknown error'
      await this.taskRepo.save(saved)
    }

    return this.taskRepo.findOneBy({ id: saved.id })
  }

  async getTask(taskId: number) {
    const task = await this.taskRepo.findOneBy({ id: taskId })
    if (!task) throw new NotFoundException('Task not found')

    if ((task.status === 'pending' || task.status === 'in_progress') && task.pythonTaskId) {
      try {
        const pythonStatus = await this.proxy.getTaskStatus(task.pythonTaskId)
        const pythonStatusStr = String(pythonStatus.status ?? '')
        if (pythonStatusStr === 'completed' || pythonStatusStr === 'error') {
          task.status = pythonStatusStr === 'completed' ? 'completed' : 'error'
          task.progress = 100
          task.completedAt = new Date()
          task.message = pythonStatus.message || task.message || ''
          await this.taskRepo.save(task)
        } else {
          task.progress = Number(pythonStatus.progress ?? task.progress ?? 0)
          task.currentCity = String(pythonStatus.current_city ?? task.currentCity ?? '')
          await this.taskRepo.save(task)
        }
      } catch {
        // python unreachable, keep current DB state
      }
    }

    return task
  }

  async estimatePrice(department: string, surface: number, type: string) {
    return this.proxy.estimatePrice(department, surface, type)
  }

  async getResults(department: string) {
    const fromDb = department === 'all'
      ? await this.sectorRepo.find()
      : await this.sectorRepo.find({ where: { department } })

    if (fromDb.length > 0) return fromDb

    let data: Record<string, unknown>[]
    try {
      data = await this.proxy.getResults(department)
    } catch {
      return []
    }
    if (!Array.isArray(data)) return []

    const entities = data.map(d => {
      const s = new SectorAnalysis()
      s.city = String(d.city ?? d.commune ?? '')
      s.sector = d.sector ? String(d.sector) : ''
      s.department = department === 'all' ? String(d.department ?? d.departement ?? '') : department
      s.postalCode = d.postal_code ? String(d.postal_code) : (d.code_postal ? String(d.code_postal) : '')
      s.avgPrice = Number(d.avg_price ?? d.prix_moyen ?? 0)
      s.avgPriceM2 = Number(d.avg_price_m2 ?? d.prix_m2_moyen ?? 0)
      s.medianPriceM2 = Number(d.median_price_m2 ?? 0)
      s.transactionCount = Number(d.transaction_count ?? d.nb_transactions ?? 0)
      s.avgSurface = Number(d.avg_surface ?? d.surface_moyenne ?? 0)
      s.confidenceScore = Number(d.confidence_score ?? d.score_confiance ?? 0)
      s.yearlyGrowthPercent = Number(d.yearly_growth_percent ?? d.croissance_annuelle ?? 0)
      s.predictedPriceNextYear = Number(d.predicted_price_next_year ?? d.prix_prediction_annee_prochaine ?? 0)
      s.modelSlope = Number(d.model_slope ?? 0)
      s.modelIntercept = Number(d.model_intercept ?? 0)
      s.analysisYear = Number(d.analysis_year ?? 0)
      return s
    })
    await this.sectorRepo.save(entities)
    return entities
  }

  getTaskEvents(taskId: number): Observable<MessageEvent> {
    return defer(() => this.taskRepo.findOneBy({ id: taskId })).pipe(
      switchMap(task => {
        if (!task) throw new NotFoundException('Task not found')

        if (task.status === 'completed' || task.status === 'error') {
          return of({
            data: {
              id: task.id,
              status: task.status,
              progress: task.progress,
              message: task.message,
              current_city: task.currentCity,
            },
            type: task.status,
          } as MessageEvent)
        }

        return this.getOrCreateBridge(task)
      }),
    )
  }

  private getOrCreateBridge(task: AnalysisTask): Observable<MessageEvent> {
    const taskId = task.id
    let bridge = this.sseBridges.get(taskId)
    if (bridge) {
      bridge.refCount++
      return this.wrapBridge(bridge, taskId)
    }

    const pythonTaskId = task.pythonTaskId ?? taskId
    const subject = new Subject<MessageEvent>()
    const upstreamSub = this.proxy.connectToTaskSSE(pythonTaskId).subscribe({
      next: msg => {
        const eventType = msg.event === 'complete' || msg.event === 'error' ? msg.event : undefined
        subject.next({ data: msg.data as Record<string, unknown>, type: eventType } as MessageEvent)
        this.updateTaskFromSSE(taskId, msg)
        if (msg.event === 'complete' || msg.event === 'error') {
          subject.complete()
          this.cleanupBridge(taskId)
        }
      },
      error: err => { subject.error(err); this.cleanupBridge(taskId) },
      complete: () => { subject.complete(); this.cleanupBridge(taskId) },
    })

    bridge = { subject, upstreamSub, refCount: 0 }
    this.sseBridges.set(taskId, bridge)
    return this.wrapBridge(bridge, taskId)
  }

  private wrapBridge(bridge: SSEBridge, taskId: number): Observable<MessageEvent> {
    return new Observable<MessageEvent>(subscriber => {
      const sub = bridge.subject.subscribe(subscriber)
      return () => {
        sub.unsubscribe()
        bridge.refCount--
        if (bridge.refCount <= 0) {
          bridge.upstreamSub.unsubscribe()
          this.cleanupBridge(taskId)
        }
      }
    })
  }

  private async updateTaskFromSSE(taskId: number, msg: { event: string; data: Record<string, unknown> }) {
    try {
      if (msg.event === 'progress') {
        await this.taskRepo.update(taskId, {
          progress: Number(msg.data.progress ?? 0),
          currentCity: String(msg.data.current_city ?? ''),
          message: String(msg.data.message ?? ''),
        })
      } else if (msg.event === 'complete' || msg.event === 'error') {
        await this.taskRepo.update(taskId, {
          status: msg.event === 'complete' ? 'completed' : 'error',
          progress: 100,
          completedAt: new Date(),
          message: String(msg.data.message ?? ''),
        })
      }
    } catch {}
  }

  private cleanupBridge(taskId: number) {
    const bridge = this.sseBridges.get(taskId)
    if (bridge) {
      bridge.upstreamSub.unsubscribe()
      this.sseBridges.delete(taskId)
    }
  }
}
