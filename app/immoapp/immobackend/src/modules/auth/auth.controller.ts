import { Controller, Post, Get, Put, Body, Query, Req, HttpCode, HttpStatus, Res, Optional, Logger } from '@nestjs/common'
import { AuthService } from './auth.service'
import { StaffAuthService } from './staff-auth.service'
import { GoogleAuthService } from './google-auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshDto } from './dto/refresh.dto'
import { StaffLoginDto } from './dto/staff-login.dto'
import { StaffOnboardingDto } from './dto/staff-onboarding.dto'
import { Public } from '@/core/decorators/public.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'
import { Roles } from '@/core/decorators/roles.decorator'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly staffAuthService: StaffAuthService,
    @Optional() private readonly googleAuthService?: GoogleAuthService,
  ) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto)
  }

  @Get('profile')
  profile(@CurrentUser('id') userId: string) {
    return this.authService.profile(userId)
  }

  @Public()
  @Post('staff/login')
  staffLogin(@Body() dto: StaffLoginDto) {
    return this.staffAuthService.login(dto)
  }

  @Roles('staff')
  @Get('staff/profile')
  staffProfile(@CurrentUser('id') userId: string) {
    return this.staffAuthService.profile(userId)
  }

  @Public()
  @Put('staff/onboarding')
  staffOnboarding(@Body() dto: StaffOnboardingDto) {
    return this.staffAuthService.completeOnboarding(dto)
  }

  @Public()
  @Get('google')
  googleRedirect() {
    if (!this.googleAuthService) {
      return { url: '', message: 'Google OAuth not configured' }
    }
    return { url: this.googleAuthService.getRedirectUrl() }
  }

  @Public()
  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    if (!this.googleAuthService) {
      return res.status(503).json({ message: 'Google OAuth not configured' })
    }
    const result = await this.googleAuthService.handleCallback(code)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
    return res.redirect(`${frontendUrl}/auth/callback?${params}`)
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@CurrentUser('id') userId: string, @Req() req: any) {
    const authHeader = req.headers?.authorization as string | undefined
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    return this.authService.logout(userId, accessToken)
  }
}
