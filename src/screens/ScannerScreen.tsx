import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useYolo } from '../hooks/useYolo'
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay'
import { SNAP_CONFIDENCE_THRESHOLD } from '../services/detection'
import { lookup } from '../services/degradation'
import { saveScan } from '../services/storage'
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

function CameraActive({ stream, navigate }: { stream: MediaStream; navigate: ReturnType<typeof useNavigate> }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [processingUpload, setProcessingUpload] = useState(false)

  const { detections, bestConfidence, modelLoading, modelError, runInference } = useYolo(videoRef)
  const ready = bestConfidence >= SNAP_CONFIDENCE_THRESHOLD

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  const handleSnap = useCallback(async () => {
    if (busy || !videoRef.current || !detections.length) return
    const sorted = [...detections].sort((a, b) => b.confidence - a.confidence)
    const top = sorted[0]
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
        detections: sorted,
        info,
      }
      await saveScan(scan)
      navigate('/results', { state: { scan } })
    } finally {
      setBusy(false)
    }
  }, [busy, detections, navigate])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || modelLoading) return

    setProcessingUpload(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string
        const img = new Image()
        img.onload = async () => {
          const results = await runInference(img)
          const sorted = [...results].sort((a, b) => b.confidence - a.confidence)
          const top = sorted[0]
          
          const scan: ScanResult = {
            id: `upload-${Date.now()}`,
            timestamp: Date.now(),
            photoUri: dataUrl,
            detections: sorted.length > 0 ? sorted : [{ class: 'unknown', confidence: 0, bbox: { x: 0, y: 0, width: 1, height: 1 } }],
            info: lookup(top?.class || 'unknown'),
          }
          await saveScan(scan)
          navigate('/results', { state: { scan } })
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setProcessingUpload(false)
    }
  }

  const pct = Math.round(bestConfidence * 100)

  return (
    <div className="relative h-full w-full overflow-hidden bg-background touch-none">
      {/* Camera feed */}
      <video ref={videoRef} className="h-full w-full object-cover opacity-90" autoPlay playsInline muted />

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.1)_100%)]" />

      {/* Bounding boxes overlay */}
      <BoundingBoxOverlay detections={detections} />

      {/* Targeting reticle */}
      <div className="pointer-events-none absolute inset-0">
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
      </div>

      {/* Model loading or processing banner */}
      {(modelLoading || processingUpload) && (
        <div className="absolute inset-x-0 top-14 flex justify-center z-50">
          <div className="flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 shadow-sm">
            <span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
              {processingUpload ? 'Analysing' : 'Syncing Model'}
            </span>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-24 pt-6 gap-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-all hover:bg-secondary active:scale-90"
            aria-label="Upload photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>

          {/* Snap button */}
          <button
            onClick={handleSnap}
            disabled={busy || modelLoading || !ready}
            aria-label="Snap photo"
            className="relative flex h-20 w-20 items-center justify-center disabled:opacity-40 transition-transform active:scale-95"
          >
            {/* Outer ring - Static */}
            <span className={cn(
              'absolute inset-0 rounded-full border-2',
              ready ? 'border-primary' : 'border-muted-foreground/20'
            )} />
            {/* Inner */}
            <span className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full border border-border shadow-md transition-all duration-300',
              ready ? 'bg-primary scale-100' : 'bg-white'
            )}>
              {busy ? (
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke={ready ? '#FFFFFF' : '#6b7280'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              )}
            </span>
          </button>
          
          <div className="w-12" /> {/* Spacer */}
        </div>

        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">
          {modelLoading ? 'Syncing sensors' : ready ? 'Ready for capture' : 'Aim at material'}
        </p>
      </div>
    </div>
  )
}

// ── Onboarding Modal ─────────────────────────────────────────────────────────

function OnboardingModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-xs rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
        <h2 className="text-2xl font-bold text-foreground">Welcome!</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Point your camera at some waste to see where it goes. You can also upload a photo from your gallery.
        </p>
        <button
          onClick={onDismiss}
          className="mt-8 w-full rounded-xl bg-primary py-3.5 font-sans text-sm font-semibold tracking-wide text-white transition-all hover:bg-primary/90 active:scale-95"
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

  useEffect(() => {
    const onboarded = localStorage.getItem('trashcams:onboarded')
    if (!onboarded) setShowOnboarding(true)

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => { streamRef.current = stream; setPermState('granted') })
      .catch(() => setPermState('denied'))
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const dismissOnboarding = () => {
    localStorage.setItem('trashcams:onboarded', 'true')
    setShowOnboarding(false)
  }

  if (permState === 'denied') return <PermDenied navigate={navigate} />
  if (permState === 'pending') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 animate-blink">Starting camera</span>
      </div>
    )
  }
  
  return (
    <>
      <CameraActive stream={streamRef.current!} navigate={navigate} />
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
    </>
  )
}
