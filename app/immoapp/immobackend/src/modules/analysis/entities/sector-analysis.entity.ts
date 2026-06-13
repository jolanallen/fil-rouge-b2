import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('sector_analyses')
export class SectorAnalysis {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  city!: string

  @Column({ nullable: true })
  sector!: string

  @Column({ length: 3 })
  department!: string

  @Column({ name: 'avg_price_m2', type: 'decimal', precision: 10, scale: 2, nullable: true })
  avgPriceM2!: number

  @Column({ name: 'median_price_m2', type: 'decimal', precision: 10, scale: 2, nullable: true })
  medianPriceM2!: number

  @Column({ name: 'transaction_count', nullable: true })
  transactionCount!: number

  @Column({ name: 'avg_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  avgPrice!: number

  @Column({ name: 'yearly_growth_percent', type: 'decimal', precision: 6, scale: 3, nullable: true })
  yearlyGrowthPercent!: number

  @Column({ name: 'predicted_price_next_year', type: 'decimal', precision: 10, scale: 2, nullable: true })
  predictedPriceNextYear!: number

  @Column({ name: 'model_slope', type: 'double', nullable: true })
  modelSlope!: number

  @Column({ name: 'model_intercept', type: 'double', nullable: true })
  modelIntercept!: number

  @Column({ name: 'analysis_year', nullable: true })
  analysisYear!: number

  @Column({ name: 'confidence_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore!: number

  @Column({ name: 'avg_surface', type: 'decimal', precision: 8, scale: 2, nullable: true })
  avgSurface!: number

  @Column({ name: 'postal_code', length: 10, nullable: true })
  postalCode!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
