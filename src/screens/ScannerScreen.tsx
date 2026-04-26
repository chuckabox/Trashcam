import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useYolo } from '../hooks/useYolo'
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay'
import { SNAP_CONFIDENCE_THRESHOLD } from '../services/detection'
import { lookup } from '../services/degradation'
import { saveScan, loadScans, MAX_SCANS } from '../services/storage'
import { cn } from '../lib/utils'
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

function CameraActive({ stream, navigate, onFlip }: { stream: MediaStream; navigate: ReturnType<typeof useNavigate>; onFlip: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [busy, setBusy] = useState(false)
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [snapError, setSnapError] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    loadScans().then((scans) => {
      setLatestPhoto(scans[0]?.photoUri ?? null)
      setScanCount(scans.length)
    })
  }, [])

  const { detections, bestConfidence, modelLoading, modelError, runInference } = useYolo(videoRef)
  const [ready, setReady] = useState(false)

  // Mirror latest detections in a ref so the snap handler isn't stale
  const detectionsRef = useRef(detections)
  useEffect(() => { detectionsRef.current = detections }, [detections])

  // Hysteresis - enter ready at threshold, leave only well below to stop flicker
  useEffect(() => {
    if (!ready && bestConfidence >= SNAP_CONFIDENCE_THRESHOLD) setReady(true)
    else if (ready && bestConfidence < SNAP_CONFIDENCE_THRESHOLD - 0.15) setReady(false)
  }, [bestConfidence, ready])

  useEffect(() => {
    if (videoRef.current) {
      setVideoReady(false)
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleSnap = useCallback(async () => {
    if (busy || !videoRef.current) return
    const liveDetections = detectionsRef.current
    if (!liveDetections.length) {
      setSnapError('No object detected — aim again.')
      return
    }

    setBusy(true)
    setSnapError(null)
    try {
      const video = videoRef.current
      const srcW = video.videoWidth
      const srcH = video.videoHeight
      if (!srcW || !srcH) throw new Error(`Camera not ready (${srcW}x${srcH}). Try again.`)

      // Downscale so saved photos stay small (localStorage quota is ~5MB total)
      const MAX_DIM = 540
      const scale = Math.min(1, MAX_DIM / Math.max(srcW, srcH))
      const W = Math.round(srcW * scale)
      const H = Math.round(srcH * scale)
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0, W, H)

      // Burn detection boxes + labels into the photo
      const stroke = Math.max(3, Math.round(Math.min(W, H) * 0.006))
      const fontSize = Math.max(14, Math.round(Math.min(W, H) * 0.028))
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.textBaseline = 'alphabetic'

      for (const d of liveDetections) {
        const info = lookup(d.class)
        const strong = d.confidence >= 0.6
        const color = strong ? '#10BC79' : '#facc15'
        const x = d.bbox.x * W
        const y = d.bbox.y * H
        const w = d.bbox.width * W
        const h = d.bbox.height * H

        // Box outline
        ctx.lineWidth = stroke
        ctx.strokeStyle = color
        ctx.strokeRect(x, y, w, h)

        // Label
        const text = `${info.emoji} ${info.displayName} ${Math.round(d.confidence * 100)}%`
        const padX = Math.round(fontSize * 0.5)
        const padY = Math.round(fontSize * 0.35)
        const textW = ctx.measureText(text).width
        const labelH = fontSize + padY * 2
        let labelY = y - labelH
        if (labelY < 0) labelY = y // flip below the top edge if it would clip
        ctx.fillStyle = color
        ctx.fillRect(x, labelY, textW + padX * 2, labelH)
        ctx.fillStyle = '#000000'
        ctx.fillText(text, x + padX, labelY + labelH - padY)
      }

      const photoUri = canvas.toDataURL('image/jpeg', 0.7)

      const scan: ScanResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        photoUri,
        detections: liveDetections,
        items: liveDetections.map(d => lookup(d.class)),
      }
      await saveScan(scan)
      const after = await loadScans()
      setScanCount(after.length)
      navigate('/results', { state: { scan } })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSnapError(msg)
    } finally {
      setBusy(false)
    }
  }, [busy, navigate])

  const pct = Math.round(bestConfidence * 100)

  return (
    <div className="relative h-full w-full overflow-hidden bg-background touch-none">
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover opacity-90"
        autoPlay
        playsInline
        muted
        onPlaying={() => setVideoReady(true)}
        onLoadedData={() => setVideoReady(true)}
      />

      {/* Loading veil until first frame - pointer-events-none so it never blocks taps */}
      {!videoReady && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 animate-blink">Starting camera</span>
        </div>
      )}

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.1)_100%)]" />

      {/* Bounding boxes overlay */}
      <BoundingBoxOverlay detections={detections} />

      {/* Targeting reticle - centered between top of screen and buttons row */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[230px]">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2">
          {/* Corner brackets */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
            <span
              key={pos}
              className={cn(
                'absolute h-8 w-8 transition-colors duration-300',
                pos === 'tl' && 'top-0 left-0 border-t-2 border-l-2',
                pos === 'tr' && 'top-0 right-0 border-t-2 border-r-2',
                pos === 'bl' && 'bottom-0 left-0 border-b-2 border-l-2',
                pos === 'br' && 'bottom-0 right-0 border-b-2 border-r-2',
                ready ? 'border-primary' : 'border-foreground/30'
              )}
            />
          ))}

          {/* Scan line */}
          {!modelLoading && (
            <div
              className="absolute inset-x-4 h-px animate-scan"
              style={{
                background: ready
                  ? 'linear-gradient(90deg, transparent, rgba(16,188,121,0.5), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(15,23,19,0.1), transparent)',
              }}
            />
          )}

          {/* Center crosshair */}
          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2">
            <span className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 ${ready ? 'bg-primary/40' : 'bg-muted-foreground/20'}`} />
            <span className={`absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 ${ready ? 'bg-primary/40' : 'bg-muted-foreground/20'}`} />
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-blink" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">Live</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-md border px-3 py-1.5 shadow-sm',
            scanCount >= MAX_SCANS
              ? 'border-red-300 bg-red-50'
              : scanCount >= MAX_SCANS * 0.85
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-border bg-white',
          )}
        >
          <span
            className={cn(
              'font-mono text-[10px] font-bold uppercase tracking-widest',
              scanCount >= MAX_SCANS ? 'text-red-700' : 'text-foreground',
            )}
          >
            {scanCount}/{MAX_SCANS}
          </span>
        </div>
      </div>

      {/* Model loading placeholder or silent state */}

      {/* Snap error toast */}
      {snapError && (
        <div className="absolute inset-x-0 bottom-[210px] z-30 flex justify-center px-6">
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-700">{snapError}</p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-24 pt-6 gap-6">
        {/* Action Buttons - album / shutter / flip */}
        <div className="flex w-[280px] items-center justify-between">
          {/* Album (rounded square) - shows latest scan thumbnail if available */}
          <button
            onClick={() => navigate('/album')}
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:bg-secondary active:scale-90"
            aria-label="View Album"
          >
            {latestPhoto ? (
              <img src={latestPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>

          {/* Shutter - iOS-style ring directly hugging inner disc */}
          <button
            onClick={handleSnap}
            disabled={busy || modelLoading || !ready}
            aria-label="Snap photo"
            className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full disabled:opacity-40 transition-transform active:scale-95"
          >
            {/* Outer ring */}
            <span className={cn(
              'absolute inset-0 rounded-full border-[3px] transition-colors duration-300',
              ready ? 'border-primary' : 'border-foreground/80'
            )} />
            {/* Inner disc - sits inside ring with hairline gap */}
            <span className={cn(
              'flex h-[60px] w-[60px] items-center justify-center rounded-full transition-all duration-200',
              ready ? 'bg-primary' : 'bg-white',
              busy && 'scale-90'
            )}>
              {busy && (
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              )}
            </span>
          </button>

          {/* Flip camera (rounded square - matches gallery) */}
          <button
            onClick={onFlip}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white shadow-sm transition-all hover:bg-secondary active:scale-90"
            aria-label="Flip camera"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
            </svg>
          </button>
        </div>

        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">
          {ready ? 'Ready for capture' : 'Aim at material'}
        </p>
      </div>
    </div>
  )
}

// ── Onboarding Modal ─────────────────────────────────────────────────────────

function OnboardingModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-[340px] rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
        <h2 className="text-2xl font-bold text-foreground">Ready?</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Point your camera at your waste or recyclable items (even if you don't know what they are!) and find out where they belong.
        </p>
        <button
          onClick={onDismiss}
          className="mt-8 w-full rounded-xl bg-primary py-4 font-sans text-sm font-semibold tracking-wide text-white transition-all hover:bg-primary/90 active:scale-95"
        >
          Start Scanning
        </button>
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
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const onboarded = localStorage.getItem('trashcams:onboarded')
    if (!onboarded) setShowOnboarding(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        
        const oldStream = streamRef.current
        streamRef.current = s
        setStream(s)
        setPermState('granted')

        // Stop old tracks after the new stream is set to avoid cut-to-black
        if (oldStream) {
          oldStream.getTracks().forEach((t) => t.stop())
        }
      })
      .catch(() => {
        if (!cancelled) setPermState('denied')
      })

    return () => {
      cancelled = true
    }
  }, [facingMode])

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])

  const dismissOnboarding = () => {
    localStorage.setItem('trashcams:onboarded', 'true')
    setShowOnboarding(false)
  }

  const handleFlip = () => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))

  if (permState === 'denied') return <PermDenied navigate={navigate} />
  if (permState === 'pending' || !stream) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 animate-blink">Starting camera</span>
      </div>
    )
  }

  return (
    <>
      <CameraActive stream={stream} navigate={navigate} onFlip={handleFlip} />
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
    </>
  )
}
