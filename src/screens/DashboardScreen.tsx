import { useCallback, useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { computeStats, loadScans } from '../services/storage';
import type { DashboardStats, MaterialCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Text } from '../components/ui/text';

const MATERIAL_COLORS: Record<MaterialCategory, string> = {
  plastic: '#ef4444',
  metal: '#3b82f6',
  glass: '#06b6d4',
  paper: '#a3a3a3',
  cardboard: '#b45309',
  organic: '#84cc16',
  textile: '#ec4899',
  styrofoam: '#f97316',
  electronic: '#8b5cf6',
  hazardous: '#dc2626',
  composite: '#eab308',
};

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { width } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      loadScans().then((s) => setStats(computeStats(s)));
    }, []),
  );

  if (!stats || stats.totalScans === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-background">
        <Text className="text-6xl">📊</Text>
        <Text className="text-xl font-bold">No data yet</Text>
        <Text className="text-sm text-muted-foreground">Scan a few items to see stats.</Text>
      </View>
    );
  }

  const pieData = (Object.entries(stats.materialBreakdown) as [MaterialCategory, number][])
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: k,
      count: v,
      color: MATERIAL_COLORS[k],
      legendFontColor: '#fafafa',
      legendFontSize: 12,
    }));

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}>
      <Text className="text-2xl font-bold">Dashboard</Text>

      <View className="flex-row gap-2">
        <Kpi label="Scans" value={`${stats.totalScans}`} />
        <Kpi label="CO₂" value={`${stats.totalCo2Kg.toFixed(2)} kg`} />
        <Kpi label="Water" value={`${stats.totalWaterLiters.toFixed(0)} L`} />
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Material Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart
            data={pieData}
            width={width - 64}
            height={200}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="8"
            chartConfig={{ color: (opacity = 1) => `rgba(255,255,255,${opacity})` }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Items</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topItems.map((item, idx) => (
            <View
              key={item.name}
              className={`flex-row justify-between py-2 ${idx !== stats.topItems.length - 1 ? 'border-b border-border' : ''}`}
            >
              <Text>{item.name}</Text>
              <Text className="font-bold text-primary">×{item.count}</Text>
            </View>
          ))}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1 p-3">
      <Text className="text-xs uppercase text-muted-foreground">{label}</Text>
      <Text className="mt-1 text-lg font-bold">{value}</Text>
    </Card>
  );
}
