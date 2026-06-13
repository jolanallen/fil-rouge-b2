import { Injectable, Inject } from '@nestjs/common'
import { REDIS_CLIENT } from './redis.constants'
import { Redis } from 'ioredis'
import type { ThrottlerStorage } from '@nestjs/throttler'

interface ThrottlerStorageRecord {
  totalHits: number
  timeToExpire: number
  isBlocked: boolean
  timeToBlockExpire: number
}

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(key: string, ttl: number, limit: number, blockDuration: number, _throttlerName: string): Promise<ThrottlerStorageRecord> {
    const blockKey = `throttle:block:${key}`
    const hitKey = `throttle:hits:${key}`

    // Check if blocked
    const blocked = await this.redis.get(blockKey)
    if (blocked) {
      const ttlBlock = await this.redis.ttl(blockKey)
      return { totalHits: limit + 1, timeToExpire: ttl, isBlocked: true, timeToBlockExpire: Math.max(0, ttlBlock) }
    }

    // Increment hit counter
    const current = await this.redis.incr(hitKey)
    if (current === 1) {
      await this.redis.pexpire(hitKey, ttl * 1000)
    }

    if (current > limit) {
      await this.redis.set(blockKey, '1', 'PX', blockDuration * 1000)
      const blockTtl = await this.redis.ttl(blockKey)
      return { totalHits: current, timeToExpire: await this.redis.pttl(hitKey), isBlocked: true, timeToBlockExpire: Math.max(0, blockTtl) }
    }

    return { totalHits: current, timeToExpire: await this.redis.pttl(hitKey), isBlocked: false, timeToBlockExpire: 0 }
  }
}
