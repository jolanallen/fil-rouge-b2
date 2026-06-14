import { Injectable, Inject } from '@nestjs/common'
import { REDIS_CLIENT } from './redis.constants'
import { Redis } from 'ioredis'
import * as crypto from 'crypto'

@Injectable()
export class TokenBlacklistService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private tokenKey(token: string): string {
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    return `blacklist:token:${hash}`
  }

  async blacklist(token: string, ttlSeconds: number = 900): Promise<void> {
    await this.redis.set(this.tokenKey(token), '1', 'EX', ttlSeconds)
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(this.tokenKey(token))
    return result === '1'
  }
}
