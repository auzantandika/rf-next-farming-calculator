import type { RewardInputs, TestDataInputs } from '../types'
import { NumberField } from './NumberField'

interface RewardFieldsProps {
  rewards: RewardInputs
  testData: TestDataInputs
  onRewardsChange: (next: RewardInputs) => void
  onTestDataChange: (next: TestDataInputs) => void
  idPrefix: string
}

export function RewardFields({
  rewards,
  testData,
  onRewardsChange,
  onTestDataChange,
  idPrefix,
}: RewardFieldsProps) {
  return (
    <>
      <section className="panel">
        <h2>Test Data</h2>
        <div className="grid-3">
          <NumberField
            id={`${idPrefix}-minutes`}
            label="Minutes"
            value={testData.minutes}
            onChange={(v) => onTestDataChange({ ...testData, minutes: v })}
            placeholder="10"
          />
          <NumberField
            id={`${idPrefix}-seconds`}
            label="Seconds"
            value={testData.seconds}
            onChange={(v) => onTestDataChange({ ...testData, seconds: v })}
            placeholder="0"
          />
          <NumberField
            id={`${idPrefix}-kills`}
            label="Total Kills"
            value={testData.totalKills}
            onChange={(v) => onTestDataChange({ ...testData, totalKills: v })}
            placeholder="200"
          />
        </div>
        <p className="muted">
          Farming Duration is Minutes + Seconds. Use a clean kill window for
          the most accurate Kill per Minute.
        </p>
      </section>

      <section className="panel">
        <h2>Rewards</h2>
        <div className="grid-2">
          <NumberField
            id={`${idPrefix}-credit`}
            label="Credit per Kill"
            value={rewards.creditPerKill}
            onChange={(v) =>
              onRewardsChange({ ...rewards, creditPerKill: v })
            }
            placeholder="617"
          />
          <NumberField
            id={`${idPrefix}-exp`}
            label="EXP per Kill"
            value={rewards.expPerKill}
            onChange={(v) => onRewardsChange({ ...rewards, expPerKill: v })}
            placeholder="23,621"
            hint="Accepts 23621, 23,621, 23.621, or 23 621"
          />
          <NumberField
            id={`${idPrefix}-fc`}
            label="Faction Coin per Kill"
            value={rewards.factionCoinPerKill}
            onChange={(v) =>
              onRewardsChange({ ...rewards, factionCoinPerKill: v })
            }
            placeholder="6,590"
          />
          <NumberField
            id={`${idPrefix}-exp-bonus`}
            label="EXP Bonus"
            value={rewards.expBonusPercent}
            onChange={(v) =>
              onRewardsChange({ ...rewards, expBonusPercent: v })
            }
            mode="decimal"
            placeholder="0"
            hint="Percent. Ignored when rewards already include buffs."
          />
        </div>
        <label className="checkbox-row" htmlFor={`${idPrefix}-buffs`}>
          <input
            id={`${idPrefix}-buffs`}
            type="checkbox"
            checked={rewards.rewardsIncludeBuffs}
            onChange={(e) =>
              onRewardsChange({
                ...rewards,
                rewardsIncludeBuffs: e.target.checked,
              })
            }
          />
          <span>Rewards Already Include Buffs</span>
        </label>
      </section>
    </>
  )
}
