import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { USER_REPOSITORY, IUserRepository } from '../repositories/user-repository.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'fallback-secret',
    })
  }

  async validate(payload: { sub: string; role: string }) {
    const user = await this.userRepo.findById(payload.sub)
    if (!user) throw new UnauthorizedException()
    return { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }
  }
}
