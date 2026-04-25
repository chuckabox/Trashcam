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

export default function DiaryScreen() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<ScanResult[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setScans(await loadScans())
    setRefreshing(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleClear = () => {
    if (!window.confirm('Clear all scan history on this device?')) return
    clearScans().then(() => setScans([]))
  }

  const filtered = useMemo(() => {
    let result = scans
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) => s.info.displayName.toLowerCase().includes(q))
    }
    if (filter === 'recyclable') result = result.filter((s) => s.info.recyclable === 'recyclable')
    else if (filter === 'landfill') result = result.filter((s) => s.info.recyclable === 'landfill' || s.info.recyclable === 'hazardous')
    return result
  }, [scans, search, filter])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-6 pt-6 space-y-4 animate-fade-up">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Trashcams</p>
            <h1 className="text-2xl font-800 text-foreground">
              Diary
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

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
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
            {filtered.map((item) => {
              return (
                <button
                  key={item.id}
                  className="w-full text-left group"
                  onClick={() => navigate('/results', { state: { scan: item } })}
                >
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 card-hover-effect">
                    {/* Thumbnail */}
                    {item.photoUri ? (
                      <img src={item.photoUri} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <span className="text-xl">{item.info.emoji}</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-sm font-semibold text-foreground">{item.info.displayName}</p>
                      </div>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()} · {item.info.material}
                      </p>
                    </div>

                    {/* Confidence */}
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-bold text-foreground capitalize">{item.info.recyclable}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{Math.round(item.detection.confidence * 100)}% conf</p>
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
