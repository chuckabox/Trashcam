import { useLocation, useNavigate } from 'react-router-dom'
import type { ScanResult } from '../types'

import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
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
        <Button variant="outline" onClick={() => navigate('/scan')}>Go to Scanner</Button>
      </div>
    )
  }
  const { photoUri } = scan
  const items = scan.items || ((scan as any).info ? [(scan as any).info] : [])
  const detections = scan.detections || ((scan as any).detection ? [(scan as any).detection] : [])

  if (items.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Malformed scan data</p>
        <Button variant="outline" onClick={() => navigate('/scan')}>Go to Scanner</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6 space-y-4">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back
        </button>

        {/* Hero Photo */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {photoUri ? (
            <div className="relative h-56 w-full overflow-hidden bg-black">
              <img src={photoUri} alt="Scan Result" className="h-full w-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center bg-secondary text-muted-foreground">
              <span className="font-mono text-[10px] uppercase tracking-widest">No Image</span>
            </div>
          )}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Summary</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} detected
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((info, idx) => {
            const detection = detections[idx]
            const decompStr = info.decompositionYears >= 1000 ? '1000+ yrs'
              : info.decompositionYears < 1 ? `${Math.round(info.decompositionYears * 365)}d`
              : `${info.decompositionYears} yrs`

            return (
              <div key={idx} className="rounded-2xl border border-border bg-card p-4 space-y-4 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-3xl shadow-inner">
                    {info.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-foreground truncate">{info.displayName}</p>
                      <Badge variant={TOX_VARIANT[info.toxicity]} className="text-[8px] uppercase px-1.5 py-0 h-4" label={info.toxicity} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant={REC_VARIANT[info.recyclable]} className="text-[8px] uppercase px-1.5 py-0 h-4 font-mono" label={info.recyclable} />
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                        {Math.round(detection.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/30 p-2.5 text-center">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Decomposition</p>
                    <p className="mt-1 font-mono text-sm font-bold text-primary">{decompStr}</p>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-2.5 text-center">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-muted-foreground">CO₂ Footprint</p>
                    <p className="mt-1 font-mono text-sm font-bold text-cyan-600">{info.co2KgPerItem}kg</p>
                  </div>
                </div>

                {/* Disposal Tip */}
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">Disposal Guide</p>
                  </div>
                  <p className="text-[13px] text-foreground leading-relaxed">
                    {info.disposalTip}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button className="flex-1 h-12 text-xs font-bold uppercase tracking-widest" onClick={() => navigate('/scan')}>
            Scan Another
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-xs font-bold uppercase tracking-widest" onClick={() => navigate('/album')}>
            View Album
          </Button>
        </div>
      </div>
    </div>
  )
}
