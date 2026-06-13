import { IsString, IsNumber, IsOptional, Length } from 'class-validator'
import { Type } from 'class-transformer'

export class EstimatePriceDto {
  @IsString()
  @Length(2, 3)
  department!: string

  @Type(() => Number)
  @IsNumber()
  surface!: number

  @IsString()
  type!: string
}
