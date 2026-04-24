import { ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { ResultsCard } from '../components/ResultsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { scan } = route.params;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}>
      <ResultsCard result={scan} />

      <Card>
        <CardHeader>
          <CardTitle>Find Local Recycling</CardTitle>
          <CardDescription>
            Nearest {scan.info.recyclable} drop-off lookup — coming soon.
          </CardDescription>
        </CardHeader>
      </Card>

      <View className="flex-row gap-2">
        <Button
          label="Scan Another"
          className="flex-1"
          onPress={() => navigation.popToTop()}
        />
        <Button
          variant="secondary"
          label="View Diary"
          className="flex-1"
          onPress={() => navigation.navigate('Diary')}
        />
      </View>
    </ScrollView>
  );
}
