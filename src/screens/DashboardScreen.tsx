import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'
import { computeEnhancedStats, loadScans } from '../services/storage'
import type { EnhancedStats, MaterialCategory } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Hint } from '../components/Hint'

// ── Design tokens ─────────────────────────────────────────────────────────────

const MAT_COLOUR: Record<MaterialCategory, string> = {
  plastic: '#ef4444', metal: '#3b82f6', glass: '#06b6d4',
  paper: '#a3a3a3', cardboard: '#b45309', organic: '#84cc16',
  textile: '#ec4899', styrofoam: '#f97316', electronic: '#8b5cf6',
  hazardous: '#dc2626', composite: '#eab308',
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'insights', label: 'Insights' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'legend', label: 'Legend' },
]

const MOCK_GLOBAL: { name: string; items: number; avatar: string }[] = [
  { name: 'Ava Chen', items: 312, avatar: '🌿' },
  { name: 'Marcus Reed', items: 287, avatar: '🦊' },
  { name: 'Priya Patel', items: 251, avatar: '🌸' },
  { name: 'Jonas Müller', items: 228, avatar: '🐢' },
  { name: 'Layla Hassan', items: 196, avatar: '🍃' },
  { name: 'Diego Romero', items: 174, avatar: '🌍' },
  { name: 'Sienna Brooks', items: 143, avatar: '🐝' },
  { name: 'Tomoko Sato', items: 118, avatar: '🌱' },
  { name: 'Rafael Costa', items: 92, avatar: '🦉' },
]

const MOCK_FRIENDS: { name: string; items: number; avatar: string }[] = [
  { name: 'Sam K.', items: 41, avatar: '🐼' },
  { name: 'Jess', items: 35, avatar: '🦄' },
  { name: 'Rohan', items: 28, avatar: '🐙' },
  { name: 'Mia', items: 22, avatar: '🌻' },
  { name: 'Liam', items: 17, avatar: '🐶' },
  { name: 'Zoe', items: 11, avatar: '🦋' },
]

const TOOLTIP_STYLE = {
  background: '#FFFFFF',
  border: '2px solid #0F1713',
  color: '#0F1713',
  borderRadius: '4px',
  fontSize: 11,
  fontFamily: '"DM Mono", monospace',
}

// ── Sub-components ────────────────────────────────────────────────────────────



/** Compact stat chip */
function Chip({ label, value, sub, accent, hint }: { label: string; value: string; sub?: string; accent?: string; hint?: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-3 card-hover-effect">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-xl font-bold" style={{ color: accent ?? '#0F1713' }}>{value}</p>
        </div>
        {hint && <Hint text={hint} />}
      </div>
      {sub && <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  )
}



// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ stats, navigate }: { stats: EnhancedStats; navigate: ReturnType<typeof useNavigate> }) {
  const pieData = (Object.entries(stats.materialBreakdown) as [MaterialCategory, number][])
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v, color: MAT_COLOUR[k] }))

  const todayLabel = new Date().toLocaleDateString('en', { weekday: 'short' })
  const barData = stats.weeklyData.map((b) => ({
    ...b,
    fill: b.day === todayLabel ? '#10BC79' : '#E1E4DF',
  }))

  return (
    <div className="space-y-4 animate-fade-up">
      {/* KPI chips */}
      <div className="grid grid-cols-2 gap-2">
        <Chip label="Today" value={String(stats.scannedToday)} sub="items scanned" />
        <Chip label="Recyclable" value={`${stats.recyclablePercent}%`} sub="vs landfill" accent="#10BC79" />
        <Chip label="Compostable" value={String(stats.compostableCount)} sub="organic items" accent="#f0c040" />
        <Chip label="Total Co2" value={`${stats.totalCo2Kg.toFixed(1)}kg`} sub="carbon footprint" accent="#0F1713" 
          hint="Greenhouse gases released during production" />
      </div>

      {/* Material breakdown */}
      <Card>
        <CardHeader><CardTitle>Waste Breakdown</CardTitle></CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">No data yet</p>
              <p className="mt-2 text-xs text-muted-foreground">Capture your first scan to see your recovery breakdown.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={70} innerRadius={32}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {pieData.sort((a, b) => b.value - a.value).map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                    <div className="flex-1 h-px bg-secondary overflow-hidden rounded-full">
                      <div className="h-full rounded-full"
                        style={{ width: `${(d.value / stats.totalScans) * 100}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="w-20 font-mono text-[10px] capitalize text-muted-foreground">{d.name}</span>
                    <span className="w-5 text-right font-mono text-[10px] text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Activity</CardTitle>
            {stats.reductionPercent !== null && (
              <span className={`font-mono text-[10px] ${stats.reductionPercent >= 0 ? 'text-primary' : 'text-red-400'}`}>
                {stats.reductionPercent >= 0 ? '↓' : '↑'}{Math.abs(stats.reductionPercent)}% vs last wk
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={barData} barSize={18}>
              <XAxis dataKey="day" tick={{ fill: '#4d6450', fontSize: 10, fontFamily: '"DM Mono"' }}
                axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(16,188,121,0.04)' }} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}



// ── Insights tab ──────────────────────────────────────────────────────────────

function InsightsTab({ stats, navigate }: { stats: EnhancedStats; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-4 animate-fade-up">
      {/* Behaviour */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <CardTitle>Habits</CardTitle>
            <Hint text="Insights based on your scan history" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.mostWastedCategory && (
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Most Wasted</p>
                <p className="mt-0.5 font-semibold capitalize text-foreground">{stats.mostWastedCategory}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{stats.materialBreakdown[stats.mostWastedCategory]}×</span>
            </div>
          )}
          {stats.mostScannedItem && (
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Top Item</p>
                <p className="mt-0.5 font-semibold text-foreground">{stats.mostScannedItem}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{stats.topItems[0]?.count}×</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Weekly Trend</p>
              {stats.reductionPercent !== null ? (
                <p className={`mt-0.5 font-mono text-xl font-bold ${stats.reductionPercent >= 0 ? 'text-primary' : 'text-red-400'}`}>
                  {stats.reductionPercent >= 0 ? '↓ ' : '↑ '}{Math.abs(stats.reductionPercent)}%
                  <span className="ml-1 font-mono text-xs text-muted-foreground">vs last week</span>
                </p>
              ) : (
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">Need 2 weeks of data</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <CardTitle>Recovery Impact</CardTitle>
            <Hint text="How your sorting helps industrial reuse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: 'CO₂ Saved', value: `${stats.totalCo2Kg.toFixed(2)} kg`, icon: '🌍', accent: '#10BC79' },
            { label: 'Degradation Years Saved', value: `${stats.decompositionYearsSaved.toFixed(0)} yrs`, icon: '⏳', accent: '#10BC79' },
            { label: 'Recyclable Items', value: String(stats.recyclableCount), icon: '♻️', accent: '#10BC79' },
            { label: 'Landfill Items', value: String(stats.landfillCount), icon: '🗑️', accent: '#ff4d4d' },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="font-mono text-xs text-muted-foreground">{label}</span>
              </div>
              <span className="font-mono text-sm font-bold" style={{ color: accent ?? '#0F1713' }}>{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>



      {/* Frequently scanned */}
      {stats.topItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Common Items</CardTitle></CardHeader>
          <CardContent>
            {stats.topItems.map((item, idx) => (
              <div key={item.name} className={`flex justify-between py-2 ${idx !== stats.topItems.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="font-mono text-sm font-bold text-primary">×{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Leaderboard tab ───────────────────────────────────────────────────────

function LeaderboardTab({ stats }: { stats: EnhancedStats }) {
  const [scope, setScope] = useState<'global' | 'friends'>('global')

  const pool = scope === 'global' ? MOCK_GLOBAL : MOCK_FRIENDS
  const rows = [
    ...pool,
    { name: 'You', items: stats.uniqueItemsScanned, avatar: '🫵', isUser: true as const },
  ]
    .sort((a, b) => b.items - a.items)
    .map((r, idx) => ({ ...r, rank: idx + 1 }))

  const medal = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Scope toggle */}
      <div className="flex rounded-lg border border-border bg-card p-1">
        {(['global', 'friends'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 rounded-md py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
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
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">By items scanned</span>
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
                <span className="font-mono text-sm font-bold text-foreground">{r.items}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <p className="px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
        Repeat items don't count — each unique item scanned counts once.
      </p>
    </div>
  )
}

// ── Legend tab ────────────────────────────────────────────────────────────

const LEGEND = [
  { term: 'Plastic', def: 'Bottles, cups, and plastic containers. Rinse and recycle in yellow bin.' },
  { term: 'Metal', def: 'Cans, foil, and scrap metal. These are melted down and turned into new things.' },
  { term: 'Glass', def: 'Glass bottles and jars. Highly recyclable, put in yellow bin.' },
  { term: 'E-Waste', def: 'Anything with a battery or plug. These have toxic parts and need to go to a special tech recycling point.' },
  { term: 'Organic', def: 'Food scraps and garden waste. These rot away naturally into compost for gardens.' },
  { term: 'Paper', def: 'Clean cardboard and paper. These are recycled into new paper if they are dry and clean.' },
  { term: 'Residual', def: 'Tricky items like chip bags or dirty wrappers that can’t be easily recycled. These usually go to landfill.' },
  { term: 'Unknown', def: 'Items the scanner doesn’t recognize yet. Look for a recycling symbol on the label to help.' },
]

function LegendTab() {
  return (
    <div className="space-y-3 animate-fade-up">
      {LEGEND.map((item) => (
        <div key={item.term} className="rounded-lg border border-border bg-card p-4 card-hover-effect">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">{item.term}</p>
          <p className="mt-2 text-sm text-foreground leading-relaxed">{item.def}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<EnhancedStats | null>(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    loadScans().then((scans) => setStats(computeEnhancedStats(scans)))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-6 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Trashcams</p>
            <h1 className="text-2xl font-800 text-foreground">Dashboard</h1>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground pb-1">
            {new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {!stats ? (
          <div className="flex justify-center py-24">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-blink">Loading</span>
          </div>
        ) : (
          <>
            {tab === 'overview' && <OverviewTab stats={stats} navigate={navigate} />}
            {tab === 'insights' && <InsightsTab stats={stats} navigate={navigate} />}
            {tab === 'leaderboard' && <LeaderboardTab stats={stats} />}
            {tab === 'legend' && <LegendTab />}
          </>
        )}
      </div>
    </div>
  )
}
