import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalysisController } from './analysis.controller'
import { AnalysisService } from './analysis.service'
import { AnalysisProxyService } from './analysis-proxy.service'
import { SectorAnalysis } from './entities/sector-analysis.entity'
import { AnalysisTask } from './entities/analysis-task.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SectorAnalysis, AnalysisTask])],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisProxyService],
})
export class AnalysisModule {}
