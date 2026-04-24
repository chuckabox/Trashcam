import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { computeStats, loadScans } from '../services/storage';
import type { DashboardStats, MaterialCategory } from '../types';

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
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.emptySub}>Scan a few items to see stats.</Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.kpiRow}>
        <Kpi label="Total Scans" value={`${stats.totalScans}`} />
        <Kpi label="CO₂ Impact" value={`${stats.totalCo2Kg.toFixed(2)} kg`} />
        <Kpi label="Water" value={`${stats.totalWaterLiters.toFixed(0)} L`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Material Breakdown</Text>
        <PieChart
          data={pieData}
          width={width - 64}
          height={200}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="8"
          chartConfig={{
            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
          }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Items</Text>
        {stats.topItems.map((item) => (
          <View key={item.name} style={styles.topRow}>
            <Text style={styles.topName}>{item.name}</Text>
            <Text style={styles.topCount}>×{item.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { color: '#fafafa', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#a1a1aa' },
  title: { color: '#fafafa', fontSize: 24, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: '#18181b', padding: 12, borderRadius: 12 },
  kpiLabel: { color: '#a1a1aa', fontSize: 11, textTransform: 'uppercase' },
  kpiValue: { color: '#fafafa', fontSize: 18, fontWeight: '700', marginTop: 4 },
  card: { backgroundColor: '#18181b', padding: 16, borderRadius: 12 },
  cardTitle: { color: '#fafafa', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  topName: { color: '#fafafa', fontSize: 14 },
  topCount: { color: '#22c55e', fontSize: 14, fontWeight: '700' },
});
