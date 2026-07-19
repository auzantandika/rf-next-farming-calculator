import { useEffect, useState } from 'react'
import { ActualSessionPage } from './pages/ActualSessionPage'
import { CompareSpotsPage } from './pages/CompareSpotsPage'
import { GuidePage } from './pages/GuidePage'
import { HistoryPage } from './pages/HistoryPage'
import { KpmCalculatorPage } from './pages/KpmCalculatorPage'
import { loadSessions, saveSessions } from './lib/storage'
import type { SavedSession, TabId } from './types'

const NAV: Array<{ id: TabId; label: string }> = [
  { id: 'kpm', label: 'KPM Calculator' },
  { id: 'session', label: 'Actual Session' },
  { id: 'compare', label: 'Compare Spots' },
  { id: 'history', label: 'History' },
  { id: 'guide', label: 'Calculation Guide' },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('kpm')
  const [sessions, setSessions] = useState<SavedSession[]>([])
  const [storageWarning, setStorageWarning] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const result = loadSessions()
    setSessions(result.data)
    if (!result.ok && result.error) setStorageWarning(result.error)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const persist = (next: SavedSession[]) => {
    setSessions(next)
    const result = saveSessions(next)
    if (!result.ok && result.error) {
      setStorageWarning(result.error)
      setToast(result.error)
    }
  }

  const handleSave = (session: SavedSession) => {
    persist([session, ...sessions])
  }

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-block">
          <p className="brand">RF NEXT Farming Calculator</p>
          <p className="tagline">
            KPM, EXP, Credit, and Faction Coin farming analysis.
          </p>
        </div>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <nav
          className={menuOpen ? 'nav open' : 'nav'}
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'nav-link active' : 'nav-link'}
              onClick={() => {
                setTab(item.id)
                setMenuOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {storageWarning ? (
        <p className="banner warning" role="status">
          {storageWarning}
        </p>
      ) : null}

      <main className="main">
        {tab === 'kpm' ? (
          <KpmCalculatorPage onSave={handleSave} onToast={setToast} />
        ) : null}
        {tab === 'session' ? (
          <ActualSessionPage onSave={handleSave} onToast={setToast} />
        ) : null}
        {tab === 'compare' ? <CompareSpotsPage sessions={sessions} /> : null}
        {tab === 'history' ? (
          <HistoryPage
            sessions={sessions}
            onChange={persist}
            onToast={setToast}
          />
        ) : null}
        {tab === 'guide' ? <GuidePage /> : null}
      </main>

      <footer className="footer">
        <p>
          This is an unofficial community tool and is not affiliated with or
          endorsed by Netmarble. All calculations are estimates based on
          user-provided data. Actual farming results may vary.
        </p>
      </footer>

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
