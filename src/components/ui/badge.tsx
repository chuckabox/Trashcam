import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text } from './text';

const badgeVariants = cva(
  'self-start flex-row items-center rounded-md px-2 py-1',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-transparent',
        success: 'bg-primary/20 border border-primary/40',
        warning: 'bg-yellow-500/20 border border-yellow-500/40',
        danger: 'bg-red-500/20 border border-red-500/40',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const badgeTextVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      success: 'text-primary',
      warning: 'text-yellow-400',
      danger: 'text-red-400',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  label: string;
}

export function Badge({ variant, className, label }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <Text className={badgeTextVariants({ variant })}>{label}</Text>
    </View>
  );
}
