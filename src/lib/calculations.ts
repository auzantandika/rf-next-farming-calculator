import type {
  LootDrop,
  ProjectionResults,
  RateResults,
  RewardInputs,
  SessionCostInputs,
  SessionResults,
  TestDataInputs,
  VerificationStatus,
} from '../types'
import { safeNumber } from './numbers'

export function durationMinutesFromParts(
  minutes: number | null | undefined,
  seconds: number | null | undefined,
): number | null {
  const m = minutes ?? 0
  const s = seconds ?? 0
  if (!Number.isFinite(m) || !Number.isFinite(s)) return null
  if (m < 0 || s < 0) return null
  if (m === 0 && s === 0) return null
  return m + s / 60
}

export function effectiveExpPerKill(rewards: RewardInputs): number | null {
  const base = rewards.expPerKill
  if (base == null || !Number.isFinite(base)) return null
  if (rewards.rewardsIncludeBuffs) return base
  const bonus = rewards.expBonusPercent ?? 0
  if (!Number.isFinite(bonus)) return base
  return base * (1 + bonus / 100)
}

/**
 * Average Credit per kill from wallet point totals.
 * EXP / Contribution points cannot be derived from HUD % bars — use the kill popup.
 */
export function derivePerKillFromTotals(
  totalKills: number | null | undefined,
  earned: {
    creditEarned: number | null | undefined
  },
): {
  creditPerKill: number | null
  derivedCount: number
} | null {
  if (totalKills == null || !Number.isFinite(totalKills) || totalKills <= 0) {
    return null
  }

  const average = (value: number | null | undefined): number | null => {
    if (value == null || !Number.isFinite(value) || value < 0) return null
    return Math.round(value / totalKills)
  }

  const creditPerKill = average(earned.creditEarned)
  if (creditPerKill == null) return null

  return {
    creditPerKill,
    derivedCount: 1,
  }
}

/** Average HUD % gained per kill from before/after bar readings (EXP or Contribution). */
export function deriveHudPercentPerKill(
  totalKills: number | null | undefined,
  startingPercent: number | null | undefined,
  endingPercent: number | null | undefined,
): number | null {
  if (totalKills == null || !Number.isFinite(totalKills) || totalKills <= 0) {
    return null
  }
  const gained = earnedDelta(startingPercent, endingPercent)
  if (gained == null || gained < 0) return null
  const perKill = gained / totalKills
  return Number.isFinite(perKill) ? perKill : null
}

export function earnedDelta(
  start: number | null | undefined,
  end: number | null | undefined,
): number | null {
  if (start == null || end == null) return null
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return end - start
}

export function calculateRates(
  testData: TestDataInputs,
  rewards: RewardInputs,
): RateResults | null {
  const durationMinutes = durationMinutesFromParts(
    testData.minutes,
    testData.seconds,
  )
  const totalKills = testData.totalKills

  if (
    durationMinutes == null ||
    totalKills == null ||
    totalKills <= 0 ||
    durationMinutes <= 0
  ) {
    return null
  }

  const kpm = totalKills / durationMinutes
  const secondsPerKill = (durationMinutes * 60) / totalKills
  const killsPerHour = kpm * 60

  const creditPerKill = rewards.creditPerKill ?? 0
  const factionCoinPerKill = rewards.factionCoinPerKill ?? 0
  const effExp = effectiveExpPerKill(rewards) ?? 0

  const creditPerHour = creditPerKill * killsPerHour
  const factionCoinPerHour = factionCoinPerKill * killsPerHour
  const expPerHour = effExp * killsPerHour
  const expPerMinute = effExp * kpm

  const result: RateResults = {
    durationMinutes,
    kpm,
    secondsPerKill,
    killsPerHour,
    expPerMinute,
    expPerHour,
    creditPerHour,
    factionCoinPerHour,
    effectiveExpPerKill: effExp,
  }

  for (const value of Object.values(result)) {
    if (!Number.isFinite(value)) return null
  }

  return result
}

export function calculateProjection(
  rates: RateResults | null,
  rewards: RewardInputs,
  projectionMinutes: number | null,
  targets: {
    targetKills: number | null
    targetExp: number | null
    targetCredit: number | null
    targetFactionCoin: number | null
  },
): ProjectionResults | null {
  if (!rates) return null

  const minutes = projectionMinutes ?? 60
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const estimatedKills = rates.kpm * minutes
  const estimatedCredit = (rewards.creditPerKill ?? 0) * estimatedKills
  const estimatedFactionCoin = (rewards.factionCoinPerKill ?? 0) * estimatedKills
  const estimatedExp = rates.effectiveExpPerKill * estimatedKills

  const timeFor = (
    target: number | null,
    perMinute: number,
  ): number | null => {
    if (target == null || !Number.isFinite(target) || target <= 0) return null
    if (!Number.isFinite(perMinute) || perMinute <= 0) return null
    return target / perMinute
  }

  const projection: ProjectionResults = {
    estimatedKills,
    estimatedExp,
    estimatedCredit,
    estimatedFactionCoin,
    timeToTargetKillsMinutes: timeFor(targets.targetKills, rates.kpm),
    timeToTargetExpMinutes: timeFor(targets.targetExp, rates.expPerMinute),
    timeToTargetCreditMinutes: timeFor(
      targets.targetCredit,
      rates.creditPerHour / 60,
    ),
    timeToTargetFactionCoinMinutes: timeFor(
      targets.targetFactionCoin,
      rates.factionCoinPerHour / 60,
    ),
  }

  for (const [key, value] of Object.entries(projection)) {
    if (key.startsWith('timeTo')) continue
    if (typeof value === 'number' && !Number.isFinite(value)) return null
  }

  return projection
}

export function lootValueTotal(drops: LootDrop[]): number {
  return drops.reduce((sum, drop) => {
    const qty = Number.isFinite(drop.quantity) ? drop.quantity : 0
    const unit = Number.isFinite(drop.unitValue) ? drop.unitValue : 0
    return sum + qty * unit
  }, 0)
}

export function calculateSessionResults(
  testData: TestDataInputs,
  rewards: RewardInputs,
  session: SessionCostInputs,
): SessionResults {
  const rates = calculateRates(testData, rewards)
  const creditEarned = earnedDelta(session.startingCredit, session.endingCredit)
  const expPercentGained = earnedDelta(
    session.startingExpPercent,
    session.endingExpPercent,
  )
  const expPercentPerKill = deriveHudPercentPerKill(
    testData.totalKills,
    session.startingExpPercent,
    session.endingExpPercent,
  )
  const contributionPercentGained = earnedDelta(
    session.startingContributionPercent,
    session.endingContributionPercent,
  )
  const contributionPercentPerKill = deriveHudPercentPerKill(
    testData.totalKills,
    session.startingContributionPercent,
    session.endingContributionPercent,
  )

  const lootValue = lootValueTotal(session.lootDrops)
  const totalCosts =
    (session.potionCost ?? 0) +
    (session.consumableCost ?? 0) +
    (session.otherCosts ?? 0)

  const netCredit =
    creditEarned == null ? null : safeNumber(creditEarned - totalCosts)

  const totalFarmingValue =
    netCredit == null ? null : safeNumber(netCredit + lootValue)

  const { verification, verificationNote } = verifySession(
    rates,
    rewards,
    testData,
    { creditEarned },
  )

  return {
    creditEarned,
    expPercentGained,
    expPercentPerKill,
    contributionPercentGained,
    contributionPercentPerKill,
    lootValue,
    totalCosts,
    netCredit,
    totalFarmingValue,
    verification,
    verificationNote,
  }
}

function verifySession(
  rates: RateResults | null,
  rewards: RewardInputs,
  testData: TestDataInputs,
  earned: {
    creditEarned: number | null
  },
): { verification: VerificationStatus; verificationNote: string } {
  const kills = testData.totalKills
  if (!rates || kills == null || kills <= 0) {
    return {
      verification: 'insufficient_data',
      verificationNote:
        'Add farming duration, total kills, and reward values to verify consistency.',
    }
  }

  // EXP / Contribution HUD bars are %, so only Credit wallet points are
  // compared here. Faction Coin points come from the kill popup field.
  const checks: Array<{
    label: string
    expected: number | null
    actual: number | null
  }> = [
    {
      label: 'Credit',
      expected:
        rewards.creditPerKill == null
          ? null
          : rewards.creditPerKill * kills,
      actual: earned.creditEarned,
    },
  ]

  const usable = checks.filter(
    (c) => c.expected != null && c.actual != null && c.expected > 0,
  )

  if (usable.length === 0) {
    return {
      verification: 'insufficient_data',
      verificationNote:
        'Enter starting/ending totals or per-kill rewards to compare expected and actual gains.',
    }
  }

  let mixed = false
  let additional = false

  for (const check of usable) {
    const expected = check.expected as number
    const actual = check.actual as number
    const ratio = actual / expected
    const tolerance = 0.08

    if (ratio < 1 - tolerance) {
      mixed = true
    } else if (ratio > 1 + tolerance) {
      additional = true
    }
  }

  if (additional && !mixed) {
    return {
      verification: 'additional_rewards',
      verificationNote:
        'Actual gains are higher than per-kill estimates. Extra drops, quests, or buffs may be included.',
    }
  }

  if (mixed) {
    return {
      verification: 'mixed_monsters',
      verificationNote:
        'Actual gains are lower or uneven versus per-kill estimates. Mixed monsters or incomplete kill counts are possible.',
    }
  }

  return {
    verification: 'consistent',
    verificationNote:
      'Actual session totals align with the estimated per-kill rewards.',
  }
}

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  consistent: 'Consistent',
  mixed_monsters: 'Possible Mixed Monsters',
  additional_rewards: 'Additional Rewards Detected',
  insufficient_data: 'Insufficient Data',
}

export function comparisonWinners<T extends { id: string; label: string }>(
  items: Array<
    T & {
      rates: RateResults | null
      farmingValue: number | null
    }
  >,
): {
  highestKpm: T | null
  bestExp: T | null
  bestCredit: T | null
  bestFactionCoin: T | null
  bestFarmingValue: T | null
} {
  const pick = (
    score: (item: (typeof items)[number]) => number | null,
  ): T | null => {
    let best: (typeof items)[number] | null = null
    let bestScore = -Infinity
    for (const item of items) {
      const value = score(item)
      if (value == null || !Number.isFinite(value)) continue
      if (value > bestScore) {
        bestScore = value
        best = item
      }
    }
    return best
  }

  return {
    highestKpm: pick((i) => i.rates?.kpm ?? null),
    bestExp: pick((i) => i.rates?.expPerHour ?? null),
    bestCredit: pick((i) => i.rates?.creditPerHour ?? null),
    bestFactionCoin: pick((i) => i.rates?.factionCoinPerHour ?? null),
    bestFarmingValue: pick((i) => i.farmingValue),
  }
}
