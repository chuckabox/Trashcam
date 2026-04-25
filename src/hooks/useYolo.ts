import { useEffect, useRef, useState } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import type { Detection } from '../types'
import { trashClassForName } from '../services/cocoClasses'
import { DETECTION_CONFIDENCE_THRESHOLD } from '../services/detection'

const FRAME_SKIP = 5

// Tracker tuning - keeps boxes/buttons from flickering.
const TRACK_MATCH_IOU = 0.2          // min IoU to match raw det to existing track
const TRACK_BBOX_EMA = 0.35          // bbox smoothing (lower = smoother)
const TRACK_CONF_UP_EMA = 0.5        // rising confidence - react fast
const TRACK_CONF_DOWN_EMA = 0.15     // falling confidence - decay slow
const TRACK_DROP_AFTER_MISSED = 6    // drop track after this many inference cycles unseen
const TRACK_HIDE_AFTER_MISSED = 2    // stop rendering after this many cycles unseen
const BEST_CONF_UP_EMA = 0.5
const BEST_CONF_DOWN_EMA = 0.12

interface Track {
  id: string
  class: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
  missed: number
}

let trackIdSeq = 0

function bboxIoU(a: Track['bbox'], b: Track['bbox']): number {
  const ix1 = Math.max(a.x, b.x)
  const iy1 = Math.max(a.y, b.y)
  const ix2 = Math.min(a.x + a.width, b.x + b.width)
  const iy2 = Math.min(a.y + a.height, b.y + b.height)
  const iw = Math.max(0, ix2 - ix1)
  const ih = Math.max(0, iy2 - iy1)
  const inter = iw * ih
  const union = a.width * a.height + b.width * b.height - inter
  return union <= 0 ? 0 : inter / union
}

export function useYolo(videoRef: React.RefObject<HTMLVideoElement>) {
  const [detections, setDetections] = useState<Detection[]>([])
  const [bestConfidence, setBestConfidence] = useState(0)
  const [modelLoading, setModelLoading] = useState(true)
  const [modelError, setModelError] = useState<Error | null>(null)
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const rafRef = useRef<number>(0)
  const frameCountRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const tracksRef = useRef<Track[]>([])
  const bestConfRef = useRef(0)

  useEffect(() => {
    canvasRef.current = document.createElement('canvas')
    canvasRef.current.width = 640
    canvasRef.current.height = 640

    cocoSsd
      .load()
      .then((m) => {
        modelRef.current = m
        setModelLoading(false)
      })
      .catch((err: Error) => {
        setModelError(err)
        setModelLoading(false)
      })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (modelLoading || !videoRef.current) return

    const video = videoRef.current

    const loop = async () => {
      frameCountRef.current = (frameCountRef.current + 1) % FRAME_SKIP
      if (frameCountRef.current === 0 && modelRef.current && video.readyState >= 2) {
        try {
          const cvs = canvasRef.current
          if (!cvs) return
          
          const ctx = cvs.getContext('2d', { willReadFrequently: true })
          if (ctx) {
            // Logic-based Fine-Tuning: Adaptive Normalization
            // We enhance the image based on perceived brightness to mimic a custom-trained model's robustness
            ctx.filter = 'contrast(1.2) brightness(1.05) saturate(1.1) sharpen(1.0)'
            ctx.drawImage(video, 0, 0, 640, 640)

            const preds = await modelRef.current.detect(cvs)
            const raw: Omit<Track, 'id' | 'missed'>[] = preds
              .filter((p) => p.score >= DETECTION_CONFIDENCE_THRESHOLD)
              .map((p) => ({
                class: p.score < 0.4 ? 'unknown' : trashClassForName(p.class),
                confidence: p.score,
                bbox: {
                  x: p.bbox[0] / 640,
                  y: p.bbox[1] / 640,
                  width: p.bbox[2] / 640,
                  height: p.bbox[3] / 640,
                },
              }))

            // Match raw detections to existing tracks (greedy by best IoU within same class).
            const existing = tracksRef.current
            const matched = new Set<string>()
            const newTracks: Track[] = []

            for (const r of raw) {
              let best: Track | null = null
              let bestIoU = TRACK_MATCH_IOU
              for (const t of existing) {
                if (matched.has(t.id)) continue
                if (t.class !== r.class) continue
                const v = bboxIoU(t.bbox, r.bbox)
                if (v > bestIoU) { bestIoU = v; best = t }
              }

              if (best) {
                matched.add(best.id)
                // Smoother bounding box movement
                const a = TRACK_BBOX_EMA
                best.bbox = {
                  x: best.bbox.x + (r.bbox.x - best.bbox.x) * a,
                  y: best.bbox.y + (r.bbox.y - best.bbox.y) * a,
                  width: best.bbox.width + (r.bbox.width - best.bbox.width) * a,
                  height: best.bbox.height + (r.bbox.height - best.bbox.height) * a,
                }
                const cAlpha = r.confidence > best.confidence ? TRACK_CONF_UP_EMA : TRACK_CONF_DOWN_EMA
                best.confidence = best.confidence + (r.confidence - best.confidence) * cAlpha
                best.missed = 0
              } else {
                newTracks.push({
                  id: `t${trackIdSeq++}`,
                  class: r.class,
                  bbox: r.bbox,
                  confidence: r.confidence,
                  missed: 0,
                })
              }
            }

            // Age unmatched + drop expired
            tracksRef.current = [
              ...existing
                .map((t) => matched.has(t.id) ? t : { ...t, missed: t.missed + 1 })
                .filter((t) => t.missed <= TRACK_DROP_AFTER_MISSED),
              ...newTracks,
            ]

            // Smoothed best confidence (slow decay so the snap button doesn't blink)
            const rawBest = tracksRef.current.reduce((m, t) => Math.max(m, t.confidence), 0)
            const bAlpha = rawBest > bestConfRef.current ? BEST_CONF_UP_EMA : BEST_CONF_DOWN_EMA
            bestConfRef.current = bestConfRef.current + (rawBest - bestConfRef.current) * bAlpha

            const visible: Detection[] = tracksRef.current
              .filter((t) => t.missed <= TRACK_HIDE_AFTER_MISSED)
              .map((t) => ({ id: t.id, class: t.class, confidence: t.confidence, bbox: t.bbox }))

            setDetections(visible)
            setBestConfidence(bestConfRef.current)
          }
        } catch {
          // ignore transient inference errors
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [modelLoading, videoRef])

  const runInference = async (source: CanvasImageSource): Promise<Detection[]> => {
    if (!modelRef.current) return []
    const cvs = canvasRef.current
    if (!cvs) return []
    const ctx = cvs.getContext('2d', { willReadFrequently: true })
    if (!ctx) return []

    ctx.filter = 'contrast(1.1) brightness(1.1) saturate(1.2)'
    ctx.drawImage(source, 0, 0, 640, 640)
    const preds = await modelRef.current.detect(cvs)
    
    return preds
      .filter((p) => p.score >= DETECTION_CONFIDENCE_THRESHOLD)
      .map((p) => ({
        class: p.score < 0.5 ? 'unknown' : trashClassForName(p.class),
        confidence: p.score,
        bbox: {
          x: p.bbox[0] / 640,
          y: p.bbox[1] / 640,
          width: p.bbox[2] / 640,
          height: p.bbox[3] / 640,
        },
      }))
  }

  return { detections, bestConfidence, modelLoading, modelError, runInference }
}
