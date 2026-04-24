import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useYolo } from '../hooks/useYolo'
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay'
import { SNAP_CONFIDENCE_THRESHOLD } from '../services/detection'
import { lookup } from '../services/degradation'
import { saveScan } from '../services/storage'
import type { ScanResult } from '../types'

// ── Permission-denied screen ─────────────────────────────────────────────────

function PermDenied({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background px-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" className="text-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Camera access denied</p>
        <p className="text-sm text-muted-foreground">Allow camera access in browser settings to scan items.</p>
      </div>
    </div>
  )
}

// ── Active camera view ────────────────────────────────────────────────────────

function CameraActive({ stream, navigate }: { stream: MediaStream; navigate: ReturnType<typeof useNavigate> }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [busy, setBusy] = useState(false)

  const { detections, bestConfidence, modelLoading, modelError } = useYolo(videoRef)
  const ready = bestConfidence >= SNAP_CONFIDENCE_THRESHOLD

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

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

  const pct = Math.round(bestConfidence * 100)

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Camera feed */}
      <video ref={videoRef} className="h-full w-full object-cover opacity-90" autoPlay playsInline muted />

      {/* Dark vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      {/* Bounding boxes */}
      <BoundingBoxOverlay detections={detections} />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-blink" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Live</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">BioScan</span>
      </div>

      {/* Model loading banner */}
      {modelLoading && (
        <div className="absolute inset-x-0 top-14 flex justify-center">
          <div className="flex items-center gap-2 rounded border border-border bg-background/80 px-4 py-2 backdrop-blur-sm">
            <span className="h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {modelError ? 'Model error' : 'Loading model'}
            </span>
          </div>
        </div>
      )}

      {/* Targeting reticle */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-72 w-72 overflow-hidden">
          {/* Corner brackets */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
            <span
              key={pos}
              className={[
                'absolute h-8 w-8 transition-colors duration-300',
                pos === 'tl' ? 'top-0 left-0 border-t-2 border-l-2' : '',
                pos === 'tr' ? 'top-0 right-0 border-t-2 border-r-2' : '',
                pos === 'bl' ? 'bottom-0 left-0 border-b-2 border-l-2' : '',
                pos === 'br' ? 'bottom-0 right-0 border-b-2 border-r-2' : '',
                ready ? 'border-primary shadow-[0_0_8px_rgba(181,242,61,0.6)]' : 'border-white/30',
              ].join(' ')}
            />
          ))}

          {/* Scan line */}
          {!modelLoading && (
            <div
              className="absolute inset-x-4 h-px animate-scan"
              style={{
                background: ready
                  ? 'linear-gradient(90deg, transparent, rgba(181,242,61,0.7), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
            />
          )}

          {/* Center crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-5 w-5">
              <span className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 ${ready ? 'bg-primary/60' : 'bg-white/20'}`} />
              <span className={`absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 ${ready ? 'bg-primary/60' : 'bg-white/20'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-28 pt-6 gap-5">
        {/* Confidence pill */}
        <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm transition-all ${
          ready
            ? 'border-primary/40 bg-primary/10'
            : bestConfidence > 0
            ? 'border-yellow-400/30 bg-yellow-400/5'
            : 'border-border bg-background/60'
        }`}>
          {bestConfidence > 0 && (
            <span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-primary animate-pulse' : 'bg-yellow-400'}`} />
          )}
          <span className={`font-mono text-xs ${ready ? 'text-primary' : bestConfidence > 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
            {bestConfidence > 0 ? `${pct}% confidence` : 'No detection'}
          </span>
        </div>

        {/* Snap button */}
        <button
          onClick={handleSnap}
          disabled={busy || modelLoading || !ready}
          aria-label="Snap photo"
          className="relative flex h-20 w-20 items-center justify-center disabled:opacity-40 transition-transform active:scale-95"
        >
          {/* Pulse ring */}
          {ready && (
            <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
          )}
          {/* Outer ring */}
          <span className={`absolute inset-1 rounded-full border-2 transition-colors ${ready ? 'border-primary' : 'border-white/20'}`} />
          {/* Inner */}
          <span className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${ready ? 'bg-primary' : 'bg-white/8'}`}>
            {busy ? (
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={ready ? '#060a08' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            )}
          </span>
        </button>

        <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          {modelLoading ? 'Loading model' : ready ? 'Tap to capture' : 'Aim at waste item'}
        </p>
      </div>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

type PermState = 'pending' | 'granted' | 'denied'

export default function ScannerScreen() {
  const navigate = useNavigate()
  const streamRef = useRef<MediaStream | null>(null)
  const [permState, setPermState] = useState<PermState>('pending')

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => { streamRef.current = stream; setPermState('granted') })
      .catch(() => setPermState('denied'))
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  if (permState === 'denied') return <PermDenied navigate={navigate} />
  if (permState === 'pending') {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30 animate-blink">Starting camera</span>
      </div>
    )
  }
  return <CameraActive stream={streamRef.current!} navigate={navigate} />
}
