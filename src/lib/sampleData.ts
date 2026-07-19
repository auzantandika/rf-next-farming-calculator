import type { KpmFormState, SessionFormState } from '../types'

export const sampleKpmForm: KpmFormState = {
  spotName: 'Edora Plains Sample',
  monsterName: 'Sample Beast',
  map: 'Edora',
  monsterLevel: 45,
  characterLevel: 48,
  classBiosuit: 'Warrior / Standard',
  combatPower: 12500,
  farmingMode: 'solo',
  minutes: 10,
  seconds: 0,
  totalKills: 200,
  creditPerKill: 617,
  expPerKill: 23621,
  factionCoinPerKill: 6590,
  expBonusPercent: 0,
  rewardsIncludeBuffs: true,
  projectionMinutes: 60,
  targetKills: 1000,
  targetExp: null,
  targetCredit: null,
  targetFactionCoin: null,
}

export const sampleSessionForm: SessionFormState = {
  ...sampleKpmForm,
  startingCredit: 100000,
  endingCredit: 223400,
  startingExpPercent: 30.1631,
  endingExpPercent: 32.1631,
  startingFactionCoin: 20000,
  endingFactionCoin: 1338000,
  potionCost: 5000,
  consumableCost: 2500,
  otherCosts: 0,
  lootDrops: [
    {
      id: 'sample-drop-1',
      name: 'Ore Bundle',
      quantity: 12,
      unitValue: 800,
    },
  ],
}
