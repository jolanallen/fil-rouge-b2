import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        const secret = this.configService.get<string>('JWT_SECRET') || 'fallback-secret'
        request.user = jwt.verify(auth.slice(7), secret)
      } catch {}
    }
    return true
  }
}
