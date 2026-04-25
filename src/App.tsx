import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScannerScreen from './screens/ScannerScreen'
import ResultsScreen from './screens/ResultsScreen'
import DiaryScreen from './screens/DiaryScreen'
import DashboardScreen from './screens/DashboardScreen'
import { BottomNav } from './components/BottomNav'

const NAV_ROUTES = new Set(['/', '/diary', '/dashboard'])
const FULLSCREEN_ROUTES = new Set(['/'])

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.has(pathname)
  const isFullscreen = FULLSCREEN_ROUTES.has(pathname)

  return (
    <div className={cn("relative h-screen w-full max-w-full overflow-hidden bg-background text-foreground flex flex-col", showNav && !isFullscreen && "pb-24")}>
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ScannerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/diary" element={<DiaryScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
