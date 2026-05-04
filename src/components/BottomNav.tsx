import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  )
}

function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round"
      className="transition-all duration-300"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <line x1="12" y1="8" x2="12" y2="16" opacity="0.3" />
      <line x1="8" y1="12" x2="16" y2="12" opacity="0.3" />
    </svg>
  )
}

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const dashActive = pathname === '/dashboard'
  const scanActive = pathname === '/scan'
  const leaderActive = pathname === '/leaderboard'

  return (
    /* On desktop, center-align within the 393px phone container */
    <nav
      className="absolute bottom-0 inset-x-0 z-50"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <div className="relative border-t-0 border-border bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        {/* Left upward curve */}
        <svg className="absolute bottom-full left-0 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M0 24H24C10.7452 24 0 13.2548 0 0V24Z" fill="currentColor"/>
        </svg>
        {/* Right upward curve */}
        <svg className="absolute bottom-full right-0 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M24 24H0C13.2548 24 24 13.2548 24 0V24Z" fill="currentColor"/>
        </svg>
        <div className="grid grid-cols-3 items-center px-4 pt-2 pb-3">

          {/* Home */}
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95',
              dashActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div className="flex h-6 items-center justify-center">
              <HomeIcon active={dashActive} />
            </div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Home</span>
          </button>

          {/* Scanner */}
          <button
            onClick={() => navigate('/scan')}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95',
              scanActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div className="flex h-6 items-center justify-center">
              <CameraIcon active={scanActive} />
            </div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Scan</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => navigate('/leaderboard')}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95',
              leaderActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div className="flex h-6 items-center justify-center">
              <TrophyIcon active={leaderActive} />
            </div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Rankings</span>
          </button>

        </div>
      </div>
    </nav>
  )
}
