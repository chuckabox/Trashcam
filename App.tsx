import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import RootNavigator from './src/navigation';

export default function App() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('dark');
  }, [setColorScheme]);

  return (
    <SafeAreaProvider>
      <View className="dark flex-1 bg-background">
        <StatusBar style="light" />
        <RootNavigator />
        <PortalHost />
      </View>
    </SafeAreaProvider>
  );
}
