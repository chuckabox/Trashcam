import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScannerScreen from '../screens/ScannerScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DiaryScreen from '../screens/DiaryScreen';
import DashboardScreen from '../screens/DashboardScreen';
import type { ScanResult } from '../types';

export type RootStackParamList = {
  Scanner: undefined;
  Results: { scan: ScanResult };
  Diary: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',
    card: '#0a0a0a',
    text: '#fafafa',
    border: '#27272a',
    primary: '#22c55e',
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Scanner"
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#fafafa',
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Scan Result' }} />
        <Stack.Screen name="Diary" component={DiaryScreen} options={{ title: 'Waste Diary' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
