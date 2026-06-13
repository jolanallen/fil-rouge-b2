import { IsString, IsNumber, IsIn, IsOptional, Min, IsArray } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePropertyDto {
  @IsString()
  title!: string

  @IsString()
  description!: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  surface!: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rooms!: number

  @IsIn(['appartement', 'maison', 'local-commercial', 'terrain'])
  type!: 'appartement' | 'maison' | 'local-commercial' | 'terrain'

  @IsString()
  address!: string

  @IsString()
  city!: string

  @IsString()
  postalCode!: string

  @IsString()
  department!: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @IsOptional()
  @IsString()
  agency?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]

  @IsOptional()
  @IsString()
  energyClass?: string
}
