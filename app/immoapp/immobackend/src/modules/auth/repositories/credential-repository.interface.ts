import { Credential } from '../entities/credential.entity'

export const CREDENTIAL_REPOSITORY = 'CREDENTIAL_REPOSITORY'

export interface ICredentialRepository {
  findByProviderAndId(provider: string, providerId: string): Promise<Credential | null>
  findByUserId(userId: string): Promise<Credential[]>
  save(credential: Credential): Promise<Credential>
}
