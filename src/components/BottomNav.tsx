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

function AlbumIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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
  const albumActive = pathname === '/album'

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
        <div className="flex items-end justify-around px-4 pt-2 pb-3">

          {/* Home */}
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
              dashActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <HomeIcon active={dashActive} />
            <span className="font-mono text-[9px] uppercase tracking-widest">Home</span>
          </button>

          {/* Scanner */}
          <button
            onClick={() => navigate('/scan')}
            className={cn(
              'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
              scanActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CameraIcon active={scanActive} />
            <span className="font-mono text-[9px] uppercase tracking-widest">Scan</span>
          </button>

          {/* Album */}
          <button
            onClick={() => navigate('/album')}
            className={cn(
              'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
              albumActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <AlbumIcon active={albumActive} />
            <span className="font-mono text-[9px] uppercase tracking-widest">Album</span>
          </button>

        </div>
      </div>
    </nav>
  )
}
