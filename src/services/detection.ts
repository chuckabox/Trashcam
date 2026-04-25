import type { Detection } from '../types'
import { trashClassFor } from './cocoClasses'

export const DETECTION_CONFIDENCE_THRESHOLD = 0.4
export const SNAP_CONFIDENCE_THRESHOLD = 0.6
export const NMS_IOU_THRESHOLD = 0.5

export const MODEL_INPUT_SIZE = 640
export const NUM_CLASSES = 80

export function parseYoloOutput(
  raw: Float32Array | Int8Array | Uint8Array | number[],
  confThreshold: number = DETECTION_CONFIDENCE_THRESHOLD,
): Detection[] {
  const total = raw.length
  const stride = 4 + NUM_CLASSES
  if (total % stride !== 0) return []
  const numAnchors = total / stride

  const transposed = numAnchors === 8400

  const candidates: Detection[] = []

  for (let i = 0; i < numAnchors; i++) {
    let bestCls = -1
    let bestScore = 0
    for (let c = 0; c < NUM_CLASSES; c++) {
      const idx = transposed ? i * stride + 4 + c : (4 + c) * numAnchors + i
      const s = raw[idx] as number
      if (s > bestScore) {
        bestScore = s
        bestCls = c
      }
    }
    if (bestScore < confThreshold || bestCls < 0) continue

    const cx = raw[transposed ? i * stride + 0 : 0 * numAnchors + i] as number
    const cy = raw[transposed ? i * stride + 1 : 1 * numAnchors + i] as number
    const w = raw[transposed ? i * stride + 2 : 2 * numAnchors + i] as number
    const h = raw[transposed ? i * stride + 3 : 3 * numAnchors + i] as number

    const norm = cx > 1.5 ? 1 / MODEL_INPUT_SIZE : 1

    const x = (cx - w / 2) * norm
    const y = (cy - h / 2) * norm
    const ww = w * norm
    const hh = h * norm

    const trashClass = trashClassFor(bestCls)

    candidates.push({
      class: trashClass,
      confidence: bestScore,
      bbox: { x, y, width: ww, height: hh },
    })
  }

  return nonMaxSuppression(candidates, NMS_IOU_THRESHOLD)
}

export function nonMaxSuppression(boxes: Detection[], iouThreshold: number): Detection[] {
  const sorted = boxes.slice().sort((a, b) => b.confidence - a.confidence)
  const kept: Detection[] = []
  const suppressed = new Array(sorted.length).fill(false)
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed[i]) continue
    kept.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed[j]) continue
      if (iou(sorted[i].bbox, sorted[j].bbox) > iouThreshold) {
        suppressed[j] = true
      }
    }
  }
  return kept
}

function iou(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): number {
  const ax2 = a.x + a.width
  const ay2 = a.y + a.height
  const bx2 = b.x + b.width
  const by2 = b.y + b.height
  const ix1 = Math.max(a.x, b.x)
  const iy1 = Math.max(a.y, b.y)
  const ix2 = Math.min(ax2, bx2)
  const iy2 = Math.min(ay2, by2)
  const iw = Math.max(0, ix2 - ix1)
  const ih = Math.max(0, iy2 - iy1)
  const inter = iw * ih
  const union = a.width * a.height + b.width * b.height - inter
  return union <= 0 ? 0 : inter / union
}
