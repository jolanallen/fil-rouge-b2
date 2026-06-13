import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from './entities/user.entity'
import { Credential } from './entities/credential.entity'
import {
  USER_REPOSITORY,
  IUserRepository,
} from './repositories/user-repository.interface'
import {
  CREDENTIAL_REPOSITORY,
  ICredentialRepository,
} from './repositories/credential-repository.interface'
import { LdapStrategy } from './strategies/ldap.strategy'
import { presentUser } from './presenters/user.presenter'
import { StaffLoginDto } from './dto/staff-login.dto'
import { StaffOnboardingDto } from './dto/staff-onboarding.dto'

@Injectable()
export class StaffAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CREDENTIAL_REPOSITORY)
    private readonly credentialRepo: ICredentialRepository,
    private readonly jwtService: JwtService,
    private readonly ldapStrategy: LdapStrategy,
  ) {}

  async login(dto: StaffLoginDto) {
    const ldapUser = await this.ldapStrategy.authenticate(
      dto.username,
      dto.password,
    )
    if (!ldapUser) throw new UnauthorizedException('LDAP authentication failed')

    let credential = await this.credentialRepo.findByProviderAndId(
      'ldap',
      ldapUser.dn,
    )

    if (!credential) {
      const user = new User()
      user.email = ldapUser.email || `${dto.username}@company.com`
      user.firstName = ldapUser.firstName || ''
      user.lastName = ldapUser.lastName || ''
      user.role = 'staff'
      const savedUser = await this.userRepo.save(user)

      credential = new Credential()
      credential.userId = savedUser.id
      credential.provider = 'ldap'
      credential.providerId = ldapUser.dn
      credential = await this.credentialRepo.save(credential)
    }

    const user = await this.userRepo.findById(credential.userId)
    if (!user) throw new UnauthorizedException('User not found')

    const needsOnboarding = !user.firstName || !user.lastName || !user.email
    const tokens = await this.generateTokens(user, credential)

    return {
      user: presentUser(user),
      ...tokens,
      needsOnboarding,
      onboardingToken: needsOnboarding
        ? this.jwtService.sign({ sub: user.id }, { expiresIn: '1h' })
        : undefined,
    }
  }

  async completeOnboarding(dto: StaffOnboardingDto) {
    let payload: { sub: string }
    try {
      payload = this.jwtService.verify<{ sub: string }>(dto.onboardingToken)
    } catch {
      throw new UnauthorizedException('Invalid or expired onboarding token')
    }

    const user = await this.userRepo.findById(payload.sub)
    if (!user || user.role !== 'staff') {
      throw new NotFoundException('Staff not found')
    }

    user.firstName = dto.firstName
    user.lastName = dto.lastName
    user.email = dto.email
    user.phone = dto.phone ?? ''
    await this.userRepo.save(user)

    return presentUser(user)
  }

  async profile(userId: string) {
    const user = await this.userRepo.findById(userId)
    if (!user || user.role !== 'staff') {
      throw new NotFoundException('Staff not found')
    }
    return presentUser(user)
  }

  private async generateTokens(user: User, credential: Credential) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

    credential.refreshToken = refreshToken
    await this.credentialRepo.save(credential)

    return { accessToken, refreshToken }
  }
}
