import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ScannerScreen from './screens/ScannerScreen'
import ResultsScreen from './screens/ResultsScreen'
import AlbumScreen from './screens/AlbumScreen'
import DashboardScreen from './screens/DashboardScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'
import { BottomNav } from './components/BottomNav'
import { DeviceFrame } from './components/DeviceFrame'

const NAV_ROUTES = new Set(['/scan', '/album', '/dashboard', '/results', '/leaderboard'])
const FULLSCREEN_ROUTES = new Set(['/scan'])

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.has(pathname)
  const isFullscreen = FULLSCREEN_ROUTES.has(pathname)

  return (
    <div className="relative h-full w-full max-w-full overflow-hidden bg-background text-foreground">
      <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className={showNav && !isFullscreen ? 'pb-24' : ''}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/scan" element={<ScannerScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/album" element={<AlbumScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
          </Routes>
        </div>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <DeviceFrame>
        <Layout />
      </DeviceFrame>
    </HashRouter>
  )
}
