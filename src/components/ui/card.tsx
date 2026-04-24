import { View, type ViewProps } from 'react-native';
import { cn } from '../../lib/utils';
import { Text } from './text';

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('rounded-xl border border-border bg-card shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('flex-col p-4 gap-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: any) {
  return (
    <Text
      className={cn('text-lg font-semibold tracking-tight text-card-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: any) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('p-4 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('flex-row items-center p-4 pt-0 gap-2', className)}
      {...props}
    />
  );
}
