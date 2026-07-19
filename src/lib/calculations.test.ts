import { describe, expect, it } from 'vitest'
import {
  calculateRates,
  deriveExpPercentPerKill,
  derivePerKillFromTotals,
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
  it('averages wallet point gains for Credit and Faction Coin', () => {
    const derived = derivePerKillFromTotals(200, {
      creditEarned: 123400,
      factionCoinEarned: 1318000,
    })

    expect(derived).toEqual({
      creditPerKill: 617,
      factionCoinPerKill: 6590,
      derivedCount: 2,
    })
  })
})

describe('deriveExpPercentPerKill', () => {
  it('averages HUD EXP percent gain across kills', () => {
    const perKill = deriveExpPercentPerKill(10, 30.1631, 30.2631)
    expect(perKill).toBeCloseTo(0.01, 5)
  })
})
