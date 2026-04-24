import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase text-xs',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg',
        outline: 'border border-border bg-transparent text-foreground hover:border-primary/50 hover:text-primary rounded-lg',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-lg',
        ghost: 'bg-transparent text-muted-foreground hover:text-foreground rounded-lg',
        lime: 'border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg',
      },
      size: {
        default: 'h-11 px-5 text-xs',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-13 px-8 text-sm',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }
