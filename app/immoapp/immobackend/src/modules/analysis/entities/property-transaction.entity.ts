import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('property_transactions')
export class PropertyTransaction {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'mutation_date', nullable: true })
  mutationDate!: Date

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price!: number

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  surface!: number

  @Column({ name: 'price_per_m2', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerM2!: number

  @Column({ name: 'property_type', length: 50, nullable: true })
  propertyType!: string

  @Column({ length: 100, nullable: true })
  city!: string

  @Column({ name: 'postal_code', length: 10, nullable: true })
  postalCode!: string

  @Column({ length: 3, nullable: true })
  department!: string

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
