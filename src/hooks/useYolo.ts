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

  useEffect(() => {
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
          const preds = await modelRef.current.detect(video)
          const dets: Detection[] = preds
            .filter((p) => {
              return p.score >= DETECTION_CONFIDENCE_THRESHOLD
            })
            .map((p) => ({
              class: trashClassForName(p.class),
              confidence: p.score,
              bbox: {
                x: p.bbox[0] / (video.videoWidth || 1),
                y: p.bbox[1] / (video.videoHeight || 1),
                width: p.bbox[2] / (video.videoWidth || 1),
                height: p.bbox[3] / (video.videoHeight || 1),
              },
            }))

          setDetections(dets)
          setBestConfidence(dets.reduce((m, d) => Math.max(m, d.confidence), 0))
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
