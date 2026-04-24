import { cn } from '../../lib/utils'

export function Progress({
  value,
  className,
  color,
}: {
  value: number
  className?: string
  color?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-1 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color ?? '#b5f23d' }}
      />
    </div>
  )
}
