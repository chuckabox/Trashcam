import { useCallback, useState } from 'react';
import { View, FlatList, Image, RefreshControl, Alert, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { clearScans, loadScans } from '../services/storage';
import type { ScanResult } from '../types';
import { Card } from '../components/ui/card';
import { Text } from '../components/ui/text';
import { Button } from '../components/ui/button';

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
      <View className="flex-1 items-center justify-center gap-2 bg-background">
        <Text className="text-6xl">📔</Text>
        <Text className="text-xl font-bold">No scans yet</Text>
        <Text className="text-sm text-muted-foreground">Your scanned items appear here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={scans}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#22c55e" />
      }
      ListHeaderComponent={
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold">Waste Diary ({scans.length})</Text>
          <Button size="sm" variant="ghost" label="Clear" onPress={handleClear} textClassName="text-destructive" />
        </View>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => nav.navigate('Results', { scan: item })}>
          <Card className="flex-row items-center gap-3 p-3">
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} className="h-14 w-14 rounded-lg" />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-lg bg-secondary">
                <Text className="text-2xl">{item.info.emoji}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="font-semibold">{item.info.displayName}</Text>
              <Text className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleDateString()} · {item.info.material}
              </Text>
            </View>
            <Text className="font-bold text-primary">
              {Math.round(item.detection.confidence * 100)}%
            </Text>
          </Card>
        </Pressable>
      )}
    />
  );
}
