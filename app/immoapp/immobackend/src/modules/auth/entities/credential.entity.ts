import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm'

@Entity('credentials')
@Unique(['provider', 'providerId'])
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id' })
  userId!: string

  @Column({ type: 'enum', enum: ['email', 'google', 'ldap'] })
  provider!: 'email' | 'google' | 'ldap'

  @Column({ name: 'provider_id' })
  providerId!: string

  @Column({ type: 'varchar', nullable: true })
  secret!: string | null

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
