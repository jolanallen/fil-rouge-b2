import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Property } from './property.entity'

@Entity('property_history')
export class PropertyHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'property_id' })
  propertyId!: string

  @Column({ length: 50 })
  type!: string

  @Column({ type: 'text' })
  description!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @ManyToOne(() => Property, prop => prop.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property
}
