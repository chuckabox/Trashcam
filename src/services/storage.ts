import type { ScanResult, DashboardStats, MaterialCategory, EnhancedStats, WeeklyBucket } from '../types'

const KEY = 'trashcams:scans'

export async function loadScans(): Promise<ScanResult[]> {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    
    // Migrate old scans to new format if needed
    return data.map((s) => {
      if (!s) return null
      if (!s.items && s.info) {
        return {
          ...s,
          items: [s.info],
          detections: [s.detection || { class: 'unknown', confidence: 0, bbox: { x: 0, y: 0, width: 1, height: 1 } }],
        }
      }
      return s as ScanResult
    }).filter(Boolean) as ScanResult[]
  } catch (err) {
    console.error('Failed to load scans:', err)
    return []
  }
}

const MAX_SCANS = 40

export async function saveScan(scan: ScanResult): Promise<void> {
  const existing = await loadScans()
  let next = [scan, ...existing].slice(0, MAX_SCANS)

  // Retry-on-quota: prune oldest until it fits
  while (next.length > 1) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      return
    } catch (err) {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      if (!isQuota) throw err
      next = next.slice(0, Math.max(1, Math.floor(next.length * 0.75)))
    }
  }
  // Last-resort: store just the new scan
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
    const items = s.items || []
    for (const item of items) {
      breakdown[item.material] = (breakdown[item.material] ?? 0) + 1
      co2 += item.co2KgPerItem
      water += item.waterLitresPerItem
      counts.set(item.displayName, (counts.get(item.displayName) ?? 0) + 1)
    }
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

  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const scannedToday = scans.filter((s) => s.timestamp >= todayStart.getTime()).length

    let recyclableCount = 0, landfillCount = 0, compostableCount = 0, hazardousCount = 0
    for (const s of scans) {
      const items = s.items || []
      for (const item of items) {
        if (item.recyclable === 'recyclable') recyclableCount++
        else if (item.recyclable === 'landfill') landfillCount++
        else if (item.recyclable === 'compostable') compostableCount++
        else if (item.recyclable === 'hazardous') hazardousCount++
      }
    }

    const recyclablePercent = scans.length > 0
      ? Math.round((recyclableCount / Math.max(1, scans.reduce((acc, s) => acc + (s.items?.length || 0), 0))) * 100)
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

    const uniqueItemsScanned = new Set(scans.flatMap(s => (s.items || []).map(i => i.displayName))).size

    const seen = new Set<string>()
    let decompositionYearsSaved = 0
    let uniqueCo2KgSaved = 0
    for (const s of scans) {
      const items = s.items || []
      for (const item of items) {
        if (seen.has(item.displayName)) continue
        seen.add(item.displayName)
        decompositionYearsSaved += item.decompositionYears || 0
        uniqueCo2KgSaved += item.co2KgPerItem || 0
      }
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
  } catch (err) {
    console.error('Stats computation failed:', err)
    return {
      ...base,
      scannedToday: 0,
      recyclableCount: 0,
      landfillCount: 0,
      compostableCount: 0,
      hazardousCount: 0,
      recyclablePercent: 0,
      weeklyData: [],
      mostWastedCategory: null,
      mostScannedItem: null,
      reductionPercent: null,
      allScans: scans,
      uniqueItemsScanned: 0,
      decompositionYearsSaved: 0,
      uniqueCo2KgSaved: 0,
    }
  }
}
