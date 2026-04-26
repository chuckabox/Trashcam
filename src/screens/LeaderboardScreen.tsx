import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { computeEnhancedStats, loadScans } from '../services/storage'
import { getSession, signIn, signUp, signInDemo, signOut, type Session } from '../services/auth'
import type { EnhancedStats } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

const MOCK_GLOBAL: { name: string; items: number; score: number; avatar: string }[] = [
  { name: 'Ava Chen', items: 842, score: 48500, avatar: '🌿' },
  { name: 'Marcus Reed', items: 756, score: 42300, avatar: '🦊' },
  { name: 'Priya Patel', items: 612, score: 35600, avatar: '🌸' },
  { name: 'Jonas Müller', items: 589, score: 33200, avatar: '🐢' },
  { name: 'Layla Hassan', items: 474, score: 26800, avatar: '🍃' },
  { name: 'Diego Romero', items: 412, score: 22400, avatar: '🌍' },
  { name: 'Sienna Brooks', items: 388, score: 20900, avatar: '🐝' },
  { name: 'Tomoko Sato', items: 312, score: 16500, avatar: '🌱' },
  { name: 'Rafael Costa', items: 256, score: 13200, avatar: '🦉' },
]

const MOCK_FRIENDS: { name: string; items: number; score: number; avatar: string }[] = [
  { name: 'Sam K.', items: 156, score: 9450, avatar: '🐼' },
  { name: 'Jess', items: 124, score: 7890, avatar: '🦄' },
  { name: 'Rohan', items: 98, score: 6450, avatar: '🐙' },
  { name: 'Mia', items: 74, score: 4980, avatar: '🌻' },
  { name: 'Liam', items: 42, score: 3250, avatar: '🐶' },
  { name: 'Zoe', items: 28, score: 2120, avatar: '🦋' },
]

function computeScore(items: number, co2Kg: number, yrsSaved: number): number {
  return Math.round(items * 50 + co2Kg * 10 + yrsSaved * 0.1)
}

// ── Auth gate ─────────────────────────────────────────────────────────────────

function AuthGate({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = mode === 'signin' ? signIn(username, password) : signUp(username, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onAuthed()
  }

  function handleDemo() {
    signInDemo()
    onAuthed()
  }

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader>
        <CardTitle>Sign in to view rankings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demo button up top */}
        <Button variant="lime" className="w-full" onClick={handleDemo}>
          Try demo account
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 rounded-md py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                mode === m
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {error && (
            <p className="font-mono text-[10px] text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Sign-out confirm ──────────────────────────────────────────────────────────

function SignOutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <Card className="w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Sign out?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">You will need to sign in again to see the rankings.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>Sign out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const [stats, setStats] = useState<EnhancedStats | null>(null)
  const [scope, setScope] = useState<'global' | 'friends'>('global')
  const [session, setSession] = useState<Session | null>(() => getSession())
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)

  const isAuthed = session !== null

  useEffect(() => {
    loadScans().then((scans) => setStats(computeEnhancedStats(scans)))
  }, [])

  useEffect(() => {
    if (isAuthed) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isAuthed])

  if (!stats) return null

  const pool = scope === 'global' ? MOCK_GLOBAL : MOCK_FRIENDS
  const userScore = computeScore(stats.uniqueItemsScanned, stats.uniqueCo2KgSaved, stats.decompositionYearsSaved)
  const youName = session?.isDemo ? 'You (Demo)' : session?.username ?? 'You'
  const rows = [
    ...pool,
    {
      name: youName,
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
    <div className={`min-h-screen bg-background ${isAuthed ? '' : 'h-screen overflow-hidden'}`}>
      <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
        {/* Gated content (header included so blur covers it) */}
        <div className="relative">
          <div className={isAuthed ? 'space-y-4' : 'pointer-events-none select-none blur-md space-y-4'}>
            {/* Header */}
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Trashcam</p>
                <h1 className="text-2xl font-800 text-foreground">Rankings</h1>
              </div>
              {isAuthed && (
                <button
                  onClick={() => setConfirmingSignOut(true)}
                  aria-label="Sign out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-primary/50"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
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
                Score = items × 50 + CO₂ kg × 10 + years saved × 0.1
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Repeat items don't count - each unique item scanned counts once.
              </p>
            </div>
          </div>

          {/* Auth overlay */}
          {!isAuthed && (
            <div className="absolute inset-0 flex items-start justify-center pt-8">
              <AuthGate onAuthed={() => setSession(getSession())} />
            </div>
          )}
        </div>
      </div>

      {confirmingSignOut && (
        <SignOutDialog
          onCancel={() => setConfirmingSignOut(false)}
          onConfirm={() => {
            signOut()
            setSession(null)
            setConfirmingSignOut(false)
          }}
        />
      )}
    </div>
  )
}
