import { useCallback, useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions, Platform, Linking } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation';
import { useYolo } from '../hooks/useYolo';
import { useOcr } from '../hooks/useOcr';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { SnapButton } from '../components/SnapButton';
import { SNAP_CONFIDENCE_THRESHOLD } from '../services/detection';
import { lookup } from '../services/degradation';
import { saveScan } from '../services/storage';
import type { ScanResult } from '../types';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

export default function ScannerScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const { width, height } = useWindowDimensions();
  const nav = useNavigation<Nav>();
  const ocr = useOcr();
  const [busy, setBusy] = useState(false);

  const { frameProcessor, detections, bestConfidence, modelLoading, modelError } = useYolo();
  const ready = bestConfidence >= SNAP_CONFIDENCE_THRESHOLD;

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const handleSnap = useCallback(async () => {
    if (busy || !cameraRef.current) return;
    const top = [...detections].sort((a, b) => b.confidence - a.confidence)[0];
    if (!top) return;

    setBusy(true);
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const uri = Platform.OS === 'ios' ? photo.path : `file://${photo.path}`;
      const ocrText = await ocr.run(uri);
      const info = lookup(top.class);
      const scan: ScanResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        photoUri: uri,
        detection: top,
        ocrText,
        info,
      };
      await saveScan(scan);
      nav.navigate('Results', { scan });
    } finally {
      setBusy(false);
    }
  }, [busy, detections, ocr, nav]);

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-center text-base">
          Camera access needed to scan trash.
        </Text>
        <Button label="Grant Access" onPress={requestPermission} />
        <Button
          variant="ghost"
          label="Open Settings"
          onPress={() => Linking.openSettings()}
          className="mt-2"
        />
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text>No camera device found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={!busy}
        photo
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />
      <BoundingBoxOverlay
        detections={detections}
        containerWidth={width}
        containerHeight={height}
      />

      <SafeAreaView className="absolute inset-x-0 top-0 flex-row justify-end gap-2 p-4" edges={['top']}>
        <Button
          variant="outline"
          size="sm"
          label="Diary"
          onPress={() => nav.navigate('Diary')}
          className="border-white/30 bg-black/50"
          textClassName="text-white"
        />
        <Button
          variant="outline"
          size="sm"
          label="Dashboard"
          onPress={() => nav.navigate('Dashboard')}
          className="border-white/30 bg-black/50"
          textClassName="text-white"
        />
      </SafeAreaView>

      {modelLoading && (
        <View className="absolute inset-x-0 top-28 items-center">
          <View className="rounded-full bg-black/70 px-4 py-2">
            <Text className="text-sm text-white">
              {modelError ? `Model error: ${String(modelError)}` : 'Loading YOLOv8 model…'}
            </Text>
          </View>
        </View>
      )}

      <SafeAreaView className="absolute inset-x-0 bottom-0 items-center pb-8" edges={['bottom']}>
        <SnapButton
          confidence={bestConfidence}
          ready={ready}
          busy={busy}
          onPress={handleSnap}
        />
      </SafeAreaView>
    </View>
  );
}
