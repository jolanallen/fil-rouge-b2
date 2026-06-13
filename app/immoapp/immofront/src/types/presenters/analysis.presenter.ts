export interface SectorAnalysis {
  id: string
  departmentCode: string
  city: string
  postalCode: string
  transactionCount: number
  avgPrice: number
  avgPricePerM2: number
  medianPrice: number
  minPrice: number
  maxPrice: number
  avgSurface: number
  propertyTypeDistribution: Record<string, number>
  predictedPriceNextYear: number
  predictedPricePerM2NextYear: number
  growthRate: number
  confidenceScore: number
  analyzedAt: string
}

export interface AnalysisTask {
  id: string
  departmentCode: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  message: string
  createdAt: string
  completedAt?: string
}

export interface AnalysisResult {
  task: AnalysisTask
  sectors: SectorAnalysis[]
  departmentSummary: {
    departmentCode: string
    totalTransactions: number
    avgPrice: number
    avgPricePerM2: number
    predictedAvgPriceNextYear: number
    predictedAvgPricePerM2NextYear: number
    overallGrowthRate: number
    topCities: { city: string; growthRate: number }[]
  }
}

export interface AnalysisStatusEvent {
  type: 'connected' | 'progress' | 'completed' | 'failed'
  taskId: string
  progress?: number
  message?: string
}
