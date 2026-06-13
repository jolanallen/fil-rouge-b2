import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('agencies')
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 100 })
  name!: string

  @Column({ length: 10 })
  department!: string

  @Column()
  city!: string

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null
}
