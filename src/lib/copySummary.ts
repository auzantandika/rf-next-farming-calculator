import type {
  RateResults,
  SessionResults,
  SpotInfo,
  TestDataInputs,
} from '../types'
import { VERIFICATION_LABELS } from './calculations'
import { formatDecimal, formatInteger } from './numbers'

export function buildKpmSummary(
  spot: SpotInfo,
  testData: TestDataInputs,
  rates: RateResults,
): string {
  const lines = [
    'RF NEXT Farming Calculator — Session Summary',
    `Spot Name: ${spot.spotName || '—'}`,
    `Monster Name: ${spot.monsterName || '—'}`,
    `Map: ${spot.map || '—'}`,
    `Farming Mode: ${spot.farmingMode === 'party' ? 'Party' : 'Solo'}`,
    `Farming Duration: ${testData.minutes ?? 0}m ${testData.seconds ?? 0}s`,
    `Total Kills: ${formatInteger(testData.totalKills)}`,
    `Kill per Minute: ${formatDecimal(rates.kpm, 2)}`,
    `Seconds per Kill: ${formatDecimal(rates.secondsPerKill, 2)}`,
    `Kills per Hour: ${formatInteger(rates.killsPerHour)}`,
    `EXP per Hour: ${formatInteger(rates.expPerHour)}`,
    `Credit per Hour: ${formatInteger(rates.creditPerHour)}`,
    `Faction Coin per Hour: ${formatInteger(rates.factionCoinPerHour)}`,
  ]
  return lines.join('\n')
}

export function buildSessionSummary(
  spot: SpotInfo,
  testData: TestDataInputs,
  rates: RateResults | null,
  results: SessionResults,
): string {
  const lines = [
    'RF NEXT Farming Calculator — Actual Session Summary',
    `Spot Name: ${spot.spotName || '—'}`,
    `Monster Name: ${spot.monsterName || '—'}`,
    `Map: ${spot.map || '—'}`,
    `Farming Duration: ${testData.minutes ?? 0}m ${testData.seconds ?? 0}s`,
    `Total Kills: ${formatInteger(testData.totalKills)}`,
  ]

  if (rates) {
    lines.push(
      `Kill per Minute: ${formatDecimal(rates.kpm, 2)}`,
      `Credit per Hour: ${formatInteger(rates.creditPerHour)}`,
      `EXP per Hour: ${formatInteger(rates.expPerHour)}`,
      `Faction Coin per Hour: ${formatInteger(rates.factionCoinPerHour)}`,
    )
  }

  lines.push(
    `Credit Earned: ${formatInteger(results.creditEarned)}`,
    `EXP % Gained: ${formatDecimal(results.expPercentGained, 4)}%`,
    `EXP % per Kill: ${formatDecimal(results.expPercentPerKill, 4)}%`,
    `Faction Coin Earned: ${formatInteger(results.factionCoinEarned)}`,
    `Loot Value: ${formatInteger(results.lootValue)}`,
    `Net Credit: ${formatInteger(results.netCredit)}`,
    `Total Farming Value: ${formatInteger(results.totalFarmingValue)}`,
    `Verification: ${VERIFICATION_LABELS[results.verification]}`,
  )

  return lines.join('\n')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
