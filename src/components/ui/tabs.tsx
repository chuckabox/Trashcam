import { cn } from '../../lib/utils'

export interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-px rounded-lg border border-border bg-muted p-px', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 rounded-md py-2 font-mono text-xs uppercase transition-all',
            active === tab.id
              ? 'bg-secondary text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
