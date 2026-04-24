import { View } from 'react-native';
import type { Detection } from '../types';
import { lookup } from '../services/degradation';
import { Text } from './ui/text';
import { cn } from '../lib/utils';

interface Props {
  detections: Detection[];
  containerWidth: number;
  containerHeight: number;
}

export function BoundingBoxOverlay({ detections, containerWidth, containerHeight }: Props) {
  return (
    <View className="absolute inset-0" pointerEvents="none">
      {detections.map((d, i) => {
        const left = d.bbox.x * containerWidth;
        const top = d.bbox.y * containerHeight;
        const width = d.bbox.width * containerWidth;
        const height = d.bbox.height * containerHeight;
        const info = lookup(d.class);
        const strong = d.confidence >= 0.6;

        return (
          <View
            key={i}
            style={{ left, top, width, height }}
            className={cn(
              'absolute rounded-md border-4',
              strong ? 'border-primary' : 'border-yellow-400',
            )}
          >
            <View
              className={cn(
                'absolute -top-7 left-0 rounded-t-md px-2 py-1',
                strong ? 'bg-primary' : 'bg-yellow-400',
              )}
            >
              <Text className="text-xs font-bold text-black">
                {info.emoji} {info.displayName} {Math.round(d.confidence * 100)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
