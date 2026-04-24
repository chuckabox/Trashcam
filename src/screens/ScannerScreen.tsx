import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useYolo } from '../hooks/useYolo'
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay'
import { SNAP_CONFIDENCE_THRESHOLD } from '../services/detection'
import { lookup } from '../services/degradation'
import { saveScan } from '../services/storage'
import type { ScanResult } from '../types'
import { Button } from '../components/ui/button'

export default function ScannerScreen() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [permError, setPermError] = useState(false)
  const [busy, setBusy] = useState(false)

  const { detections, bestConfidence, modelLoading, modelError } = useYolo(videoRef)
  const ready = bestConfidence >= SNAP_CONFIDENCE_THRESHOLD

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => setPermError(true))

    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const handleSnap = useCallback(async () => {
    if (busy || !videoRef.current || !detections.length) return
    const top = [...detections].sort((a, b) => b.confidence - a.confidence)[0]
    if (!top) return

    setBusy(true)
    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')!.drawImage(video, 0, 0)
      const photoUri = canvas.toDataURL('image/jpeg', 0.8)

      const info = lookup(top.class)
      const scan: ScanResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        photoUri,
        detection: top,
        info,
      }
      await saveScan(scan)
      navigate('/results', { state: { scan } })
    } finally {
      setBusy(false)
    }
  }, [busy, detections, navigate])

  if (permError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-center text-base text-foreground">
          Camera access needed. Allow camera permission and reload.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        muted
      />

      <BoundingBoxOverlay detections={detections} />

      {/* Top nav */}
      <div className="absolute inset-x-0 top-0 flex justify-end gap-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/diary')}
          className="border-white/30 bg-black/50 text-white hover:bg-black/70"
        >
          Diary
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="border-white/30 bg-black/50 text-white hover:bg-black/70"
        >
          Dashboard
        </Button>
      </div>

      {/* Model status */}
      {modelLoading && (
        <div className="absolute inset-x-0 top-20 flex justify-center">
          <div className="rounded-full bg-black/70 px-4 py-2">
            <span className="text-sm text-white">
              {modelError ? `Model error: ${String(modelError)}` : 'Loading detection model…'}
            </span>
          </div>
        </div>
      )}

      {/* Snap controls */}
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
        {bestConfidence > 0 && (
          <div
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              ready ? 'bg-primary text-black' : 'bg-yellow-400 text-black'
            }`}
          >
            {Math.round(bestConfidence * 100)}%
          </div>
        )}
        <button
          onClick={handleSnap}
          disabled={busy || modelLoading || !ready}
          aria-label="Snap photo"
          className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all
            ${ready ? 'border-primary bg-primary/20 hover:bg-primary/30 active:scale-95' : 'border-white/40 bg-white/10'}
            disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span className="text-3xl">{busy ? '⏳' : '📸'}</span>
        </button>
        <p className="text-xs text-white/60">
          {modelLoading
            ? 'Loading model…'
            : ready
              ? 'Tap to snap'
              : 'Point camera at trash to detect'}
        </p>
      </div>
    </div>
  )
}
