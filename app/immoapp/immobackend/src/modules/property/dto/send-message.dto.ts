import { IsString, IsOptional } from 'class-validator'

export class SendMessageDto {
  @IsString()
  content!: string

  @IsOptional()
  @IsString()
  senderName?: string
}
