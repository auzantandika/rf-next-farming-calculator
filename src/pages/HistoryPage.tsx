import { useRef, useState } from 'react'
import { formatDecimal, formatInteger } from '../lib/numbers'
import {
  createExportPayload,
  downloadJson,
  newId,
  parseImportPayload,
} from '../lib/storage'
import type { SavedSession } from '../types'

interface HistoryPageProps {
  sessions: SavedSession[]
  onChange: (sessions: SavedSession[]) => void
  onToast: (message: string) => void
}

export function HistoryPage({
  sessions,
  onChange,
  onToast,
}: HistoryPageProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleExport = () => {
    const payload = createExportPayload(sessions)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`rf-next-farming-backup-${stamp}.json`, payload)
    onToast('Export Data downloaded.')
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const result = parseImportPayload(text)
      if (!result.ok) {
        onToast(result.error ?? 'Import failed.')
        return
      }
      const merged = [...result.data, ...sessions]
      onChange(merged)
      onToast(`Imported ${result.data.length} session(s).`)
    } catch {
      onToast('Import failed. The file could not be read.')
    }
  }

  const startEdit = (session: SavedSession) => {
    setEditingId(session.id)
    setEditLabel(session.label)
  }

  const commitEdit = () => {
    if (!editingId) return
    onChange(
      sessions.map((s) =>
        s.id === editingId
          ? {
              ...s,
              label: editLabel.trim() || s.label,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    )
    setEditingId(null)
    onToast('Session updated.')
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>History</h1>
        <p>
          Review, edit, duplicate, and back up farming sessions stored in this
          browser.
        </p>
      </header>

      <section className="panel notice">
        <p>
          Your saved sessions are stored only in this browser. They are not
          automatically synchronized across devices. Use Export Data to create a
          backup.
        </p>
      </section>

      <div className="toolbar">
        <button type="button" className="btn" onClick={handleExport}>
          Export Data
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => fileRef.current?.click()}
        >
          Import Data
        </button>
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            if (
              sessions.length > 0 &&
              !window.confirm(
                'Clear All Data? This permanently removes every saved session in this browser.',
              )
            ) {
              return
            }
            onChange([])
            onToast('All local sessions cleared.')
          }}
        >
          Clear All Data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {sessions.length === 0 ? (
        <section className="panel">
          <p className="empty-state">
            No saved sessions yet. Use Save Session on the calculator pages to
            build your history.
          </p>
        </section>
      ) : (
        <section className="panel">
          <ul className="history-list">
            {sessions.map((session) => (
              <li key={session.id} className="history-item">
                <div className="history-main">
                  {editingId === session.id ? (
                    <div className="inline-edit">
                      <input
                        className="field-input"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        aria-label="Edit session label"
                      />
                      <button
                        type="button"
                        className="btn primary"
                        onClick={commitEdit}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h3>{session.label}</h3>
                  )}
                  <p className="muted">
                    {session.kind === 'kpm' ? 'KPM Calculator' : 'Actual Session'}{' '}
                    · {new Date(session.createdAt).toLocaleString('en-US')} ·{' '}
                    {session.spot.map || 'No map'}
                  </p>
                  <p>
                    KPM {formatDecimal(session.rates?.kpm, 2)} · Credit/hr{' '}
                    {formatInteger(session.rates?.creditPerHour)} · EXP/hr{' '}
                    {formatInteger(session.rates?.expPerHour)}
                  </p>
                </div>
                <div className="history-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => startEdit(session)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      const now = new Date().toISOString()
                      onChange([
                        {
                          ...session,
                          id: newId(),
                          createdAt: now,
                          updatedAt: now,
                          label: `${session.label} (Copy)`,
                        },
                        ...sessions,
                      ])
                      onToast('Session duplicated.')
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => {
                      if (
                        !window.confirm(
                          'Delete this saved session? This cannot be undone.',
                        )
                      ) {
                        return
                      }
                      onChange(sessions.filter((s) => s.id !== session.id))
                      onToast('Session deleted.')
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
