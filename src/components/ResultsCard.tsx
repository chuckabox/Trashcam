import type { ScanResult } from '../types'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

interface Props {
  result: ScanResult
}

const TOX_VARIANT = { low: 'success', medium: 'warning', high: 'danger' } as const
const REC_VARIANT = {
  recyclable: 'success',
  compostable: 'success',
  landfill: 'secondary',
  hazardous: 'danger',
} as const

export function ResultsCard({ result }: Props) {
  const { info, detection, ocrText, photoUri } = result
  const years = info.decompositionYears
  const decompStr =
    years >= 1000
      ? '1000+ years'
      : years < 1
        ? `${Math.round(years * 365)} days`
        : `${years} years`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {photoUri ? (
            <img
              src={photoUri}
              alt={info.displayName}
              className="h-20 w-20 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
              <span className="text-4xl">{info.emoji}</span>
            </div>
          )}
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-lg font-bold text-foreground">{info.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round(detection.confidence * 100)}% · {info.material}
            </p>
            {ocrText ? (
              <p className="text-xs italic text-yellow-400">"{ocrText}"</p>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3">
          <Stat label="Decomposes in" value={decompStr} tone="primary" />
          <div className="flex gap-2">
            <Stat label="CO₂" value={`${info.co2KgPerItem} kg`} tone="violet" className="flex-1" />
            <Stat
              label="Water"
              value={`${info.waterLitersPerItem} L`}
              tone="cyan"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant={TOX_VARIANT[info.toxicity]} label={`Toxicity: ${info.toxicity}`} />
            <Badge variant={REC_VARIANT[info.recyclable]} label={info.recyclable} />
          </div>
          <div className="mt-2 rounded-lg bg-secondary p-3">
            <p className="text-xs uppercase text-muted-foreground">How to dispose</p>
            <p className="mt-1 text-sm text-foreground">{info.disposalTip}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  tone,
  className,
}: {
  label: string
  value: string
  tone: 'primary' | 'violet' | 'cyan'
  className?: string
}) {
  const valueColor =
    tone === 'primary'
      ? 'text-primary'
      : tone === 'violet'
        ? 'text-violet-400'
        : 'text-cyan-400'
  return (
    <div
      className={cn('rounded-lg border border-border bg-background p-3', className)}
    >
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-base font-bold', valueColor)}>{value}</p>
    </div>
  )
}
