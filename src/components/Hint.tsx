import { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'

interface HintProps {
  text: string
  className?: string
}

export function Hint({ text, className }: HintProps) {
  const [show, setShow] = useState(false)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (show && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      // If the button is on the right half of the screen, show tooltip on the left
      if (rect.left > window.innerWidth / 2) {
        setSide('left')
      } else {
        setSide('right')
      }
    }
  }, [show])

  return (
    <div className={cn('relative inline-flex items-center ml-1.5', className)}>
      <button
        ref={btnRef}
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
        <div 
          className={cn(
            "absolute bottom-full z-[60] mb-2 w-48 animate-scale-in",
            side === 'left' ? "right-0" : "left-0"
          )}
        >
          <div className="rounded-md border border-border bg-popover p-2 shadow-lg backdrop-blur-xl">
            <p className={cn(
              "font-mono text-[9px] leading-tight text-foreground break-words whitespace-normal",
              side === 'left' ? "text-right" : "text-left"
            )}>
              {text}
            </p>
          </div>
          {/* Arrow */}
          <div className={cn(
            "absolute top-full h-1.5 w-1.5 -translate-y-1/2 rotate-45 border-b border-r border-border bg-popover",
            side === 'left' ? "right-1.5" : "left-1.5"
          )} />
        </div>
      )}
    </div>
  )
}
