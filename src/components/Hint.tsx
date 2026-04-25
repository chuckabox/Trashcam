import { useState } from 'react'
import { cn } from '../lib/utils'

interface HintProps {
  text: string
  className?: string
}

export function Hint({ text, className }: HintProps) {
  const [show, setShow] = useState(false)

  return (
    <div className={cn('relative inline-flex items-center ml-1.5', className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setShow(!show)
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/30 bg-secondary/50 text-[9px] font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        ?
      </button>

      {show && (
        <div className="absolute bottom-full left-1/2 z-[60] mb-2 w-48 -translate-x-1/2 animate-scale-in">
          <div className="rounded-md border border-border bg-popover p-2 shadow-lg backdrop-blur-xl">
            <p className="font-mono text-[9px] leading-tight text-foreground">
              {text}
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-border bg-popover" />
        </div>
      )}
    </div>
  )
}
