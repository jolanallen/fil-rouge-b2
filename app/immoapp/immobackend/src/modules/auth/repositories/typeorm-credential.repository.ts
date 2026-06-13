import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Credential } from '../entities/credential.entity'
import { ICredentialRepository } from './credential-repository.interface'

@Injectable()
export class TypeormCredentialRepository implements ICredentialRepository {
  constructor(
    @InjectRepository(Credential)
    private readonly repo: Repository<Credential>,
  ) {}

  async findByProviderAndId(provider: string, providerId: string): Promise<Credential | null> {
    return this.repo.findOneBy({ provider: provider as any, providerId })
  }

  async findByUserId(userId: string): Promise<Credential[]> {
    return this.repo.findBy({ userId })
  }

  async save(credential: Credential): Promise<Credential> {
    return this.repo.save(credential)
  }
}
