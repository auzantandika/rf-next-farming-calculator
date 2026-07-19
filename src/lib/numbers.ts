/** Parse whole-number reward/count fields. Commas and dots are thousand separators. */
export function parseWholeNumber(raw: string): number | null {
  if (raw == null) return null
  const trimmed = String(raw).trim()
  if (!trimmed) return null

  const normalized = trimmed.replace(/[\s,.]/g, '')
  if (!/^-?\d+$/.test(normalized)) return null

  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return value
}

/** Parse a non-negative decimal for rates, bonuses, and duration seconds. */
export function parseDecimal(raw: string): number | null {
  if (raw == null) return null
  const trimmed = String(raw).trim()
  if (!trimmed) return null

  // Allow either 1,234.56 or 1234.56; strip spaces and thousand commas only.
  const withoutSpaces = trimmed.replace(/\s/g, '')
  const hasComma = withoutSpaces.includes(',')
  const hasDot = withoutSpaces.includes('.')

  let normalized = withoutSpaces
  if (hasComma && hasDot) {
    // Assume last separator is decimal.
    if (withoutSpaces.lastIndexOf(',') > withoutSpaces.lastIndexOf('.')) {
      normalized = withoutSpaces.replace(/\./g, '').replace(',', '.')
    } else {
      normalized = withoutSpaces.replace(/,/g, '')
    }
  } else if (hasComma && !hasDot) {
    // Ambiguous: treat as thousand sep if groups of 3, else decimal.
    const parts = withoutSpaces.split(',')
    if (parts.length === 2 && parts[1].length !== 3) {
      normalized = `${parts[0]}.${parts[1]}`
    } else {
      normalized = withoutSpaces.replace(/,/g, '')
    }
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null
  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return value
}

export function formatInteger(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return Math.round(value).toLocaleString('en-US')
}

export function formatDecimal(
  value: number | null | undefined,
  digits = 1,
): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}

export function formatDurationMinutes(totalMinutes: number | null): string {
  if (totalMinutes == null || !Number.isFinite(totalMinutes) || totalMinutes < 0) {
    return '—'
  }
  const totalSeconds = Math.round(totalMinutes * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export function safeNumber(value: number): number | null {
  if (!Number.isFinite(value)) return null
  return value
}

export function inputStringFromNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return String(value)
}
