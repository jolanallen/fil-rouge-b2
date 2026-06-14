import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Observable, Subject, Subscription, defer, of, switchMap } from 'rxjs'
import { AnalysisProxyService } from './analysis-proxy.service'
import { SectorAnalysis } from './entities/sector-analysis.entity'
import { AnalysisTask } from './entities/analysis-task.entity'

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
  ) {}

  async start(departmentCode: string, year?: number) {
    const result = await this.proxy.startAnalysis(departmentCode, year)
    return this.taskRepo.findOneBy({ id: result.task_id })
  }

  async getTask(taskId: number) {
    const task = await this.taskRepo.findOneBy({ id: taskId })
    if (!task) throw new NotFoundException('Task not found')
    return task
  }

  async estimatePrice(department: string, surface: number, type: string) {
    return this.proxy.estimatePrice(department, surface, type)
  }

  async getResults(department: string) {
    return department === 'all'
      ? await this.sectorRepo.find()
      : await this.sectorRepo.find({ where: { department } })
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

    const subject = new Subject<MessageEvent>()
    const upstreamSub = this.proxy.connectToTaskSSE(taskId).subscribe({
      next: msg => {
        const eventType = msg.event === 'complete' || msg.event === 'error' ? msg.event : undefined
        subject.next({ data: msg.data as Record<string, unknown>, type: eventType } as MessageEvent)
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

  private cleanupBridge(taskId: number) {
    const bridge = this.sseBridges.get(taskId)
    if (bridge) {
      bridge.upstreamSub.unsubscribe()
      this.sseBridges.delete(taskId)
    }
  }
}
