import { IsOptional, IsString, IsNumber, IsIn, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class PropertySearchDto {
  @IsOptional()
  @IsString()
  query?: string

  @IsOptional()
  @IsIn(['appartement', 'maison', 'local-commercial', 'terrain'])
  type?: 'appartement' | 'maison' | 'local-commercial' | 'terrain'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSurface?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSurface?: number

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rooms?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number

  @IsOptional()
  @IsIn(['price', 'surface', 'date', 'price_per_m2'])
  sortBy?: 'price' | 'surface' | 'date' | 'price_per_m2'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'
}
