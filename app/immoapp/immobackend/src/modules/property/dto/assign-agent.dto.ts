import { IsOptional, IsUUID } from 'class-validator'

export class AssignAgentDto {
  @IsOptional()
  @IsUUID()
  agentId?: string
}
