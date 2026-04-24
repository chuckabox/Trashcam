import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanResult, DashboardStats, MaterialCategory } from '../types';

const KEY = '@trashlife:scans';

export async function loadScans(): Promise<ScanResult[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ScanResult[];
  } catch {
    return [];
  }
}

export async function saveScan(scan: ScanResult): Promise<void> {
  const existing = await loadScans();
  const next = [scan, ...existing].slice(0, 500);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearScans(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
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
  };

  const counts = new Map<string, number>();
  let co2 = 0;
  let water = 0;

  for (const s of scans) {
    breakdown[s.info.material] = (breakdown[s.info.material] ?? 0) + 1;
    co2 += s.info.co2KgPerItem;
    water += s.info.waterLitersPerItem;
    counts.set(s.info.displayName, (counts.get(s.info.displayName) ?? 0) + 1);
  }

  const topItems = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalScans: scans.length,
    totalCo2Kg: co2,
    totalWaterLiters: water,
    materialBreakdown: breakdown,
    topItems,
  };
}
