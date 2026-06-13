import { IsString, IsIn } from 'class-validator'

export class UpdatePropertyStatusDto {
  @IsIn(['pending', 'estimation', 'mandate', 'available', 'reserved', 'under_offer', 'sold', 'cancelled'])
  status!: 'pending' | 'estimation' | 'mandate' | 'available' | 'reserved' | 'under_offer' | 'sold' | 'cancelled'
}
