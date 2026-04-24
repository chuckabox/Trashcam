import { forwardRef } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Text } from './text';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl active:opacity-80',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-transparent',
        secondary: 'bg-secondary',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-10 px-4',
        lg: 'h-14 px-8',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const textVariants = cva('text-base font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  label?: string;
}

export const Button = forwardRef<any, ButtonProps>(
  ({ className, variant, size, label, textClassName, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {label ? (
          <Text className={cn(textVariants({ variant }), textClassName)}>{label}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
