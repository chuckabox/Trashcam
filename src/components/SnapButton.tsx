import { Pressable, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

interface Props {
  confidence: number;
  ready: boolean;
  busy: boolean;
  onPress: () => void;
}

export function SnapButton({ confidence, ready, busy, onPress }: Props) {
  const confidencePct = Math.round(confidence * 100);
  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        {busy
          ? 'Processing…'
          : ready
            ? `Confident ${confidencePct}% — snap it!`
            : confidence > 0
              ? `Detecting… ${confidencePct}%`
              : 'Point at a trash item'}
      </Text>
      <Pressable
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [
          styles.btn,
          ready && styles.btnReady,
          pressed && styles.btnPressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color="#0a0a0a" />
        ) : (
          <View style={[styles.inner, ready && styles.innerReady]} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 3,
  },
  btn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReady: {
    borderColor: '#22c55e',
  },
  btnPressed: {
    transform: [{ scale: 0.95 }],
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  innerReady: {
    backgroundColor: '#22c55e',
  },
});
