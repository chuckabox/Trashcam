import { useEffect, useState } from 'react'
import { computeEnhancedStats, loadScans } from '../services/storage'
import type { EnhancedStats } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const MOCK_GLOBAL: { name: string; items: number; score: number; avatar: string }[] = [
  { name: 'Ava Chen', items: 842, score: 32450, avatar: '🌿' },
  { name: 'Marcus Reed', items: 756, score: 28890, avatar: '🦊' },
  { name: 'Priya Patel', items: 612, score: 25240, avatar: '🌸' },
  { name: 'Jonas Müller', items: 589, score: 21760, avatar: '🐢' },
  { name: 'Layla Hassan', items: 474, score: 18120, avatar: '🍃' },
  { name: 'Diego Romero', items: 412, score: 14450, avatar: '🌍' },
  { name: 'Sienna Brooks', items: 388, score: 11980, avatar: '🐝' },
  { name: 'Tomoko Sato', items: 312, score: 9890, avatar: '🌱' },
  { name: 'Rafael Costa', items: 256, score: 7450, avatar: '🦉' },
]

const MOCK_FRIENDS: { name: string; items: number; score: number; avatar: string }[] = [
  { name: 'Sam K.', items: 156, score: 6450, avatar: '🐼' },
  { name: 'Jess', items: 124, score: 5890, avatar: '🦄' },
  { name: 'Rohan', items: 98, score: 4450, avatar: '🐙' },
  { name: 'Mia', items: 74, score: 3980, avatar: '🌻' },
  { name: 'Liam', items: 42, score: 3560, avatar: '🐶' },
  { name: 'Zoe', items: 28, score: 3120, avatar: '🦋' },
]

function computeScore(items: number, co2Kg: number, yrsSaved: number): number {
  return Math.round(items * 10 + co2Kg * 8 + yrsSaved * 1.5)
}

export default function LeaderboardScreen() {
  const [stats, setStats] = useState<EnhancedStats | null>(null)
  const [scope, setScope] = useState<'global' | 'friends'>('global')

  useEffect(() => {
    loadScans().then((scans) => setStats(computeEnhancedStats(scans)))
  }, [])

  if (!stats) return null

  const pool = scope === 'global' ? MOCK_GLOBAL : MOCK_FRIENDS
  const userScore = computeScore(stats.uniqueItemsScanned, stats.uniqueCo2KgSaved, stats.decompositionYearsSaved)
  const rows = [
    ...pool,
    {
      name: 'You',
      score: userScore,
      items: stats.uniqueItemsScanned,
      avatar: '🫵',
      isUser: true as const,
    },
  ]
    .sort((a, b) => b.score - a.score)
    .map((r, idx) => ({ ...r, rank: idx + 1 }))

  const medal = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-24 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Trashcams</p>
            <h1 className="text-2xl font-800 text-foreground">Rankings</h1>
          </div>
        </div>

        {/* Scope toggle */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          {(['global', 'friends'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 rounded-md py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                scope === s
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{scope === 'global' ? 'Global' : 'Friends'}</CardTitle>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">By score</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {rows.map((r) => {
              const isUser = 'isUser' in r && r.isUser
              return (
                <div
                  key={r.name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
                    isUser ? 'border-primary bg-primary/5' : 'border-transparent'
                  }`}
                >
                  <span className="w-6 font-mono text-xs font-bold text-muted-foreground">
                    {medal(r.rank) ?? `#${r.rank}`}
                  </span>
                  <span className="text-xl leading-none">{r.avatar}</span>
                  <span className={`flex-1 text-sm ${isUser ? 'font-bold text-primary' : 'text-foreground'}`}>
                    {r.name}
                  </span>
                  <div className="flex flex-col items-end leading-tight">
                    <span className="font-mono text-sm font-bold text-foreground">{r.score.toLocaleString()}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{r.items} items</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="px-2 space-y-1 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Score = items × 10 + CO₂ kg × 8 + years saved × 1.5
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Repeat items don't count — each unique item scanned counts once.
          </p>
        </div>
      </div>
    </div>
  )
}
