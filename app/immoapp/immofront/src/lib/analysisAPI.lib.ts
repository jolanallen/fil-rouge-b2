import { apiGet, apiPost } from './api.lib'
import type { StartAnalysisDTO } from '@/types/dtos/analysis.dto'
import type { AnalysisTask, AnalysisResult, SectorAnalysis } from '@/types/presenters/analysis.presenter'

const MOCK_SECTORS: SectorAnalysis[] = [
  {
    id: 'sector-1',
    departmentCode: '13',
    city: 'Aix-en-Provence',
    postalCode: '13100',
    transactionCount: 1247,
    avgPrice: 485000,
    avgPricePerM2: 4235,
    medianPrice: 398000,
    minPrice: 85000,
    maxPrice: 3200000,
    avgSurface: 89,
    propertyTypeDistribution: { 'appartement': 62, 'maison': 31, 'local-commercial': 5, 'terrain': 2 },
    predictedPriceNextYear: 512000,
    predictedPricePerM2NextYear: 4420,
    growthRate: 5.6,
    confidenceScore: 0.87,
    analyzedAt: '2025-05-15T10:00:00Z'
  },
  {
    id: 'sector-2',
    departmentCode: '13',
    city: 'Marseille',
    postalCode: '13001',
    transactionCount: 3452,
    avgPrice: 325000,
    avgPricePerM2: 3650,
    medianPrice: 275000,
    minPrice: 55000,
    maxPrice: 2100000,
    avgSurface: 72,
    propertyTypeDistribution: { 'appartement': 75, 'maison': 18, 'local-commercial': 5, 'terrain': 2 },
    predictedPriceNextYear: 345000,
    predictedPricePerM2NextYear: 3820,
    growthRate: 6.2,
    confidenceScore: 0.91,
    analyzedAt: '2025-05-15T10:00:00Z'
  },
  {
    id: 'sector-3',
    departmentCode: '75',
    city: 'Paris',
    postalCode: '75016',
    transactionCount: 5231,
    avgPrice: 920000,
    avgPricePerM2: 10250,
    medianPrice: 780000,
    minPrice: 180000,
    maxPrice: 8500000,
    avgSurface: 68,
    propertyTypeDistribution: { 'appartement': 88, 'maison': 2, 'local-commercial': 9, 'terrain': 1 },
    predictedPriceNextYear: 955000,
    predictedPricePerM2NextYear: 10600,
    growthRate: 3.8,
    confidenceScore: 0.93,
    analyzedAt: '2025-05-15T10:30:00Z'
  },
  {
    id: 'sector-4',
    departmentCode: '06',
    city: 'Nice',
    postalCode: '06000',
    transactionCount: 2890,
    avgPrice: 450000,
    avgPricePerM2: 5200,
    medianPrice: 365000,
    minPrice: 95000,
    maxPrice: 4100000,
    avgSurface: 65,
    propertyTypeDistribution: { 'appartement': 72, 'maison': 20, 'local-commercial': 6, 'terrain': 2 },
    predictedPriceNextYear: 472000,
    predictedPricePerM2NextYear: 5400,
    growthRate: 4.9,
    confidenceScore: 0.85,
    analyzedAt: '2025-05-15T11:00:00Z'
  },
  {
    id: 'sector-5',
    departmentCode: '33',
    city: 'Bordeaux',
    postalCode: '33000',
    transactionCount: 2150,
    avgPrice: 380000,
    avgPricePerM2: 4800,
    medianPrice: 320000,
    minPrice: 75000,
    maxPrice: 2800000,
    avgSurface: 70,
    propertyTypeDistribution: { 'appartement': 68, 'maison': 25, 'local-commercial': 5, 'terrain': 2 },
    predictedPriceNextYear: 405000,
    predictedPricePerM2NextYear: 5100,
    growthRate: 6.6,
    confidenceScore: 0.88,
    analyzedAt: '2025-05-15T11:30:00Z'
  }
]

export async function startAnalysis(data: StartAnalysisDTO): Promise<AnalysisTask> {
  try {
    return await apiPost<AnalysisTask>('/analysis/start', data)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return {
      id: String(Date.now()),
      departmentCode: data.departmentCode,
      status: 'completed',
      progress: 100,
      message: 'Analyse terminée avec succès',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  }
}

export async function getAnalysisTask(taskId: string): Promise<AnalysisTask> {
  try {
    return await apiGet<AnalysisTask>(`/analysis/task/${taskId}`)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    return {
      id: taskId,
      departmentCode: '13',
      status: 'completed',
      progress: 100,
      message: 'Analyse terminée',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  }
}

function toSector(raw: any): SectorAnalysis {
  const departmentCode = raw.department ?? raw.departmentCode ?? raw.departement ?? ''
  const city = raw.city ?? raw.commune ?? ''
  const growthRateRaw = Number(raw.growthRate ?? raw.yearlyGrowthPercent ?? raw.yearly_growth_percent ?? raw.croissance_annuelle ?? 0)
  const growthRate = growthRateRaw > 100 ? Math.min(growthRateRaw, 100) : growthRateRaw

  return {
    id: String(raw.id ?? `${departmentCode}-${city}-${Date.now()}`),
    departmentCode,
    city,
    postalCode: raw.postalCode ?? raw.postal_code ?? raw.code_postal ?? '',
    transactionCount: Number(raw.transactionCount ?? raw.transaction_count ?? raw.nb_transactions ?? 0),
    avgPrice: Number(raw.avgPrice ?? raw.avg_price ?? raw.prix_moyen ?? 0),
    avgPricePerM2: Number(raw.avgPricePerM2 ?? raw.avgPriceM2 ?? raw.avg_price_m2 ?? raw.prix_m2_moyen ?? 0),
    medianPrice: Number(raw.medianPrice ?? raw.medianPriceM2 ?? raw.median_price_m2 ?? 0),
    minPrice: Number(raw.minPrice ?? raw.min_price ?? 0),
    maxPrice: Number(raw.maxPrice ?? raw.max_price ?? 0),
    avgSurface: Number(raw.avgSurface ?? raw.avg_surface ?? raw.surface_moyenne ?? 0),
    propertyTypeDistribution: raw.propertyTypeDistribution ?? raw.property_type_distribution ?? {},
    predictedPriceNextYear: Number(raw.predictedPriceNextYear ?? raw.predicted_price_next_year ?? raw.prix_prediction_annee_prochaine ?? 0),
    predictedPricePerM2NextYear: Number(raw.predictedPricePerM2NextYear ?? raw.predicted_price_per_m2_next_year ?? 0),
    growthRate,
    confidenceScore: Number(raw.confidenceScore ?? raw.confidence_score ?? raw.score_confiance ?? 0),
    analyzedAt: raw.analyzedAt ?? raw.analyzed_at ?? new Date().toISOString(),
  }
}

function buildResult(department: string, sectors: SectorAnalysis[]): AnalysisResult {
  const cityMap = new Map<string, SectorAnalysis>()
  for (const s of sectors) {
    const key = s.city.toLowerCase().trim()
    if (!cityMap.has(key) || s.transactionCount > cityMap.get(key)!.transactionCount) {
      cityMap.set(key, s)
    }
  }
  const uniqueSectors = Array.from(cityMap.values()).sort((a, b) => b.transactionCount - a.transactionCount)
  const len = uniqueSectors.length || 1
  const avgPrice = Math.round(uniqueSectors.reduce((a, s) => a + s.avgPrice, 0) / len)
  const avgPm2 = Math.round(uniqueSectors.reduce((a, s) => a + s.avgPricePerM2, 0) / len)
  const avgPredicted = Math.round(uniqueSectors.reduce((a, s) => a + s.predictedPriceNextYear, 0) / len)
  const avgPredictedPm2 = Math.round(uniqueSectors.reduce((a, s) => a + s.predictedPricePerM2NextYear, 0) / len)
  return {
    task: {
      id: 'task-' + department,
      departmentCode: department,
      status: 'completed',
      progress: 100,
      message: 'Analyse terminée',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    },
    sectors: uniqueSectors,
    departmentSummary: {
      departmentCode: department,
      totalTransactions: uniqueSectors.reduce((a, s) => a + s.transactionCount, 0),
      avgPrice,
      avgPricePerM2: avgPm2,
      predictedAvgPriceNextYear: avgPredicted,
      predictedAvgPricePerM2NextYear: avgPredictedPm2,
      overallGrowthRate: parseFloat((uniqueSectors.reduce((a, s) => a + s.growthRate, 0) / len).toFixed(1)),
      topCities: uniqueSectors.map(s => ({ city: s.city, growthRate: s.growthRate })).sort((a, b) => b.growthRate - a.growthRate).slice(0, 10)
    }
  }
}

export async function getAnalysisResults(department: string): Promise<AnalysisResult> {
  try {
    const raw = await apiGet<any[]>(`/analysis/results/${department}`)
    const sectors = (Array.isArray(raw) ? raw : []).map(toSector)
    return buildResult(department, sectors)
  } catch (e: any) {
    if (e?.message !== 'MOCK_NEEDS_HANDLER') throw e
    const sectors = MOCK_SECTORS.filter(s => s.departmentCode === department || department === 'all')
    return buildResult(department, sectors)
  }
}
