import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { PropertyImage } from './property-image.entity'
import { PropertyFeature } from './property-feature.entity'
import { PropertyPriceHistory } from './property-price-history.entity'
import { PropertyMessage } from './property-message.entity'
import { PropertyHistory } from './property-history.entity'

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  surface!: number

  @Column()
  rooms!: number

  @Column({ type: 'enum', enum: ['appartement', 'maison', 'local-commercial', 'terrain'] })
  type!: 'appartement' | 'maison' | 'local-commercial' | 'terrain'

  @Column()
  address!: string

  @Column()
  city!: string

  @Column({ name: 'postal_code' })
  postalCode!: string

  @Column({ length: 10 })
  department!: string

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null

  @Column({ type: 'varchar', nullable: true, length: 1 })
  dpe!: string | null

  @Column({ name: 'price_per_m2', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerM2!: number | null

  @Column({ default: false })
  visible!: boolean

  @Column({ type: 'enum', enum: ['draft', 'pending', 'estimation', 'mandate', 'available', 'reserved', 'under_offer', 'sold', 'cancelled'], default: 'draft' })
  status!: 'draft' | 'pending' | 'estimation' | 'mandate' | 'available' | 'reserved' | 'under_offer' | 'sold' | 'cancelled'

  @Column()
  agency!: string

  @Column({ name: 'owner_id', type: 'varchar', nullable: true })
  ownerId!: string | null

  @Column({ name: 'staff_id', type: 'varchar', nullable: true })
  staffId!: string | null

  @OneToMany(() => PropertyImage, img => img.property, { cascade: true })
  images!: PropertyImage[]

  @OneToMany(() => PropertyFeature, feat => feat.property, { cascade: true })
  features!: PropertyFeature[]

  @OneToMany(() => PropertyPriceHistory, ph => ph.property, { cascade: true })
  priceHistory!: PropertyPriceHistory[]

  @OneToMany(() => PropertyMessage, msg => msg.property, { cascade: true })
  messages!: PropertyMessage[]

  @OneToMany(() => PropertyHistory, evt => evt.property, { cascade: true })
  history!: PropertyHistory[]

  isFavorite?: boolean
  staffName?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
