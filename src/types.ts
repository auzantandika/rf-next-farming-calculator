export type FarmingMode = 'solo' | 'party'

export type TabId =
  | 'kpm'
  | 'session'
  | 'compare'
  | 'history'
  | 'guide'

export type VerificationStatus =
  | 'consistent'
  | 'mixed_monsters'
  | 'additional_rewards'
  | 'insufficient_data'

export interface LootDrop {
  id: string
  name: string
  quantity: number
  unitValue: number
}

export interface SpotInfo {
  spotName: string
  monsterName: string
  map: string
  monsterLevel: number | null
  characterLevel: number | null
  classBiosuit: string
  combatPower: number | null
  farmingMode: FarmingMode
}

export interface RewardInputs {
  creditPerKill: number | null
  expPerKill: number | null
  factionCoinPerKill: number | null
  expBonusPercent: number | null
  rewardsIncludeBuffs: boolean
}

export interface TestDataInputs {
  minutes: number | null
  seconds: number | null
  totalKills: number | null
}

export interface KpmFormState extends SpotInfo, RewardInputs, TestDataInputs {
  projectionMinutes: number | null
  targetKills: number | null
  targetExp: number | null
  targetCredit: number | null
  targetFactionCoin: number | null
}

export interface SessionCostInputs {
  startingCredit: number | null
  endingCredit: number | null
  startingExp: number | null
  endingExp: number | null
  startingFactionCoin: number | null
  endingFactionCoin: number | null
  potionCost: number | null
  consumableCost: number | null
  otherCosts: number | null
  lootDrops: LootDrop[]
}

export interface SessionFormState
  extends SpotInfo,
    RewardInputs,
    TestDataInputs,
    SessionCostInputs {}

export interface RateResults {
  durationMinutes: number
  kpm: number
  secondsPerKill: number
  killsPerHour: number
  expPerMinute: number
  expPerHour: number
  creditPerHour: number
  factionCoinPerHour: number
  effectiveExpPerKill: number
}

export interface ProjectionResults {
  estimatedKills: number
  estimatedExp: number
  estimatedCredit: number
  estimatedFactionCoin: number
  timeToTargetKillsMinutes: number | null
  timeToTargetExpMinutes: number | null
  timeToTargetCreditMinutes: number | null
  timeToTargetFactionCoinMinutes: number | null
}

export interface SessionResults {
  creditEarned: number | null
  expEarned: number | null
  factionCoinEarned: number | null
  lootValue: number
  totalCosts: number
  netCredit: number | null
  totalFarmingValue: number | null
  verification: VerificationStatus
  verificationNote: string
}

export interface SavedSession {
  id: string
  createdAt: string
  updatedAt: string
  kind: 'kpm' | 'session'
  label: string
  spot: SpotInfo
  testData: TestDataInputs
  rewards: RewardInputs
  rates: RateResults | null
  session?: SessionCostInputs
  sessionResults?: SessionResults
  notes?: string
}

export interface ExportPayload {
  version: 1
  exportedAt: string
  app: 'rf-next-farming-calculator'
  sessions: SavedSession[]
}
