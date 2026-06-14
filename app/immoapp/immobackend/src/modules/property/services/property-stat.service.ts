import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Redis } from 'ioredis'
import { REDIS_CLIENT } from '@/core/redis/redis.constants'

@Injectable()
export class PropertyStatService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async recordView(propertyId: string, ip: string) {
    const today = new Date().toISOString().slice(0, 10)
    const key = `prop:view:${propertyId}:${ip}:${today}`
    const exists = await this.redis.exists(key)
    if (exists) return { recorded: false, reason: 'rate_limited' }

    await this.redis.setex(key, 86400, '1')
    await this.redis.incr(`prop:stats:${propertyId}:views`)
    const count = Number(await this.redis.get(`prop:stats:${propertyId}:views`)) || 0
    return { recorded: true, total: count }
  }

  async recordClick(propertyId: string, ip: string) {
    const today = new Date().toISOString().slice(0, 10)
    const key = `prop:click:${propertyId}:${ip}:${today}`
    const exists = await this.redis.exists(key)
    if (exists) return { recorded: false, reason: 'rate_limited' }

    await this.redis.setex(key, 86400, '1')
    await this.redis.incr(`prop:stats:${propertyId}:clicks`)
    const count = Number(await this.redis.get(`prop:stats:${propertyId}:clicks`)) || 0
    return { recorded: true, total: count }
  }

  async recordFavorite(propertyId: string, ip: string) {
    await this.redis.incr(`prop:stats:${propertyId}:favorites`)
    const count = Number(await this.redis.get(`prop:stats:${propertyId}:favorites`)) || 0
    return { recorded: true, total: count }
  }

  async getStats(propertyId: string) {
    const [views, clicks, favorites] = await Promise.all([
      this.redis.get(`prop:stats:${propertyId}:views`),
      this.redis.get(`prop:stats:${propertyId}:clicks`),
      this.redis.get(`prop:stats:${propertyId}:favorites`),
    ])
    return {
      views: Number(views) || 0,
      clicks: Number(clicks) || 0,
      favorites: Number(favorites) || 0,
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async snapshotDailyStats() {
    const keys = await this.redis.keys('prop:stats:*')
    const today = new Date().toISOString().slice(0, 10)
    let totalViews = 0
    let totalClicks = 0
    let totalFavorites = 0

    for (const key of keys) {
      await this.redis.expire(key, 2592000)
      const val = Number(await this.redis.get(key)) || 0
      if (key.endsWith(':views')) totalViews += val
      else if (key.endsWith(':clicks')) totalClicks += val
      else if (key.endsWith(':favorites')) totalFavorites += val
    }

    await this.redis.hset(`prop:daily:${today}`, {
      views: totalViews,
      clicks: totalClicks,
      favorites: totalFavorites,
    })
    await this.redis.expire(`prop:daily:${today}`, 7776000)
  }
}
