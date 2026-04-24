import { View, Text, StyleSheet, Image } from 'react-native';
import type { ScanResult } from '../types';

interface Props {
  result: ScanResult;
}

const TOX_COLOR: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};

const REC_COLOR: Record<string, string> = {
  recyclable: '#22c55e',
  compostable: '#84cc16',
  landfill: '#71717a',
  hazardous: '#ef4444',
};

export function ResultsCard({ result }: Props) {
  const { info, detection, ocrText, photoUri } = result;
  const years = info.decompositionYears;
  const decompStr =
    years >= 1000 ? '1000+ years (practically forever)' : years < 1 ? `${Math.round(years * 365)} days` : `${years} years`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.emojiThumb]}>
            <Text style={styles.emoji}>{info.emoji}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{info.displayName}</Text>
          <Text style={styles.sub}>
            {Math.round(detection.confidence * 100)}% confidence · {info.material}
          </Text>
          {ocrText ? <Text style={styles.ocr}>"{ocrText}"</Text> : null}
        </View>
      </View>

      <View style={styles.row}>
        <Badge label="Decomposes in" value={decompStr} color="#0ea5e9" />
      </View>
      <View style={styles.row}>
        <Badge label="CO₂" value={`${info.co2KgPerItem} kg`} color="#8b5cf6" />
        <Badge label="Water" value={`${info.waterLitersPerItem} L`} color="#06b6d4" />
      </View>
      <View style={styles.row}>
        <Badge label="Toxicity" value={info.toxicity} color={TOX_COLOR[info.toxicity]} />
        <Badge label="Disposal" value={info.recyclable} color={REC_COLOR[info.recyclable]} />
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipLabel}>How to dispose</Text>
        <Text style={styles.tipText}>{info.disposalTip}</Text>
      </View>
    </View>
  );
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={[styles.badgeValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#27272a',
  },
  emojiThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 40 },
  headerText: { flex: 1 },
  title: { color: '#fafafa', fontSize: 18, fontWeight: '700' },
  sub: { color: '#a1a1aa', fontSize: 13, marginTop: 2 },
  ocr: { color: '#eab308', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  row: { flexDirection: 'row', gap: 8 },
  badge: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#0a0a0a',
  },
  badgeLabel: { color: '#71717a', fontSize: 11, textTransform: 'uppercase' },
  badgeValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  tipBox: {
    backgroundColor: '#27272a',
    padding: 12,
    borderRadius: 10,
  },
  tipLabel: { color: '#a1a1aa', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 },
  tipText: { color: '#fafafa', fontSize: 14, lineHeight: 20 },
});
