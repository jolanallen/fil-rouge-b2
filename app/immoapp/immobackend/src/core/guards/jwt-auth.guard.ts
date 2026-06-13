import { Injectable, ExecutionContext, UnauthorizedException, Optional } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator'
import { TokenBlacklistService } from '../redis/token-blacklist.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Optional() private readonly tokenBlacklist?: TokenBlacklistService,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const isOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isOptional) return true

    // Check token blacklist
    if (this.tokenBlacklist) {
      const request = context.switchToHttp().getRequest()
      const authHeader = request.headers?.authorization as string | undefined
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const blacklisted = await this.tokenBlacklist.isBlacklisted(token)
        if (blacklisted) {
          throw new UnauthorizedException('Token has been revoked')
        }
      }
    }

    return (super.canActivate(context) as Promise<boolean>)
  }
}
