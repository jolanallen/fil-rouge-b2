import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { StaffAuthService } from './staff-auth.service'
import { GoogleAuthService } from './google-auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LdapStrategy } from './strategies/ldap.strategy'
import { User } from './entities/user.entity'
import { Credential } from './entities/credential.entity'
import { UserFavorite } from './entities/user-favorite.entity'
import { FavoriteService } from './favorite.service'
import { TypeormUserRepository } from './repositories/typeorm-user.repository'
import { USER_REPOSITORY } from './repositories/user-repository.interface'
import { TypeormCredentialRepository } from './repositories/typeorm-credential.repository'
import { CREDENTIAL_REPOSITORY } from './repositories/credential-repository.interface'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credential, UserFavorite]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') || 'fallback-secret'
        return { secret, signOptions: { expiresIn: '15m' as const } }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    StaffAuthService,
    {
      provide: GoogleAuthService,
      useFactory: (userRepo: any, credentialRepo: any, jwtService: any, config: ConfigService) => {
        const clientId = config.get<string>('googleOauth.clientId')
        if (!clientId) return null
        return new GoogleAuthService(userRepo, credentialRepo, jwtService, config)
      },
      inject: [USER_REPOSITORY, CREDENTIAL_REPOSITORY, JwtService, ConfigService],
    },
    JwtStrategy,
    LdapStrategy,
    FavoriteService,
    { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
    { provide: CREDENTIAL_REPOSITORY, useClass: TypeormCredentialRepository },
  ],
  exports: [JwtModule, FavoriteService, USER_REPOSITORY, CREDENTIAL_REPOSITORY],
})
export class AuthModule {}
