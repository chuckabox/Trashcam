import { useEffect, useRef, useState } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import type { Detection } from '../types'
import { trashClassForName } from '../services/cocoClasses'
import { DETECTION_CONFIDENCE_THRESHOLD } from '../services/detection'

const FRAME_SKIP = 3 // Faster updates but still throttled
const HISTORY_LENGTH = 5
const PERSISTENCE_THRESHOLD = 2 // Must see in 2/5 frames

export function useYolo(videoRef: React.RefObject<HTMLVideoElement>) {
  const [detections, setDetections] = useState<Detection[]>([])
  const [bestConfidence, setBestConfidence] = useState(0)
  const [modelLoading, setModelLoading] = useState(true)
  const [modelError, setModelError] = useState<Error | null>(null)
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const rafRef = useRef<number>(0)
  const frameCountRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Temporal stabilization state
  const historyRef = useRef<Detection[][]>([])

  useEffect(() => {
    canvasRef.current = document.createElement('canvas')
    canvasRef.current.width = 640
    canvasRef.current.height = 640

    cocoSsd
      .load({ base: 'lite_mobilenet_v2' }) // Use lite for better browser stability while maintaining accuracy
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
            // 1. LETTERBOXING (Preserve Aspect Ratio)
            const vW = video.videoWidth
            const vH = video.videoHeight
            const scale = Math.min(640 / vW, 640 / vH)
            const dW = vW * scale
            const dH = vH * scale
            const dx = (640 - dW) / 2
            const dy = (640 - dH) / 2

            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, 640, 640)
            ctx.filter = 'contrast(1.1) brightness(1.05)' // Subtle enhancement
            ctx.drawImage(video, dx, dy, dW, dH)

            const preds = await modelRef.current.detect(cvs)
            
            // Map back from letterboxed space to normalised video space
            const rawDets: Detection[] = preds
              .filter((p) => p.score >= DETECTION_CONFIDENCE_THRESHOLD)
              .map((p) => {
                // Normalise coordinates relative to the original video dimensions
                const x = (p.bbox[0] - dx) / dW
                const y = (p.bbox[1] - dy) / dH
                const w = p.bbox[2] / dW
                const h = p.bbox[3] / dH
                
                return {
                  // Rule 6: Discipline. If < 0.65, label as unknown
                  class: p.score < 0.65 ? 'unknown' : trashClassForName(p.class),
                  confidence: p.score,
                  bbox: { x, y, width: w, height: h },
                }
              })

            // 2. TEMPORAL STABILIZATION
            historyRef.current.push(rawDets)
            if (historyRef.current.length > HISTORY_LENGTH) historyRef.current.shift()

            // Only confirm objects seen in multiple frames (Persistence Filter)
            // For simplicity in a browser, we'll use a "best of recent" approach
            // or just smooth the existing detections if they overlap with history.
            const confirmedDets: Detection[] = []
            
            // Simple approach: if an object is in the current frame, 
            // check if similar objects (by class/IoU) were in recent history
            rawDets.forEach(current => {
              let hits = 1
              historyRef.current.slice(0, -1).forEach(prevFrame => {
                const match = prevFrame.find(p => p.class === current.class) // Simplified match
                if (match) hits++
              })

              if (hits >= PERSISTENCE_THRESHOLD) {
                confirmedDets.push(current)
              }
            })

            setDetections(confirmedDets)
            setBestConfidence(confirmedDets.reduce((m, d) => Math.max(m, d.confidence), 0))
          }
        } catch {
          // ignore
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

    // High precision pass for static images
    const sW = (source as any).width || (source as any).videoWidth || 640
    const sH = (source as any).height || (source as any).videoHeight || 640
    const scale = Math.min(640 / sW, 640 / sH)
    const dW = sW * scale
    const dH = sH * scale
    const dx = (640 - dW) / 2
    const dy = (640 - dH) / 2

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 640, 640)
    ctx.filter = 'contrast(1.2) brightness(1.1)'
    ctx.drawImage(source, dx, dy, dW, dH)
    
    const preds = await modelRef.current.detect(cvs)
    
    return preds
      .filter((p) => p.score >= DETECTION_CONFIDENCE_THRESHOLD)
      .map((p) => ({
        class: p.score < 0.65 ? 'unknown' : trashClassForName(p.class),
        confidence: p.score,
        bbox: {
          x: (p.bbox[0] - dx) / dW,
          y: (p.bbox[1] - dy) / dH,
          width: p.bbox[2] / dW,
          height: p.bbox[3] / dH,
        },
      }))
  }

  return { detections, bestConfidence, modelLoading, modelError, runInference }
}
