import { Controller, Post, Get, Param, Body, Query, Sse } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { AnalysisService } from './analysis.service'
import { StartAnalysisDto } from './dto/start-analysis.dto'
import { EstimatePriceDto } from './dto/estimate-price.dto'
import { Public } from '@/core/decorators/public.decorator'
import { Observable } from 'rxjs'

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('start')
  start(@Body() dto: StartAnalysisDto) {
    return this.analysisService.start(dto.departmentCode, dto.year)
  }

  @SkipThrottle()
  @Public()
  @Get('task/:id')
  getTask(@Param('id') id: string) {
    return this.analysisService.getTask(parseInt(id, 10))
  }

  @SkipThrottle()
  @Public()
  @Sse('task/:id/events')
  taskEvents(@Param('id') id: string): Observable<MessageEvent> {
    return this.analysisService.getTaskEvents(parseInt(id, 10))
  }

  @SkipThrottle()
  @Public()
  @Get('estimate')
  estimate(@Query() dto: EstimatePriceDto) {
    return this.analysisService.estimatePrice(dto.postalCode, dto.surface, dto.type)
  }

  @SkipThrottle()
  @Public()
  @Get('results/:department')
  getResults(@Param('department') department: string) {
    return this.analysisService.getResults(department)
  }
}
