import type { ScanResult, MaterialCategory, ScanWithDegradation, DegradationCondition } from '../types'

const USEFUL_LIFE_DAYS: Record<MaterialCategory, number> = {
  organic: 5,
  paper: 14,
  cardboard: 21,
  plastic: 10,
  glass: 60,
  metal: 60,
  styrofoam: 10,
  textile: 90,
  electronic: 180,
  hazardous: 3,
  composite: 14,
}

const RECYCLE_FACTOR: Record<string, number> = {
  recyclable: 0.9,
  compostable: 1.6,
  landfill: 1.3,
  hazardous: 2.5,
}

export function scoreScan(scan: ScanResult): ScanWithDegradation {
  const usefulLife = USEFUL_LIFE_DAYS[scan.info.material] ?? 14
  const factor = RECYCLE_FACTOR[scan.info.recyclable] ?? 1.0
  const daysElapsed = (Date.now() - scan.timestamp) / 86_400_000

  const score = Math.min(100, Math.round((daysElapsed / usefulLife) * factor * 100))
  const remainingDays = Math.max(0, Math.round(usefulLife / factor - daysElapsed))

  const condition: DegradationCondition =
    score <= 25 ? 'fresh' : score <= 60 ? 'mid-life' : score <= 85 ? 'degrading' : 'critical'

  return { scan, score, condition, remainingDays, confidence: scan.detection.confidence }
}

export const CONDITION_LABEL: Record<DegradationCondition, string> = {
  fresh: 'Fresh',
  'mid-life': 'Mid-life',
  degrading: 'Degrading',
  critical: 'Critical',
}

export const CONDITION_COLOR: Record<DegradationCondition, string> = {
  fresh: '#10BC79',
  'mid-life': '#f0c040',
  degrading: '#f97316',
  critical: '#ff4d4d',
}

export const CONDITION_BADGE_VARIANT = {
  fresh: 'success',
  'mid-life': 'warning',
  degrading: 'orange',
  critical: 'danger',
} as const
