import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('analysis_tasks')
export class AnalysisTask {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 3 })
  department!: string

  @Column({ length: 20, default: 'pending' })
  status!: string

  @Column({ type: 'float', default: 0 })
  progress!: number

  @Column({ name: 'current_city', nullable: true })
  currentCity!: string

  @Column({ type: 'text', nullable: true })
  message!: string

  @Column({ name: 'started_at', nullable: true })
  startedAt!: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt!: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
