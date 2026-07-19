import { describe, expect, it } from 'vitest'
import {
  formatDecimal,
  formatInteger,
  parseDecimal,
  parseWholeNumber,
} from './numbers'

describe('parseWholeNumber', () => {
  it('accepts Indonesian and international thousand separators as 23621', () => {
    expect(parseWholeNumber('23621')).toBe(23621)
    expect(parseWholeNumber('23,621')).toBe(23621)
    expect(parseWholeNumber('23.621')).toBe(23621)
    expect(parseWholeNumber('23 621')).toBe(23621)
  })

  it('returns null for empty or invalid input', () => {
    expect(parseWholeNumber('')).toBeNull()
    expect(parseWholeNumber('abc')).toBeNull()
  })
})

describe('formatters', () => {
  it('formats with en-US', () => {
    expect(formatInteger(23621)).toBe('23,621')
    expect(formatInteger(28345200)).toBe('28,345,200')
    expect(formatDecimal(18.7, 1)).toBe('18.7')
    expect(formatDecimal(3.21, 2)).toBe('3.21')
  })
})

describe('parseDecimal', () => {
  it('parses simple decimals', () => {
    expect(parseDecimal('18.7')).toBe(18.7)
    expect(parseDecimal('3.21')).toBe(3.21)
  })
})
