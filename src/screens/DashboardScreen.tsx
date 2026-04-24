import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { computeStats, loadScans } from '../services/storage'
import type { DashboardStats, MaterialCategory } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

const MATERIAL_COLORS: Record<MaterialCategory, string> = {
  plastic: '#ef4444',
  metal: '#3b82f6',
  glass: '#06b6d4',
  paper: '#a3a3a3',
  cardboard: '#b45309',
  organic: '#84cc16',
  textile: '#ec4899',
  styrofoam: '#f97316',
  electronic: '#8b5cf6',
  hazardous: '#dc2626',
  composite: '#eab308',
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    loadScans().then((s) => setStats(computeStats(s)))
  }, [])

  if (!stats || stats.totalScans === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <span className="text-6xl">📊</span>
        <p className="text-xl font-bold text-foreground">No data yet</p>
        <p className="text-sm text-muted-foreground">Scan a few items to see stats.</p>
        <Button className="mt-2" onClick={() => navigate('/')}>
          Start Scanning
        </Button>
      </div>
    )
  }

  const pieData = (
    Object.entries(stats.materialBreakdown) as [MaterialCategory, number][]
  )
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v, color: MATERIAL_COLORS[k] }))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
            ← Scanner
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Scans" value={`${stats.totalScans}`} />
          <Kpi label="CO₂" value={`${stats.totalCo2Kg.toFixed(2)} kg`} />
          <Kpi label="Water" value={`${stats.totalWaterLiters.toFixed(0)} L`} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Material Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fafafa',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#fafafa', fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topItems.map((item, idx) => (
              <div
                key={item.name}
                className={`flex justify-between py-2 ${
                  idx !== stats.topItems.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <span className="text-foreground">{item.name}</span>
                <span className="font-bold text-primary">×{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </Card>
  )
}
