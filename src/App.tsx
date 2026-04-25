import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScannerScreen from './screens/ScannerScreen'
import ResultsScreen from './screens/ResultsScreen'
import AlbumScreen from './screens/AlbumScreen'
import DashboardScreen from './screens/DashboardScreen'
import { BottomNav } from './components/BottomNav'

const NAV_ROUTES = new Set(['/', '/album', '/dashboard'])
const FULLSCREEN_ROUTES = new Set(['/'])

function Layout() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.has(pathname)
  const isFullscreen = FULLSCREEN_ROUTES.has(pathname)

  return (
    <div className="relative min-h-full w-full max-w-full overflow-x-hidden bg-background text-foreground">
      <div className={showNav && !isFullscreen ? 'pb-24' : ''}>
        <Routes>
          <Route path="/" element={<ScannerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/album" element={<AlbumScreen />} />
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
