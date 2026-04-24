import type { Detection } from '../types';
import { trashClassFor } from './cocoClasses';

export const DETECTION_CONFIDENCE_THRESHOLD = 0.4;
export const SNAP_CONFIDENCE_THRESHOLD = 0.6;
export const NMS_IOU_THRESHOLD = 0.45;

export const MODEL_INPUT_SIZE = 640;
export const NUM_CLASSES = 80;

/**
 * Parse a raw YOLOv8 output tensor into Detection[].
 *
 * YOLOv8 detection head output (pre-NMS): [1, 84, 8400]
 *   - 84 = 4 (cx, cy, w, h) + 80 class scores
 *   - 8400 = number of anchor candidates
 *
 * Some TFLite exports transpose to [1, 8400, 84]. We auto-detect layout.
 *
 * Coordinates are normalized to the 640x640 input space — this function returns
 * them as 0..1 fractions of the input (same as our BoundingBox type expects).
 *
 * CALLABLE FROM WORKLETS — uses only primitive JS, no closures.
 */
export function parseYoloOutput(
  raw: Float32Array | Int8Array | Uint8Array | number[],
  confThreshold: number = DETECTION_CONFIDENCE_THRESHOLD,
): Detection[] {
  'worklet';

  const total = raw.length;
  const stride = 4 + NUM_CLASSES; // 84
  if (total % stride !== 0) return [];
  const numAnchors = total / stride;

  // Layout detection: [84, 8400] vs [8400, 84]
  const transposed = numAnchors === 8400;

  const candidates: Detection[] = [];

  for (let i = 0; i < numAnchors; i++) {
    // Gather class scores
    let bestCls = -1;
    let bestScore = 0;
    for (let c = 0; c < NUM_CLASSES; c++) {
      const idx = transposed ? i * stride + 4 + c : (4 + c) * numAnchors + i;
      const s = raw[idx] as number;
      if (s > bestScore) {
        bestScore = s;
        bestCls = c;
      }
    }
    if (bestScore < confThreshold || bestCls < 0) continue;

    const cx = raw[transposed ? i * stride + 0 : 0 * numAnchors + i] as number;
    const cy = raw[transposed ? i * stride + 1 : 1 * numAnchors + i] as number;
    const w = raw[transposed ? i * stride + 2 : 2 * numAnchors + i] as number;
    const h = raw[transposed ? i * stride + 3 : 3 * numAnchors + i] as number;

    // YOLOv8 outputs may be in pixel or normalized space. The ultralytics TFLite
    // export is normalized to [0, 1]. If values >1, divide by MODEL_INPUT_SIZE.
    const norm = cx > 1.5 ? 1 / MODEL_INPUT_SIZE : 1;

    const x = (cx - w / 2) * norm;
    const y = (cy - h / 2) * norm;
    const ww = w * norm;
    const hh = h * norm;

    const trashClass = trashClassFor(bestCls);
    if (trashClass === 'unknown') continue;

    candidates.push({
      class: trashClass,
      confidence: bestScore,
      bbox: { x, y, width: ww, height: hh },
    });
  }

  return nonMaxSuppression(candidates, NMS_IOU_THRESHOLD);
}

function nonMaxSuppression(boxes: Detection[], iouThreshold: number): Detection[] {
  'worklet';
  const sorted = boxes.slice();
  // Simple selection sort (worklet-safe; native sort closures can be flaky)
  for (let i = 0; i < sorted.length; i++) {
    let maxIdx = i;
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].confidence > sorted[maxIdx].confidence) maxIdx = j;
    }
    if (maxIdx !== i) {
      const tmp = sorted[i];
      sorted[i] = sorted[maxIdx];
      sorted[maxIdx] = tmp;
    }
  }

  const kept: Detection[] = [];
  const suppressed = new Array(sorted.length).fill(false);
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed[i]) continue;
    kept.push(sorted[i]);
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed[j]) continue;
      if (iou(sorted[i].bbox, sorted[j].bbox) > iouThreshold) {
        suppressed[j] = true;
      }
    }
  }
  return kept;
}

function iou(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): number {
  'worklet';
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);
  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const union = a.width * a.height + b.width * b.height - inter;
  return union <= 0 ? 0 : inter / union;
}
