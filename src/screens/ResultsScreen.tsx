import { useLocation, useNavigate } from 'react-router-dom'
import type { ScanResult } from '../types'

import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Hint } from '../components/Hint'
import { cn } from '../lib/utils'

const TOX_TEXT = {
  low: 'Safe to handle. No significant toxic risk to nature if sorted properly.',
  medium: 'Contains chemicals or dyes. Handle carefully and keep away from waterways.',
  high: 'Contains hazardous parts. Can be harmful to humans and the environment if leaked.',
} as const

const REC_TEXT = {
  recyclable: 'Fully recyclable. This can be processed into new raw materials for manufacturing.',
  compostable: '100% organic. This will naturally break down into nutrient-rich soil.',
  landfill: 'Destined for landfill. This is made of mixed materials that are hard to recover.',
  hazardous: 'Special disposal required. Contains dangerous parts that cannot go in normal bins.',
} as const

export default function ResultsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const scan = location.state?.scan as ScanResult | undefined

  if (!scan) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No scan data</p>
        <Button variant="outline" onClick={() => navigate('/')}>Go to Scanner</Button>
      </div>
    )
  }

  const { items, photoUri } = scan
  const totalCo2 = items.reduce((sum, i) => sum + i.info.co2KgPerItem, 0)
  const totalWater = items.reduce((sum, i) => sum + i.info.waterLitresPerItem, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-6 space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back
        </button>

        {/* Photo Header */}
        {photoUri && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-scale-in">
            <div className="relative h-48 w-full">
              <img src={photoUri} alt="Scan" className="h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" label={`${items.length} items detected`} />
              </div>
            </div>
          </div>
        )}

        {/* Global Impact Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-card p-4 text-center card-hover-effect">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">Total CO₂</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{totalCo2.toFixed(2)}kg</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center card-hover-effect">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">Total Water</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{totalWater.toFixed(0)}L</p>
          </div>
        </div>

        {/* Itemized List */}
        <div className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">Detected Items</p>
          {items.map((item, idx) => (
            <div key={`${item.info.id}-${idx}`} className="space-y-3 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="rounded-2xl border border-border bg-card p-4 card-hover-effect">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl shadow-inner">
                    {item.info.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-foreground leading-tight">{item.info.displayName}</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-primary mt-1">
                      {Math.round(item.detection.confidence * 100)}% confidence · {item.info.material}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <div className="rounded-lg bg-secondary/30 p-3">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-primary mb-1">Safety & Toxicity</p>
                    <p className="text-xs text-foreground leading-relaxed">{TOX_TEXT[item.info.toxicity]}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-3">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-primary mb-1">Recycling Info</p>
                    <p className="text-xs text-foreground leading-relaxed">{REC_TEXT[item.info.recyclable]}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-3">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-primary mb-1">Disposal Tip</p>
                    <p className="text-xs text-foreground leading-relaxed">{item.info.disposalTip}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4">
          <Button size="lg" onClick={() => navigate('/')}>Scan Another</Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/diary')}>View Album</Button>
        </div>
      </div>
    </div>
  )
}
