import { useLocation, useNavigate } from 'react-router-dom'
import type { ScanResult } from '../types'

import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Hint } from '../components/Hint'
import { cn } from '../lib/utils'

const TOX_VARIANT = { low: 'success', medium: 'warning', high: 'danger' } as const
const REC_VARIANT = {
  recyclable: 'success', compostable: 'success', landfill: 'secondary', hazardous: 'danger',
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
  
  // Aggregate stats across all items
  const totalCo2 = items.reduce((acc, item) => acc + item.info.co2KgPerItem, 0)
  const totalWater = items.reduce((acc, item) => acc + item.info.waterLitresPerItem, 0)
  const maxDecomp = Math.max(...items.map(item => item.info.decompositionYears))
  
  const decompStr = maxDecomp >= 1000 ? '1000+ yrs'
    : maxDecomp < 1 ? `${Math.round(maxDecomp * 365)}d`
    : `${maxDecomp} yrs`

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6 space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back
        </button>

        {/* Hero Image */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {photoUri && (
            <div className="relative h-48 w-full overflow-hidden">
              <img src={photoUri} alt="Scan capture" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'} Detected
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Impact Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Decomposes', value: decompStr, color: 'text-primary' },
            { label: 'Total CO₂', value: `${totalCo2.toFixed(2)}kg`, color: 'text-cyan-600' },
            { label: 'Total Water', value: `${totalWater.toFixed(0)}L`, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border border-border bg-white p-3 text-center shadow-sm">
              <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-primary">{label}</p>
              <p className={cn("mt-1 font-mono text-sm font-bold", color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Individual Items List */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Scan Details</p>
          {items.map((item, idx) => (
            <div key={`${item.info.yoloClass}-${idx}`} className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-2xl">
                  {item.info.emoji}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{item.info.displayName}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    {Math.round(item.detection.confidence * 100)}% Confidence · {item.info.material}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={TOX_VARIANT[item.info.toxicity]} label={`Toxicity: ${item.info.toxicity}`} />
                <Badge variant={REC_VARIANT[item.info.recyclable]} label={item.info.recyclable} />
              </div>

              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Disposal Tip</p>
                <p className="text-xs text-foreground leading-relaxed">{item.info.disposalTip}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => navigate('/')}>Scan Another</Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/diary')}>View Diary</Button>
        </div>
      </div>
    </div>
  )
}
