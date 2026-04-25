import type { Detection } from '../types'
import { lookup } from '../services/degradation'
import { cn } from '../lib/utils'

interface Props {
  detections: Detection[]
}

export function BoundingBoxOverlay({ detections }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {detections.map((d, i) => {
        const info = lookup(d.class)
        const strong = d.confidence >= 0.6
        return (
          <div
            key={d.id ?? i}
            style={{
              left: `${d.bbox.x * 100}%`,
              top: `${d.bbox.y * 100}%`,
              width: `${d.bbox.width * 100}%`,
              height: `${d.bbox.height * 100}%`,
              transition: 'left 180ms linear, top 180ms linear, width 180ms linear, height 180ms linear, border-color 200ms ease',
            }}
            className={cn(
              'absolute rounded-md border-4',
              strong ? 'border-primary' : 'border-yellow-400',
            )}
          >
            <div
              className={cn(
                'absolute -top-7 left-0 whitespace-nowrap rounded-t-md px-2 py-1 text-xs font-bold text-black',
                strong ? 'bg-primary' : 'bg-yellow-400',
              )}
            >
              {info.emoji} {info.displayName} {Math.round(d.confidence * 100)}%
            </div>
          </div>
        )
      })}
    </div>
  )
}
