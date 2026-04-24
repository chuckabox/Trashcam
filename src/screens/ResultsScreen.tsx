import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { ResultsCard } from '../components/ResultsCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { scan } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ResultsCard result={scan} />

      <View style={styles.recycleBox}>
        <Text style={styles.sectionLabel}>Find Local Recycling</Text>
        <Text style={styles.recycleHint}>
          Nearest {scan.info.recyclable} drop-off lookup coming soon.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, styles.primary]}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.btnText}>Scan Another</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.secondary]}
          onPress={() => navigation.navigate('Diary')}
        >
          <Text style={[styles.btnText, { color: '#fafafa' }]}>View Diary</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  recycleBox: { backgroundColor: '#18181b', padding: 16, borderRadius: 12 },
  sectionLabel: { color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', marginBottom: 6 },
  recycleHint: { color: '#fafafa', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#22c55e' },
  secondary: { backgroundColor: '#27272a' },
  btnText: { color: '#0a0a0a', fontWeight: '700', fontSize: 15 },
});
