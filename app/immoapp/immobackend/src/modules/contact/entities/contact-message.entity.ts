import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm'

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column()
  email!: string

  @Column()
  subject!: string

  @Column({ type: 'text' })
  message!: string

  @Column({ name: 'property_id', type: 'varchar', nullable: true })
  propertyId!: string | null

  @Column({ name: 'is_read', default: false })
  isRead!: boolean

  
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @DeleteDateColumn({name: "closed_at"})
  closed_at!: Date
}
