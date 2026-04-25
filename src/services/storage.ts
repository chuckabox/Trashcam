import type { ScanResult, DashboardStats, MaterialCategory, EnhancedStats, WeeklyBucket } from '../types'

const KEY = 'trashcams:scans'

export async function loadScans(): Promise<ScanResult[]> {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as ScanResult[]
  } catch {
    return []
  }
}

export async function saveScan(scan: ScanResult): Promise<void> {
  const existing = await loadScans()
  const next = [scan, ...existing].slice(0, 500)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export async function clearScans(): Promise<void> {
  localStorage.removeItem(KEY)
}

export function computeStats(scans: ScanResult[]): DashboardStats {
  const breakdown: Record<MaterialCategory, number> = {
    plastic: 0,
    metal: 0,
    glass: 0,
    paper: 0,
    cardboard: 0,
    organic: 0,
    textile: 0,
    styrofoam: 0,
    electronic: 0,
    hazardous: 0,
    composite: 0,
  }

  const counts = new Map<string, number>()
  let co2 = 0
  let water = 0

  for (const s of scans) {
    breakdown[s.info.material] = (breakdown[s.info.material] ?? 0) + 1
    co2 += s.info.co2KgPerItem
    water += s.info.waterLitresPerItem
    counts.set(s.info.displayName, (counts.get(s.info.displayName) ?? 0) + 1)
  }

  const topItems = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    totalScans: scans.length,
    totalCo2Kg: co2,
    totalWaterLitres: water,
    materialBreakdown: breakdown,
    topItems,
  }
}

export function computeEnhancedStats(scans: ScanResult[]): EnhancedStats {
  const base = computeStats(scans)
  const now = Date.now()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const scannedToday = scans.filter((s) => s.timestamp >= todayStart.getTime()).length

  let recyclableCount = 0, landfillCount = 0, compostableCount = 0, hazardousCount = 0
  for (const s of scans) {
    if (s.info.recyclable === 'recyclable') recyclableCount++
    else if (s.info.recyclable === 'landfill') landfillCount++
    else if (s.info.recyclable === 'compostable') compostableCount++
    else if (s.info.recyclable === 'hazardous') hazardousCount++
  }

  const recyclablePercent = scans.length > 0
    ? Math.round((recyclableCount / scans.length) * 100)
    : 0

  const weeklyData: WeeklyBucket[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      count: scans.filter((s) => s.timestamp >= d.getTime() && s.timestamp < next.getTime()).length,
    }
  })

  const thisWeekCount = scans.filter((s) => s.timestamp >= now - 7 * 86_400_000).length
  const prevWeekCount = scans.filter(
    (s) => s.timestamp >= now - 14 * 86_400_000 && s.timestamp < now - 7 * 86_400_000,
  ).length
  const reductionPercent = prevWeekCount > 0
    ? Math.round(((prevWeekCount - thisWeekCount) / prevWeekCount) * 100)
    : null

  const mostWastedCategory = (
    Object.entries(base.materialBreakdown) as [MaterialCategory, number][]
  )
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const mostScannedItem = base.topItems[0]?.name ?? null

  const uniqueItemsScanned = new Set(scans.map((s) => s.info.displayName)).size

  const seen = new Set<string>()
  let decompositionYearsSaved = 0
  let uniqueCo2KgSaved = 0
  for (const s of scans) {
    if (seen.has(s.info.displayName)) continue
    seen.add(s.info.displayName)
    decompositionYearsSaved += s.info.decompositionYears
    uniqueCo2KgSaved += s.info.co2KgPerItem
  }

  return {
    ...base,
    scannedToday,
    recyclableCount,
    landfillCount,
    compostableCount,
    hazardousCount,
    recyclablePercent,
    weeklyData,
    mostWastedCategory,
    mostScannedItem,
    reductionPercent,
    allScans: scans,
    uniqueItemsScanned,
    decompositionYearsSaved,
    uniqueCo2KgSaved,
  }
}
