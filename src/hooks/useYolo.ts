import { useEffect, useRef, useState } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import type { Detection } from '../types'
import { trashClassForName } from '../services/cocoClasses'
import { DETECTION_CONFIDENCE_THRESHOLD } from '../services/detection'

const FRAME_SKIP = 5

export function useYolo(videoRef: React.RefObject<HTMLVideoElement>) {
  const [detections, setDetections] = useState<Detection[]>([])
  const [bestConfidence, setBestConfidence] = useState(0)
  const [modelLoading, setModelLoading] = useState(true)
  const [modelError, setModelError] = useState<Error | null>(null)
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const rafRef = useRef<number>(0)
  const frameCountRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
            // Improve lighting and contrast before inference
            ctx.filter = 'contrast(1.2) brightness(1.1)'
            // Resize to 640x640 consistently
            ctx.drawImage(video, 0, 0, 640, 640)

            const preds = await modelRef.current.detect(cvs)
            const dets: Detection[] = preds
              .filter((p) => p.score >= DETECTION_CONFIDENCE_THRESHOLD)
              .map((p) => ({
                // Hard constraint: If confidence < 0.7 -> force unknown
                class: p.score < 0.7 ? 'unknown' : trashClassForName(p.class),
                confidence: p.score,
                bbox: {
                  x: p.bbox[0] / 640,
                  y: p.bbox[1] / 640,
                  width: p.bbox[2] / 640,
                  height: p.bbox[3] / 640,
                },
              }))

            setDetections(dets)
            setBestConfidence(dets.reduce((m, d) => Math.max(m, d.confidence), 0))
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

  return { detections, bestConfidence, modelLoading, modelError }
}
