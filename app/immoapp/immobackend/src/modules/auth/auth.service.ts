import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
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
import { presentUser } from './presenters/user.presenter'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshDto } from './dto/refresh.dto'
import { TokenBlacklistService } from '@/core/redis/token-blacklist.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CREDENTIAL_REPOSITORY)
    private readonly credentialRepo: ICredentialRepository,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {}

  async register(dto: RegisterDto) {
    const [existingCredential, existingUser] = await Promise.all([
      this.credentialRepo.findByProviderAndId('email', dto.email),
      this.userRepo.findByEmail(dto.email),
    ])
    if (existingCredential || existingUser) {
      throw new ConflictException('Email already registered')
    }

    const user = new User()
    user.email = dto.email
    user.firstName = dto.firstName
    user.lastName = dto.lastName
    user.phone = dto.phone ?? ''
    user.role = 'client'
    const savedUser = await this.userRepo.save(user)

    const hashedPassword = await bcrypt.hash(dto.password, 12)
    const credential = new Credential()
    credential.userId = savedUser.id
    credential.provider = 'email'
    credential.providerId = dto.email
    credential.secret = hashedPassword
    const savedCredential = await this.credentialRepo.save(credential)

    const tokens = await this.generateTokens(savedUser, savedCredential)

    return { user: presentUser(savedUser), ...tokens }
  }

  async login(dto: LoginDto) {
    const credential =
      await this.credentialRepo.findByProviderAndId('email', dto.email)
    if (!credential || !credential.secret) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const valid = await bcrypt.compare(dto.password, credential.secret)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const user = await this.userRepo.findById(credential.userId)
    if (!user || user.role !== 'client') {
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = await this.generateTokens(user, credential)
    return { user: presentUser(user), ...tokens }
  }

  async profile(userId: string) {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    return presentUser(user)
  }

  async logout(userId: string, accessToken?: string) {
    const credentials = await this.credentialRepo.findByUserId(userId)
    for (const c of credentials) {
      c.refreshToken = null
      await this.credentialRepo.save(c)
    }
    if (accessToken) {
      try {
        const payload = this.jwtService.decode(accessToken) as { exp?: number }
        const ttl = payload?.exp ? Math.max(60, payload.exp - Math.floor(Date.now() / 1000)) : 900
        await this.tokenBlacklist.blacklist(accessToken, ttl)
      } catch {
        // ignore decode errors
      }
    }
    return { message: 'Logged out' }
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string }
    try {
      payload = this.jwtService.verify<{ sub: string }>(dto.refreshToken)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const credentials = await this.credentialRepo.findByUserId(payload.sub)
    const credential = credentials.find((c) => c.refreshToken === dto.refreshToken)
    if (!credential) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const user = await this.userRepo.findById(payload.sub)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const tokens = await this.generateTokens(user, credential)
    return { user: presentUser(user), ...tokens }
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
