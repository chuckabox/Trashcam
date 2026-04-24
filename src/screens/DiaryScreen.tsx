import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearScans, loadScans } from '../services/storage'
import type { ScanResult } from '../types'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function DiaryScreen() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<ScanResult[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    const list = await loadScans()
    setScans(list)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleClear = () => {
    if (!window.confirm('Clear all scan history on this device?')) return
    clearScans().then(() => setScans([]))
  }

  if (scans.length === 0 && !refreshing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <span className="text-6xl">📔</span>
        <p className="text-xl font-bold text-foreground">No scans yet</p>
        <p className="text-sm text-muted-foreground">Your scanned items appear here.</p>
        <Button className="mt-2" onClick={() => navigate('/')}>
          Start Scanning
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Waste Diary ({scans.length})
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
              ← Scanner
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
        </div>

        {refreshing && scans.length === 0 ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-2">
            {scans.map((item) => (
              <button
                key={item.id}
                className="w-full text-left"
                onClick={() => navigate('/results', { state: { scan: item } })}
              >
                <Card className="flex items-center gap-3 p-3 hover:border-border/60 transition-colors">
                  {item.photoUri ? (
                    <img
                      src={item.photoUri}
                      alt=""
                      className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <span className="text-2xl">{item.info.emoji}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {item.info.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()} · {item.info.material}
                    </p>
                  </div>
                  <span className="font-bold text-primary">
                    {Math.round(item.detection.confidence * 100)}%
                  </span>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
