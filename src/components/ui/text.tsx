import { cn } from '../../lib/utils'

export function Text({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('text-foreground', className)} {...props} />
}
