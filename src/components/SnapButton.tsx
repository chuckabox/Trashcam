import { Pressable, ActivityIndicator, View } from 'react-native';
import { Text } from './ui/text';
import { cn } from '../lib/utils';

interface Props {
  confidence: number;
  ready: boolean;
  busy: boolean;
  onPress: () => void;
}

export function SnapButton({ confidence, ready, busy, onPress }: Props) {
  const pct = Math.round(confidence * 100);

  return (
    <View className="items-center gap-3">
      <View className="rounded-full bg-black/60 px-4 py-1">
        <Text className="text-sm font-semibold text-white">
          {busy
            ? 'Processing…'
            : ready
              ? `Confident ${pct}% — snap it!`
              : confidence > 0
                ? `Detecting… ${pct}%`
                : 'Point at trash'}
        </Text>
      </View>
      <Pressable
        onPress={onPress}
        disabled={busy}
        className={cn(
          'h-20 w-20 items-center justify-center rounded-full border-4 active:opacity-80',
          ready ? 'border-primary' : 'border-white',
        )}
      >
        {busy ? (
          <ActivityIndicator color="#22c55e" />
        ) : (
          <View
            className={cn(
              'h-14 w-14 rounded-full',
              ready ? 'bg-primary' : 'bg-white',
            )}
          />
        )}
      </Pressable>
    </View>
  );
}
