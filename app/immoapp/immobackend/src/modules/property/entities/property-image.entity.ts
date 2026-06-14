import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Property } from './property.entity'

@Entity('property_images')
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'property_id' })
  propertyId!: string

  @Column()
  url!: string

  @Column()
  alt!: string

  @Column({ name: 'is_primary', default: false })
  isPrimary!: boolean

  @ManyToOne(() => Property, prop => prop.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property
}
