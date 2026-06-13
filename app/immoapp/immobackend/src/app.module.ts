import { Module } from '@nestjs/common'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './modules/auth/auth.module'
import { PropertyModule } from './modules/property/property.module'
import { AnalysisModule } from './modules/analysis/analysis.module'
import { ContactModule } from './modules/contact/contact.module'
import { JwtAuthGuard } from './core/guards/jwt-auth.guard'
import { RolesGuard } from './core/guards/roles.guard'
import { HttpExceptionFilter } from './core/filters/http-exception.filter'
import { RedisModule } from './core/redis/redis.module'
import { REDIS_CLIENT } from './core/redis/redis.constants'
import { ThrottlerStorageRedisService } from './core/redis/throttler-storage-redis.service'
import { LoggingInterceptor } from './core/interceptors/logging.interceptor'
import { TransformInterceptor } from './core/interceptors/transform.interceptor'
import appConfig from './core/config/app.config'
import databaseConfig from './core/config/database.config'
import ldapConfig from './core/config/ldap.config'
import googleOauthConfig from './core/config/google-oauth.config'
import redisConfig from './core/config/redis.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, ldapConfig, googleOauthConfig, redisConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [REDIS_CLIENT],
      useFactory: (redis: any) => ({
        throttlers: [{ ttl: 60000, limit: 100 }],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    DatabaseModule,
    AuthModule,
    PropertyModule,
    AnalysisModule,
    ContactModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
