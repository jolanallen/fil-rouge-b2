import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Property } from './property.entity'

@Entity('property_price_history')
export class PropertyPriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'property_id' })
  propertyId!: string

  @Column({ type: 'date' })
  date!: string

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number

  @Column({ name: 'price_per_m2', type: 'decimal', precision: 10, scale: 2 })
  pricePerM2!: number

  @ManyToOne(() => Property, prop => prop.priceHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property
}
