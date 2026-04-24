import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image, RefreshControl, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { clearScans, loadScans } from '../services/storage';
import type { ScanResult } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Diary'>;

export default function DiaryScreen() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const nav = useNavigation<Nav>();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const list = await loadScans();
    setScans(list);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleClear = () => {
    Alert.alert('Clear diary?', 'This removes all scan history on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearScans();
          setScans([]);
        },
      },
    ]);
  };

  if (scans.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyEmoji}>📔</Text>
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptySub}>Your scanned items appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={scans}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#22c55e" />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Waste Diary ({scans.length})</Text>
            <Pressable onPress={handleClear}>
              <Text style={styles.clear}>Clear</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => nav.navigate('Results', { scan: item })}>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.emojiThumb]}>
                <Text style={{ fontSize: 28 }}>{item.info.emoji}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.info.displayName}</Text>
              <Text style={styles.meta}>
                {new Date(item.timestamp).toLocaleDateString()} · {item.info.material}
              </Text>
            </View>
            <Text style={styles.conf}>{Math.round(item.detection.confidence * 100)}%</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { color: '#fafafa', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#a1a1aa' },
  list: { padding: 16, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#fafafa', fontSize: 22, fontWeight: '700' },
  clear: { color: '#ef4444', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#18181b',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  thumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#27272a' },
  emojiThumb: { alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fafafa', fontSize: 15, fontWeight: '600' },
  meta: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  conf: { color: '#22c55e', fontWeight: '700' },
});
