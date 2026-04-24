import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScannerScreen from './screens/ScannerScreen'
import ResultsScreen from './screens/ResultsScreen'
import DiaryScreen from './screens/DiaryScreen'
import DashboardScreen from './screens/DashboardScreen'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-full bg-background text-foreground">
        <Routes>
          <Route path="/" element={<ScannerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/diary" element={<DiaryScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
