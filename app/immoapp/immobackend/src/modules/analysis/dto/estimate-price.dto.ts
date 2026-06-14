import { IsString, IsNumber, Length } from 'class-validator'
import { Type } from 'class-transformer'

export class EstimatePriceDto {
  @IsString()
  @Length(5, 5)
  postalCode!: string

  @Type(() => Number)
  @IsNumber()
  surface!: number

  @IsString()
  type!: string
}
