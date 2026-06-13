import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm'

@Entity('user_favorites')
@Unique(['userId', 'propertyId'])
export class UserFavorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id' })
  userId!: string

  @Column({ name: 'property_id' })
  propertyId!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
