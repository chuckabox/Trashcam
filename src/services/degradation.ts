import data from '../data/degradation.json';
import type { DegradationInfo } from '../types';

const DB = data as DegradationInfo[];
const MAP = new Map<string, DegradationInfo>(DB.map((d) => [d.yoloClass, d]));

export function lookup(yoloClass: string): DegradationInfo {
  return MAP.get(yoloClass) ?? MAP.get('unknown')!;
}

export function allItems(): DegradationInfo[] {
  return DB;
}
