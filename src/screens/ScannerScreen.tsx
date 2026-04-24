import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { useYolo } from '../hooks/useYolo';
import { useOcr } from '../hooks/useOcr';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { SnapButton } from '../components/SnapButton';
import { SNAP_CONFIDENCE_THRESHOLD } from '../services/detection';
import { lookup } from '../services/degradation';
import { saveScan } from '../services/storage';
import type { ScanResult } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { width, height } = useWindowDimensions();
  const nav = useNavigation<Nav>();
  const ocr = useOcr();

  const { detections, bestConfidence } = useYolo({ enabled: !busy });
  const ready = bestConfidence >= SNAP_CONFIDENCE_THRESHOLD;

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.msg}>Camera access needed to scan trash.</Text>
        <Pressable onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  const handleSnap = async () => {
    if (busy) return;
    const top = [...detections].sort((a, b) => b.confidence - a.confidence)[0];
    if (!top) return;

    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6, skipProcessing: true });
      const ocrText = photo?.uri ? await ocr.run(photo.uri) : undefined;
      const info = lookup(top.class);
      const scan: ScanResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        photoUri: photo?.uri,
        detection: top,
        ocrText,
        info,
      };
      await saveScan(scan);
      nav.navigate('Results', { scan });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <BoundingBoxOverlay detections={detections} containerWidth={width} containerHeight={height} />

      <View style={styles.topBar}>
        <Pressable onPress={() => nav.navigate('Diary')} style={styles.chip}>
          <Text style={styles.chipText}>Diary</Text>
        </Pressable>
        <Pressable onPress={() => nav.navigate('Dashboard')} style={styles.chip}>
          <Text style={styles.chipText}>Dashboard</Text>
        </Pressable>
      </View>

      <View style={styles.bottomBar}>
        <SnapButton confidence={bestConfidence} ready={ready} busy={busy} onPress={handleSnap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  msg: { color: '#fafafa', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  permBtn: { backgroundColor: '#22c55e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  permBtnText: { color: '#0a0a0a', fontWeight: '700' },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chipText: { color: '#fff', fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
