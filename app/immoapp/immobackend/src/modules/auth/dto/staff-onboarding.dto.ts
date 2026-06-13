import { IsString, IsEmail, IsOptional } from 'class-validator'

export class StaffOnboardingDto {
  @IsString()
  onboardingToken!: string

  @IsString()
  firstName!: string

  @IsString()
  lastName!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string
}
