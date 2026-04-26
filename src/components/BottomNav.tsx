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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
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
      className="fixed bottom-0 inset-x-0 z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[393px]"
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
        <div className="flex items-center justify-between px-6 pt-2 pb-3">

          {/* Home */}
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex w-20 flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95',
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
              'flex w-20 flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95',
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
              'flex w-20 flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95',
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
