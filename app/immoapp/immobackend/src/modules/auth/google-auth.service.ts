import { Injectable, Inject, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  USER_REPOSITORY,
  IUserRepository,
} from './repositories/user-repository.interface'
import {
  CREDENTIAL_REPOSITORY,
  ICredentialRepository,
} from './repositories/credential-repository.interface'
import { ConfigService } from '@nestjs/config'
import { User } from './entities/user.entity'
import { Credential } from './entities/credential.entity'
import { presentUser } from './presenters/user.presenter'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
}

interface GoogleUserInfo {
  sub: string
  email: string
  given_name: string
  family_name: string
  picture: string
}

@Injectable()
export class GoogleAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CREDENTIAL_REPOSITORY)
    private readonly credentialRepo: ICredentialRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async getRedirectUrl(): Promise<string> {
    const clientId = this.config.get<string>('googleOauth.clientId')
    const redirectUri = this.config.get<string>('googleOauth.callbackUrl')
    if (!clientId) return ''
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri || '',
      response_type: 'code',
      scope: 'email profile',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  async handleCallback(code: string) {
    const clientId = this.config.get<string>('googleOauth.clientId')
    const clientSecret = this.config.get<string>('googleOauth.clientSecret')
    const redirectUri = this.config.get<string>('googleOauth.callbackUrl')

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google OAuth not configured')
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Failed to exchange Google code')
    }

    const tokenData: GoogleTokenResponse = await tokenRes.json()

    // Get user info from Google
    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    )

    if (!userInfoRes.ok) {
      throw new UnauthorizedException('Failed to get Google user info')
    }

    const googleUser: GoogleUserInfo = await userInfoRes.json()

    // Find or create credential
    let credential = await this.credentialRepo.findByProviderAndId(
      'google',
      googleUser.sub,
    )

    if (credential) {
      // Existing credential — fetch user
      const user = await this.userRepo.findById(credential.userId)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      const tokens = await this.generateTokens(user, credential)
      return { user: presentUser(user), ...tokens }
    }

    // Check if a user with this email already exists
    let user = await this.userRepo.findByEmail(googleUser.email)

    if (!user) {
      // Create new user
      user = new User()
      user.email = googleUser.email
      user.firstName = googleUser.given_name || googleUser.email.split('@')[0]
      user.lastName = googleUser.family_name || 'Google User'
      user.phone = ''
      user.role = 'client'
      user.avatar = googleUser.picture || ''
      user = await this.userRepo.save(user)
    }

    // Create credential for this Google account
    credential = new Credential()
    credential.userId = user.id
    credential.provider = 'google'
    credential.providerId = googleUser.sub
    credential.secret = null
    credential = await this.credentialRepo.save(credential)

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
