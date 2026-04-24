import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 font-mono text-xs uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary border border-primary/30',
        secondary: 'bg-secondary text-secondary-foreground border border-border',
        destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
        outline: 'border border-border text-muted-foreground',
        success: 'bg-primary/10 border border-primary/25 text-primary',
        warning: 'bg-yellow-400/10 border border-yellow-400/25 text-yellow-400',
        orange: 'bg-orange-500/10 border border-orange-500/25 text-orange-400',
        danger: 'bg-red-500/10 border border-red-500/25 text-red-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
  label: string
}

export function Badge({ variant, className, label }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{label}</span>
}
