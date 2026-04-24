import { useEffect, useRef, useState } from 'react';
import type { Detection } from '../types';
import { DETECTION_CONFIDENCE_THRESHOLD, mockDetect } from '../services/detection';

const FRAME_INTERVAL_MS = 200;

interface UseYoloOpts {
  enabled: boolean;
}

export function useYolo({ enabled }: UseYoloOpts) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [bestConfidence, setBestConfidence] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDetections([]);
      setBestConfidence(0);
      return;
    }

    timerRef.current = setInterval(() => {
      const results = mockDetect().filter(
        (d) => d.confidence >= DETECTION_CONFIDENCE_THRESHOLD,
      );
      setDetections(results);
      setBestConfidence(results.reduce((max, d) => Math.max(max, d.confidence), 0));
    }, FRAME_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled]);

  return { detections, bestConfidence };
}
