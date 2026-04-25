import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'

function StatsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}

function DiaryIcon({ active }: { active: boolean }) {
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
  const scanActive = pathname === '/'
  const diaryActive = pathname === '/diary'

  return (
    /* On desktop, center-align within the 393px phone container */
    <nav
      className="fixed bottom-0 inset-x-0 z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[393px]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <div className="border-t border-border bg-background/92 backdrop-blur-xl">
        <div className="flex items-end justify-around px-4 pt-2 pb-3">

          {/* Stats */}
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-all',
              dashActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <StatsIcon active={dashActive} />
            <span className="font-mono text-[9px] uppercase tracking-widest">Stats</span>
            {dashActive && <span className="h-px w-4 bg-primary rounded-full" />}
          </button>

          {/* Scanner */}
          <button
            onClick={() => navigate('/')}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-all',
              scanActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CameraIcon active={scanActive} />
            <span className="font-mono text-[9px] uppercase tracking-widest">Scan</span>
            {scanActive && <span className="h-px w-4 bg-primary rounded-full" />}
          </button>

          {/* Diary */}
          <button
            onClick={() => navigate('/diary')}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-all',
              diaryActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <DiaryIcon active={diaryActive} />
            <span className="font-mono text-[9px] uppercase tracking-widest">Diary</span>
            {diaryActive && <span className="h-px w-4 bg-primary rounded-full" />}
          </button>

        </div>
      </div>
    </nav>
  )
}
