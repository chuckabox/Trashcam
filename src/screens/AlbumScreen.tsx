import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearScans, loadScans } from '../services/storage'

import type { ScanResult } from '../types'
import { Badge } from '../components/ui/badge'
import { Tabs } from '../components/ui/tabs'

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'recyclable', label: 'Recycle' },
  { id: 'landfill', label: 'Landfill' },
]

export default function AlbumScreen() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<ScanResult[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setScans(await loadScans())
    setRefreshing(false)
  }, [])

  useEffect(() => { 
    window.scrollTo(0, 0)
    refresh() 
  }, [refresh])

  const handleClear = () => {
    if (!window.confirm('Clear all scan history on this device?')) return
    clearScans().then(() => setScans([]))
  }

  const filtered = useMemo(() => {
    let result = scans
    if (filter === 'recyclable') result = result.filter((s) => s.items.some(i => i.recyclable === 'recyclable'))
    else if (filter === 'landfill') result = result.filter((s) => s.items.some(i => i.recyclable === 'landfill' || i.recyclable === 'hazardous'))
    return result
  }, [scans, filter])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-6 pt-6 space-y-4 animate-fade-up">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Trashcams</p>
            <h1 className="text-2xl font-800 text-foreground">
              Album
              <span className="ml-2 font-mono text-base font-normal text-muted-foreground">({scans.length})</span>
            </h1>
          </div>
          {scans.length > 0 && (
            <button
              onClick={handleClear}
              className="pb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          )}
        </div>



        <Tabs tabs={FILTER_TABS} active={filter} onChange={setFilter} />

        {/* Content */}
        {refreshing && scans.length === 0 ? (
          <p className="py-10 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-blink">Loading</p>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" className="text-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">No scans yet</p>
            <p className="text-sm text-muted-foreground">Your scanned items will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">No matches</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((scan) => {
              const primaryItem = scan.items[0]
              const primaryDetection = scan.detections[0]
              const othersCount = scan.items.length - 1

              return (
                <button
                  key={scan.id}
                  className="w-full text-left group"
                  onClick={() => navigate('/results', { state: { scan: scan } })}
                >
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 card-hover-effect">
                    {/* Thumbnail */}
                    <div className="relative">
                      {scan.photoUri ? (
                        <img src={scan.photoUri} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-xl">
                          {primaryItem?.emoji}
                        </div>
                      )}
                      {othersCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground shadow-sm">
                          +{othersCount}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {primaryItem?.displayName || 'Unknown Object'}
                          {othersCount > 0 && <span className="ml-1 text-muted-foreground font-normal">& {othersCount} more</span>}
                        </p>
                      </div>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {new Date(scan.timestamp).toLocaleDateString()} · {primaryItem?.material}
                      </p>
                    </div>

                    {/* Confidence */}
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-bold text-foreground capitalize">{primaryItem?.recyclable}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">
                        {Math.round((primaryDetection?.confidence || 0) * 100)}% Match
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
