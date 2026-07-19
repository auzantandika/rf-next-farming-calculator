import { describe, expect, it } from 'vitest'
import {
  calculateRates,
  deriveHudPercentPerKill,
  derivePerKillFromTotals,
  measureSessionRates,
} from './calculations'

describe('calculateRates', () => {
  it('matches the official sample farming calculation', () => {
    const rates = calculateRates(
      { minutes: 10, seconds: 0, totalKills: 200 },
      {
        creditPerKill: 617,
        expPerKill: 23621,
        factionCoinPerKill: 6590,
        expBonusPercent: 0,
        rewardsIncludeBuffs: true,
      },
    )

    expect(rates).not.toBeNull()
    expect(rates!.kpm).toBe(20)
    expect(rates!.secondsPerKill).toBe(3)
    expect(rates!.killsPerHour).toBe(1200)
    expect(rates!.creditPerHour).toBe(740400)
    expect(rates!.expPerHour).toBe(28345200)
    expect(rates!.factionCoinPerHour).toBe(7908000)
  })
})

describe('derivePerKillFromTotals', () => {
  it('averages wallet point gains for Credit only', () => {
    const derived = derivePerKillFromTotals(200, {
      creditEarned: 123400,
    })

    expect(derived).toEqual({
      creditPerKill: 617,
      derivedCount: 1,
    })
  })
})

describe('deriveHudPercentPerKill', () => {
  it('averages HUD EXP percent gain across kills', () => {
    const perKill = deriveHudPercentPerKill(10, 30.1631, 30.2631)
    expect(perKill).toBeCloseTo(0.01, 5)
  })

  it('averages Contribution percent gain across kills', () => {
    const perKill = deriveHudPercentPerKill(10, 35.5, 36.5)
    expect(perKill).toBeCloseTo(0.1, 5)
  })
})

describe('measureSessionRates', () => {
  it('projects wallet and HUD gains over a 5-minute window', () => {
    const measured = measureSessionRates(
      { minutes: 5, seconds: 0, totalKills: 200 },
      {
        startingCredit: 58503613,
        endingCredit: 58567278,
        startingExpPercent: 30.2156,
        endingExpPercent: 30.3031,
        startingContributionPercent: 35.5,
        endingContributionPercent: 35.7,
      },
    )

    expect(measured).not.toBeNull()
    expect(measured!.creditEarned).toBe(63665)
    expect(measured!.creditPerKill).toBe(318)
    expect(measured!.creditPerHour).toBe(763980)
    expect(measured!.expPercentGained).toBeCloseTo(0.0875, 4)
    expect(measured!.expPercentPerHour).toBeCloseTo(1.05, 4)
    expect(measured!.contributionPercentGained).toBeCloseTo(0.2, 4)
    expect(measured!.contributionPercentPerHour).toBeCloseTo(2.4, 4)
  })
})


