import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'
import { TokenBlacklistService } from './token-blacklist.service'
import { REDIS_CLIENT } from './redis.constants'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => {
        const { host, port } = config.get<{ host: string; port: number }>('redis')!
        return new Redis({ host, port })
      },
      inject: [ConfigService],
    },
    TokenBlacklistService,
  ],
  exports: [REDIS_CLIENT, TokenBlacklistService],
})
export class RedisModule {}
