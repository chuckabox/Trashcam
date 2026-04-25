export type MaterialCategory =
  | 'plastic'
  | 'metal'
  | 'glass'
  | 'paper'
  | 'cardboard'
  | 'organic'
  | 'textile'
  | 'styrofoam'
  | 'electronic'
  | 'hazardous'
  | 'composite';

export type RecyclableClass = 'recyclable' | 'compostable' | 'landfill' | 'hazardous';

export interface DegradationInfo {
  id: string;
  yoloClass: string;
  displayName: string;
  material: MaterialCategory;
  decompositionYears: number;
  co2KgPerItem: number;
  waterLitresPerItem: number;
  toxicity: 'low' | 'medium' | 'high';
  recyclable: RecyclableClass;
  disposalTip: string;
  emoji: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  photoUri?: string;
  detection: Detection;
  ocrText?: string;
  info: DegradationInfo;
}

export interface DashboardStats {
  totalScans: number;
  totalCo2Kg: number;
  totalWaterLitres: number;
  materialBreakdown: Record<MaterialCategory, number>;
  topItems: { name: string; count: number }[];
}

export interface WeeklyBucket {
  day: string;
  count: number;
}

export interface EnhancedStats extends DashboardStats {
  scannedToday: number;
  recyclableCount: number;
  landfillCount: number;
  compostableCount: number;
  hazardousCount: number;
  recyclablePercent: number;
  weeklyData: WeeklyBucket[];
  mostWastedCategory: MaterialCategory | null;
  mostScannedItem: string | null;
  reductionPercent: number | null;
  allScans: ScanResult[];
}
