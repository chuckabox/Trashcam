import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-border bg-transparent text-foreground',
      success: 'bg-primary/20 border border-primary/40 text-primary',
      warning: 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400',
      danger: 'bg-red-500/20 border border-red-500/40 text-red-400',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
  label: string
}

export function Badge({ variant, className, label }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{label}</span>
}
