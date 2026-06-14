import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Property } from './property.entity'

@Entity('property_messages')
export class PropertyMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'property_id' })
  propertyId!: string

  @Column({ name: 'sender_id' })
  senderId!: string

  @Column({ name: 'sender_name' })
  senderName!: string

  @Column({ name: 'sender_role' })
  senderRole!: string

  @Column({ type: 'text' })
  content!: string

  @Column({ name: 'is_read', default: false })
  isRead!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @ManyToOne(() => Property, prop => prop.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property
}
