import { Controller, Post, Get, Param, Req } from '@nestjs/common'
import { PropertyStatService } from '../services/property-stat.service'
import { Public } from '@/core/decorators/public.decorator'
import { Request } from 'express'

@Controller('properties')
export class PropertyStatController {
  constructor(private readonly statService: PropertyStatService) {}

  @Public()
  @Post(':id/view')
  recordView(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0'
    return this.statService.recordView(id, ip)
  }

  @Public()
  @Post(':id/click')
  recordClick(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0'
    return this.statService.recordClick(id, ip)
  }

  @Public()
  @Post(':id/favorite')
  recordFavorite(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0'
    return this.statService.recordFavorite(id, ip)
  }

  @Public()
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.statService.getStats(id)
  }
}
