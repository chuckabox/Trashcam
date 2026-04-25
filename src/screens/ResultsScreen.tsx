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

  const { info, detection, photoUri } = scan
  const decompStr = info.decompositionYears >= 1000 ? '1000+ yrs'
    : info.decompositionYears < 1 ? `${Math.round(info.decompositionYears * 365)}d`
    : `${info.decompositionYears} yrs`

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

        {/* Hero */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {photoUri ? (
            <div className="relative h-52 w-full overflow-hidden">
              <img src={photoUri} alt={info.displayName} className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xl font-bold text-foreground">{info.displayName}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  {Math.round(detection.confidence * 100)}% confidence · {info.material}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary text-4xl">
                {info.emoji}
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{info.displayName}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  {Math.round(detection.confidence * 100)}% confidence · {info.material}
                </p>
              </div>
            </div>
          )}
        </div>



        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Decomposes', value: decompStr, color: 'text-primary' },
            { label: 'CO₂', value: `${info.co2KgPerItem}kg`, color: 'text-cyan-600' },
            { label: 'Water', value: `${info.waterLitresPerItem}L`, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-3 text-center card-hover-effect">
              <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-primary">{label}</p>
              <p className={cn("mt-1 font-mono text-sm font-bold", color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={TOX_VARIANT[info.toxicity]} label={`Toxicity: ${info.toxicity}`} />
          <Badge variant={REC_VARIANT[info.recyclable]} label={info.recyclable} />
        </div>

        {/* Disposal tip */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">How to dispose</p>
          <p className="text-sm text-foreground leading-relaxed">{info.disposalTip}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button className="flex-1" onClick={() => navigate('/')}>Scan Another</Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/diary')}>View Diary</Button>
        </div>
      </div>
    </div>
  )
}
