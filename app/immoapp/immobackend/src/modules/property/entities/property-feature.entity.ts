import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Property } from './property.entity'

@Entity('property_features')
export class PropertyFeature {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  icon!: string

  @ManyToOne(() => Property, prop => prop.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property
}
