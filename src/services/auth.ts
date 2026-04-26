const USERS_KEY = 'trashcams:users'
const SESSION_KEY = 'trashcams:session'

export type Session = { username: string; isDemo: boolean }

type UserRecord = { password: string }
type UsersMap = Record<string, UserRecord>

function loadUsers(): UsersMap {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as UsersMap) : {}
  } catch {
    return {}
  }
}

function saveUsers(users: UsersMap): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function setSession(s: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function signUp(username: string, password: string): { ok: true } | { ok: false; error: string } {
  const u = username.trim()
  if (!u) return { ok: false, error: 'Enter a username.' }
  if (password.length < 4) return { ok: false, error: 'Password must be 4+ characters.' }
  const users = loadUsers()
  if (users[u]) return { ok: false, error: 'Username taken.' }
  users[u] = { password }
  saveUsers(users)
  setSession({ username: u, isDemo: false })
  return { ok: true }
}

export function signIn(username: string, password: string): { ok: true } | { ok: false; error: string } {
  const u = username.trim()
  if (!u) return { ok: false, error: 'Enter a username.' }
  const users = loadUsers()
  const rec = users[u]
  if (!rec || rec.password !== password) return { ok: false, error: 'Wrong username or password.' }
  setSession({ username: u, isDemo: false })
  return { ok: true }
}

export function signInDemo(): void {
  setSession({ username: 'Demo', isDemo: true })
}
