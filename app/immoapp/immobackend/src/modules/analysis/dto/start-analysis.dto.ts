import { IsString, IsOptional, IsNumber, Length } from 'class-validator'

export class StartAnalysisDto {
  @IsString()
  @Length(2, 2)
  departmentCode!: string

  @IsOptional()
  @IsNumber()
  year?: number
}
