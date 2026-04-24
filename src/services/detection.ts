import type { Detection } from '../types';
import { allItems } from './degradation';

/**
 * YOLO detection stub.
 *
 * Real integration path:
 *   1. Install `react-native-fast-tflite` (requires `expo prebuild`).
 *   2. Drop `yolov8n_trash.tflite` into `assets/models/`.
 *   3. Replace `mockDetect` with real inference:
 *        const model = await loadTensorflowModel(require('../../assets/models/yolov8n_trash.tflite'));
 *        const output = model.runSync([inputTensor]);
 *        return parseYoloOutput(output);
 *
 * See README.md "YOLO Model Swap-In" for full instructions.
 */

const CLASSES = allItems().map((i) => i.yoloClass).filter((c) => c !== 'unknown');

export function mockDetect(): Detection[] {
  const num = Math.random() < 0.3 ? 0 : Math.random() < 0.8 ? 1 : 2;
  const detections: Detection[] = [];
  for (let i = 0; i < num; i++) {
    const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
    const confidence = 0.5 + Math.random() * 0.5;
    detections.push({
      class: cls,
      confidence,
      bbox: {
        x: 0.1 + Math.random() * 0.3,
        y: 0.1 + Math.random() * 0.3,
        width: 0.2 + Math.random() * 0.3,
        height: 0.2 + Math.random() * 0.3,
      },
    });
  }
  return detections;
}

export const DETECTION_CONFIDENCE_THRESHOLD = 0.6;
export const SNAP_CONFIDENCE_THRESHOLD = 0.8;
