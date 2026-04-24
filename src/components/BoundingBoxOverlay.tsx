import { View, Text, StyleSheet } from 'react-native';
import type { Detection } from '../types';
import { lookup } from '../services/degradation';

interface Props {
  detections: Detection[];
  containerWidth: number;
  containerHeight: number;
}

export function BoundingBoxOverlay({ detections, containerWidth, containerHeight }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {detections.map((d, i) => {
        const left = d.bbox.x * containerWidth;
        const top = d.bbox.y * containerHeight;
        const width = d.bbox.width * containerWidth;
        const height = d.bbox.height * containerHeight;
        const info = lookup(d.class);
        const color = d.confidence >= 0.8 ? '#22c55e' : '#eab308';
        return (
          <View
            key={i}
            style={[
              styles.box,
              { left, top, width, height, borderColor: color },
            ]}
          >
            <View style={[styles.label, { backgroundColor: color }]}>
              <Text style={styles.labelText}>
                {info.emoji} {info.displayName} {Math.round(d.confidence * 100)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 4,
  },
  label: {
    position: 'absolute',
    top: -24,
    left: -3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: '700',
  },
});
