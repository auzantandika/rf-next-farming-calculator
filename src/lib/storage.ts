import type { ExportPayload, SavedSession } from '../types'

export const STORAGE_KEY = 'rf-next-farming-sessions'

export interface StorageResult<T> {
  ok: boolean
  data: T
  error?: string
}

function canUseStorage(): boolean {
  try {
    const key = '__rf_next_storage_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function loadSessions(): StorageResult<SavedSession[]> {
  if (typeof window === 'undefined' || !canUseStorage()) {
    return {
      ok: false,
      data: [],
      error: 'Local storage is unavailable in this browser.',
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ok: true, data: [] }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        data: [],
        error: 'Saved data is corrupted. Export a backup if possible, then clear data.',
      }
    }

    const sessions = parsed.filter(isSavedSession)
    return { ok: true, data: sessions }
  } catch {
    return {
      ok: false,
      data: [],
      error: 'Could not read saved sessions from local storage.',
    }
  }
}

export function saveSessions(
  sessions: SavedSession[],
): StorageResult<SavedSession[]> {
  if (typeof window === 'undefined' || !canUseStorage()) {
    return {
      ok: false,
      data: sessions,
      error: 'Local storage is unavailable. Your session was not saved.',
    }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    return { ok: true, data: sessions }
  } catch {
    return {
      ok: false,
      data: sessions,
      error: 'Could not save sessions. Storage may be full or blocked.',
    }
  }
}

export function createExportPayload(sessions: SavedSession[]): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'rf-next-farming-calculator',
    sessions,
  }
}

export function parseImportPayload(
  raw: string,
): StorageResult<SavedSession[]> {
  try {
    const parsed = JSON.parse(raw) as unknown

    if (Array.isArray(parsed)) {
      const sessions = parsed.filter(isSavedSession)
      if (sessions.length === 0 && parsed.length > 0) {
        return {
          ok: false,
          data: [],
          error: 'JSON was valid but contained no recognizable sessions.',
        }
      }
      return { ok: true, data: sessions }
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as ExportPayload).sessions)
    ) {
      const sessions = (parsed as ExportPayload).sessions.filter(isSavedSession)
      return { ok: true, data: sessions }
    }

    return {
      ok: false,
      data: [],
      error: 'Unrecognized backup format. Expected an export from this app.',
    }
  } catch {
    return {
      ok: false,
      data: [],
      error: 'Invalid JSON. The file could not be imported.',
    }
  }
}

function isSavedSession(value: unknown): value is SavedSession {
  if (!value || typeof value !== 'object') return false
  const session = value as SavedSession
  return (
    typeof session.id === 'string' &&
    typeof session.createdAt === 'string' &&
    typeof session.kind === 'string' &&
    typeof session.label === 'string' &&
    !!session.spot &&
    typeof session.spot === 'object'
  )
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
