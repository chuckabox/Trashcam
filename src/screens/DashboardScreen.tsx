import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'
import { computeEnhancedStats, loadScans } from '../services/storage'
import { CONDITION_LABEL, CONDITION_COLOR, CONDITION_BADGE_VARIANT } from '../services/degradationScore'
import type { EnhancedStats, ScanWithDegradation, MaterialCategory, DegradationCondition } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs } from '../components/ui/tabs'
import { Button } from '../components/ui/button'

// ── Design tokens ─────────────────────────────────────────────────────────────

const MAT_COLOR: Record<MaterialCategory, string> = {
  plastic: '#ef4444', metal: '#3b82f6', glass: '#06b6d4',
  paper: '#a3a3a3', cardboard: '#b45309', organic: '#84cc16',
  textile: '#ec4899', styrofoam: '#f97316', electronic: '#8b5cf6',
  hazardous: '#dc2626', composite: '#eab308',
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'track', label: 'Track' },
  { id: 'insights', label: 'Insights' },
]

const TOOLTIP_STYLE = {
  background: '#F5F6F3',
  border: '1px solid #E1E4DF',
  color: '#0F1713',
  borderRadius: '6px',
  fontSize: 11,
  fontFamily: '"DM Mono", monospace',
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** SVG arc health gauge */
function HealthArc({ score }: { score: number }) {
  const r = 52
  const cx = 64
  const cy = 64
  const circ = 2 * Math.PI * r
  const arcLen = circ * 0.75
  const filled = arcLen * (score / 100)
  const color =
    score >= 75 ? '#10BC79' : score >= 50 ? '#f0c040' : score >= 25 ? '#f97316' : '#ff4d4d'

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 128 128" className="w-44 h-44">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E1E4DF" strokeWidth="7"
          strokeDasharray={`${arcLen} ${circ - arcLen}`} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`} />
        {/* Fill */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)`, transition: 'stroke-dasharray 0.8s ease-out' }} />
      </svg>
      <div className="absolute text-center pointer-events-none">
        <p className="font-mono text-5xl font-bold leading-none" style={{ color }}>{score}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">health</p>
      </div>
    </div>
  )
}

/** Compact stat chip */
function Chip({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold" style={{ color: accent ?? '#0F1713' }}>{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

/** Score bar for degradation */
function ScoreBar({ score, condition }: { score: number; condition: DegradationCondition }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${score}%`, backgroundColor: CONDITION_COLOR[condition] }} />
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ stats, navigate }: { stats: EnhancedStats; navigate: ReturnType<typeof useNavigate> }) {
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const pieData = (Object.entries(stats.materialBreakdown) as [MaterialCategory, number][])
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v, color: MAT_COLOR[k] }))

  const todayLabel = new Date().toLocaleDateString('en', { weekday: 'short' })
  const barData = stats.weeklyData.map((b) => ({
    ...b,
    fill: b.day === todayLabel ? '#10BC79' : '#E1E4DF',
  }))

  const alertsShown = showAllAlerts ? stats.urgentScans : stats.urgentScans.slice(0, 3)

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Health gauge */}
      <Card className="flex flex-col items-center py-6">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Waste Health Score
        </p>
        <HealthArc score={stats.wasteHealthScore} />
        <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {stats.wasteHealthScore >= 75 ? 'Excellent' : stats.wasteHealthScore >= 50 ? 'Fair' : 'Needs attention'}
        </p>
      </Card>

      {/* KPI chips */}
      <div className="grid grid-cols-2 gap-2">
        <Chip label="Today" value={String(stats.scannedToday)} sub="items scanned" />
        <Chip label="Recyclable" value={`${stats.recyclablePercent}%`} sub="vs landfill" accent="#10BC79" />
        <Chip label="Avg Degradation" value={String(stats.avgDegradationScore)} sub="score 0–100" accent="#f0c040" />
        <Chip label="Urgent" value={String(stats.urgentCount)} sub="need action" accent={stats.urgentCount > 0 ? '#ff4d4d' : '#0F1713'} />
      </div>

      {/* Alerts */}
      {stats.urgentScans.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-blink" />
            <p className="font-mono text-[9px] uppercase tracking-widest text-red-400">
              Alerts · {stats.urgentScans.length}
            </p>
          </div>
          {alertsShown.map(({ scan, score, condition, remainingDays }) => (
            <button key={scan.id} className="w-full text-left" onClick={() => navigate('/results', { state: { scan } })}>
              <Card className="border-red-500/20 bg-red-500/5 p-3 hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{scan.info.emoji}</span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{scan.info.displayName}</p>
                      <Badge label={CONDITION_LABEL[condition]} variant={CONDITION_BADGE_VARIANT[condition]} />
                    </div>
                    <ScoreBar score={score} condition={condition} />
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {remainingDays === 0 ? 'Dispose immediately' : `${remainingDays}d remaining · ${scan.info.disposalTip.slice(0, 48)}…`}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
          {stats.urgentScans.length > 3 && (
            <button className="w-full text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground py-1"
              onClick={() => setShowAllAlerts(!showAllAlerts)}>
              {showAllAlerts ? 'Show less' : `+${stats.urgentScans.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {/* Material breakdown */}
      <Card>
        <CardHeader><CardTitle>Waste Breakdown</CardTitle></CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="py-6 text-center font-mono text-xs text-muted-foreground">No data</p>
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

// ── Track tab ─────────────────────────────────────────────────────────────────

function TrackTab({ items }: { items: ScanWithDegradation[] }) {
  const [showAll, setShowAll] = useState(false)
  const sorted = [...items].sort((a, b) => b.score - a.score)
  const shown = showAll ? sorted : sorted.slice(0, 10)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center animate-fade-up">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">No items tracked yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Sorted by urgency · {items.length} items
        </p>
      </div>
      <p className="font-mono text-[9px] text-muted-foreground">
        0–25 Fresh · 26–60 Mid-life · 61–85 Degrading · 86–100 Critical
      </p>

      {shown.map(({ scan, score, condition, remainingDays, confidence }) => (
        <Card key={scan.id} className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0">{scan.info.emoji}</span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{scan.info.displayName}</p>
                <span className="font-mono text-sm font-bold shrink-0" style={{ color: CONDITION_COLOR[condition] }}>
                  {score}
                </span>
              </div>
              <ScoreBar score={score} condition={condition} />
              <div className="flex items-center justify-between">
                <Badge label={CONDITION_LABEL[condition]} variant={CONDITION_BADGE_VARIANT[condition]} />
                <span className="font-mono text-[9px] text-muted-foreground">
                  {remainingDays === 0 ? 'Overdue' : `${remainingDays}d · ${Math.round(confidence * 100)}% conf`}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {sorted.length > 10 && (
        <button className="w-full py-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show less' : `Show ${sorted.length - 10} more`}
        </button>
      )}
    </div>
  )
}

// ── Insights tab ──────────────────────────────────────────────────────────────

function InsightsTab({ stats, navigate }: { stats: EnhancedStats; navigate: ReturnType<typeof useNavigate> }) {
  const midLife = stats.allScored.filter((s) => s.condition === 'mid-life').slice(0, 3)

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Behaviour */}
      <Card>
        <CardHeader><CardTitle>Behaviour</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Environmental Impact</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: 'CO₂ Generated', value: `${stats.totalCo2Kg.toFixed(2)} kg`, icon: '🌍' },
            { label: 'Water Used', value: `${stats.totalWaterLiters.toFixed(0)} L`, icon: '💧' },
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

      {/* Deal with soon */}
      {midLife.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Deal With Soon</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {midLife.map(({ scan, remainingDays }) => (
              <button key={scan.id} className="w-full text-left"
                onClick={() => navigate('/results', { state: { scan } })}>
                <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-lg">{scan.info.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{scan.info.displayName}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">{scan.info.disposalTip.slice(0, 55)}…</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-yellow-400">{remainingDays}d</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Frequently scanned */}
      {stats.topItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Frequently Scanned</CardTitle></CardHeader>
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
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">TrashLife</p>
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
            {tab === 'track' && <TrackTab items={stats.allScored} />}
            {tab === 'insights' && <InsightsTab stats={stats} navigate={navigate} />}
          </>
        )}
      </div>
    </div>
  )
}
