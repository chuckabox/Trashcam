import { View, Image } from 'react-native';
import type { ScanResult } from '../types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Text } from './ui/text';

interface Props {
  result: ScanResult;
}

const TOX_VARIANT = { low: 'success', medium: 'warning', high: 'danger' } as const;
const REC_VARIANT = {
  recyclable: 'success',
  compostable: 'success',
  landfill: 'secondary',
  hazardous: 'danger',
} as const;

export function ResultsCard({ result }: Props) {
  const { info, detection, ocrText, photoUri } = result;
  const years = info.decompositionYears;
  const decompStr =
    years >= 1000
      ? '1000+ years'
      : years < 1
        ? `${Math.round(years * 365)} days`
        : `${years} years`;

  return (
    <Card>
      <CardHeader>
        <View className="flex-row items-center gap-3">
          {photoUri ? (
            <Image source={{ uri: photoUri }} className="h-20 w-20 rounded-xl" />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-xl bg-secondary">
              <Text className="text-4xl">{info.emoji}</Text>
            </View>
          )}
          <View className="flex-1 gap-1">
            <Text className="text-lg font-bold">{info.displayName}</Text>
            <Text className="text-sm text-muted-foreground">
              {Math.round(detection.confidence * 100)}% · {info.material}
            </Text>
            {ocrText ? (
              <Text className="text-xs italic text-yellow-400">"{ocrText}"</Text>
            ) : null}
          </View>
        </View>
      </CardHeader>

      <CardContent>
        <View className="gap-3">
          <Stat label="Decomposes in" value={decompStr} tone="primary" />
          <View className="flex-row gap-2">
            <Stat label="CO₂" value={`${info.co2KgPerItem} kg`} tone="violet" className="flex-1" />
            <Stat label="Water" value={`${info.waterLitersPerItem} L`} tone="cyan" className="flex-1" />
          </View>
          <View className="flex-row gap-2">
            <Badge variant={TOX_VARIANT[info.toxicity]} label={`Toxicity: ${info.toxicity}`} />
            <Badge variant={REC_VARIANT[info.recyclable]} label={info.recyclable} />
          </View>
          <View className="mt-2 rounded-lg bg-secondary p-3">
            <Text className="text-xs uppercase text-muted-foreground">How to dispose</Text>
            <Text className="mt-1 text-sm">{info.disposalTip}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: string;
  tone: 'primary' | 'violet' | 'cyan';
  className?: string;
}) {
  const valueColor =
    tone === 'primary' ? 'text-primary' : tone === 'violet' ? 'text-violet-400' : 'text-cyan-400';
  return (
    <View className={`rounded-lg border border-border bg-background p-3 ${className ?? ''}`}>
      <Text className="text-xs uppercase text-muted-foreground">{label}</Text>
      <Text className={`mt-1 text-base font-bold ${valueColor}`}>{value}</Text>
    </View>
  );
}
