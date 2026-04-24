import { useLocation, useNavigate } from 'react-router-dom'
import type { ScanResult } from '../types'
import { ResultsCard } from '../components/ResultsCard'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function ResultsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const scan = location.state?.scan as ScanResult | undefined

  if (!scan) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Button onClick={() => navigate('/')}>Go to Scanner</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <ResultsCard result={scan} />

        <Card>
          <CardHeader>
            <CardTitle>Find Local Recycling</CardTitle>
            <CardDescription>
              Nearest {scan.info.recyclable} drop-off lookup — coming soon.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => navigate('/')}>
            Scan Another
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/diary')}>
            View Diary
          </Button>
        </div>
      </div>
    </div>
  )
}
