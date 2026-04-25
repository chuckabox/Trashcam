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

/** Compact stat chip */
function Chip({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="relative border-l-2 border-border bg-card/50 p-3">
      <div className="flex items-center gap-2">
        <span className="h-1 w-1 bg-muted-foreground/30" />
        <p className="font-mono text-[8px] uppercase tracking-tighter text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 font-mono text-2xl font-bold tracking-tighter" style={{ color: accent ?? '#0F1713' }}>{value}</p>
      {sub && (
        <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-1">
          <p className="font-mono text-[8px] uppercase text-muted-foreground/60">{sub}</p>
          <div className="h-1 w-4 bg-muted-foreground/10" />
        </div>
      )}
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
    <div className="space-y-6 animate-fade-up">
      {/* KPI chips */}
      <div className="grid grid-cols-2 border border-border bg-card/20 p-px">
        <Chip label="Today" value={String(stats.scannedToday)} sub="items scanned" />
        <Chip label="Recovery" value={`${stats.recyclablePercent}%`} sub="recyclable" accent="#10BC79" />
        <Chip label="Avg Degradation" value={String(stats.avgDegradationScore)} sub="score index" accent="#f0c040" />
        <Chip label="Urgent" value={String(stats.urgentCount)} sub="action needed" accent={stats.urgentCount > 0 ? '#ff4d4d' : '#0F1713'} />
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
              <div className="relative border border-red-500/20 bg-red-500/5 p-4 transition-all hover:bg-red-500/10">
                <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-red-500/40" />
                <div className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-red-500/40" />
                <div className="flex items-start gap-3">
                  <span className="text-xl">{scan.info.emoji}</span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{scan.info.displayName}</p>
                      <Badge label={CONDITION_LABEL[condition]} variant={CONDITION_BADGE_VARIANT[condition]} />
                    </div>
                    <ScoreBar score={score} condition={condition} />
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {remainingDays === 0 ? 'DISPOSE IMMEDIATELY' : `${remainingDays}d REMAINING · ${scan.info.disposalTip.slice(0, 48)}…`}
                    </p>
                  </div>
                </div>
              </div>
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
      <div className="border border-border bg-card/10">
        <div className="flex items-center justify-between border-b border-border bg-card/30 px-4 py-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest">Material Analysis</p>
          <div className="flex gap-1">
            <span className="h-1 w-1 bg-primary" />
            <span className="h-1 w-1 bg-primary/40" />
          </div>
        </div>
        <div className="p-4">
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

      {/* Weekly activity */}
      <div className="border border-border bg-card/10">
        <div className="flex items-center justify-between border-b border-border bg-card/30 px-4 py-2">
          <CardTitle className="text-[10px]">Weekly Throughput</CardTitle>
          {stats.reductionPercent !== null && (
            <span className={`font-mono text-[9px] uppercase ${stats.reductionPercent >= 0 ? 'text-primary' : 'text-red-400'}`}>
              {stats.reductionPercent >= 0 ? 'Δ NEG' : 'Δ POS'} {Math.abs(stats.reductionPercent)}%
            </span>
          )}
        </div>
        <div className="p-4">
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
        <div key={scan.id} className="group relative border border-border bg-card/5 p-3 transition-colors hover:bg-card/20">
          <div className="absolute right-0 top-0 h-4 w-4 overflow-hidden">
            <div className="absolute right-0 top-0 h-px w-2 bg-border group-hover:bg-primary/40" />
            <div className="absolute right-0 top-0 h-2 w-px bg-border group-hover:bg-primary/40" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl grayscale transition-all group-hover:grayscale-0 shrink-0">{scan.info.emoji}</span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-mono text-xs font-bold uppercase tracking-tight text-foreground">{scan.info.displayName}</p>
                <span className="font-mono text-lg font-bold tabular-nums shrink-0" style={{ color: CONDITION_COLOR[condition] }}>
                  {score.toString().padStart(3, '0')}
                </span>
              </div>
              <ScoreBar score={score} condition={condition} />
              <div className="flex items-center justify-between border-t border-border/30 pt-1.5">
                <Badge label={CONDITION_LABEL[condition]} variant={CONDITION_BADGE_VARIANT[condition]} />
                <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                  {remainingDays === 0 ? 'STATUS: CRITICAL' : `T-MINUS: ${remainingDays}D`} · {Math.round(confidence * 100)}% CONF
                </span>
              </div>
            </div>
          </div>
        </div>
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
      <div className="border border-border bg-card/10">
        <div className="border-b border-border bg-card/30 px-4 py-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest">User Behaviour Metrics</p>
        </div>
        <div className="p-4 space-y-3">
          {stats.mostWastedCategory && (
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Primary Waste Stream</p>
                <p className="mt-0.5 font-mono text-sm font-bold uppercase tracking-tight text-foreground">{stats.mostWastedCategory}</p>
              </div>
              <div className="bg-secondary px-2 py-1">
                <span className="font-mono text-[10px] font-bold text-foreground">{stats.materialBreakdown[stats.mostWastedCategory]} UNITS</span>
              </div>
            </div>
          )}
          {stats.mostScannedItem && (
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">High-Frequency Object</p>
                <p className="mt-0.5 font-mono text-sm font-bold uppercase tracking-tight text-foreground">{stats.mostScannedItem}</p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{stats.topItems[0]?.count} DETECTIONS</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Net Output Delta</p>
              {stats.reductionPercent !== null ? (
                <p className={`mt-0.5 font-mono text-xl font-bold ${stats.reductionPercent >= 0 ? 'text-primary' : 'text-red-400'}`}>
                  {stats.reductionPercent >= 0 ? '∇ ' : 'Δ '}{Math.abs(stats.reductionPercent)}%
                  <span className="ml-1 font-mono text-[8px] uppercase text-muted-foreground">vs previous cycle</span>
                </p>
              ) : (
                <p className="mt-0.5 font-mono text-[8px] text-muted-foreground italic uppercase">Insufficient historical data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="border border-border bg-card/10">
        <div className="border-b border-border bg-card/30 px-4 py-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest">Environmental Extraction Data</p>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: 'Carbon Output (Est)', value: `${stats.totalCo2Kg.toFixed(2)} KG`, icon: '🌍' },
            { label: 'H2O Utilization', value: `${stats.totalWaterLiters.toFixed(0)} L`, icon: '💧' },
            { label: 'Recovery Potential', value: String(stats.recyclableCount), icon: '♻️', accent: '#10BC79' },
            { label: 'Landfill Allocation', value: String(stats.landfillCount), icon: '🗑️', accent: '#ff4d4d' },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} className="flex items-center justify-between border-b border-border/30 py-2 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-60">{icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
              </div>
              <span className="font-mono text-xs font-bold tracking-widest" style={{ color: accent ?? '#0F1713' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

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
