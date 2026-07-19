import { useMemo, useState } from 'react'
import { ResultsCards } from '../components/ResultsCards'
import { RewardFields } from '../components/RewardFields'
import { SpotFields } from '../components/SpotFields'
import { NumberField } from '../components/NumberField'
import {
  calculateProjection,
  calculateRates,
} from '../lib/calculations'
import { buildKpmSummary, copyText } from '../lib/copySummary'
import { sampleKpmForm } from '../lib/sampleData'
import { newId } from '../lib/storage'
import type { KpmFormState, SavedSession } from '../types'

const emptyForm: KpmFormState = {
  spotName: '',
  monsterName: '',
  map: '',
  monsterLevel: null,
  characterLevel: null,
  classBiosuit: '',
  combatPower: null,
  farmingMode: 'solo',
  minutes: null,
  seconds: null,
  totalKills: null,
  creditPerKill: null,
  expPerKill: null,
  factionCoinPerKill: null,
  expBonusPercent: 0,
  rewardsIncludeBuffs: true,
  projectionMinutes: 60,
  targetKills: null,
  targetExp: null,
  targetCredit: null,
  targetFactionCoin: null,
}

interface KpmCalculatorPageProps {
  onSave: (session: SavedSession) => void
  onToast: (message: string) => void
}

export function KpmCalculatorPage({ onSave, onToast }: KpmCalculatorPageProps) {
  const [form, setForm] = useState<KpmFormState>(emptyForm)
  const [calculated, setCalculated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const spot = useMemo(
    () => ({
      spotName: form.spotName,
      monsterName: form.monsterName,
      map: form.map,
      monsterLevel: form.monsterLevel,
      characterLevel: form.characterLevel,
      classBiosuit: form.classBiosuit,
      combatPower: form.combatPower,
      farmingMode: form.farmingMode,
    }),
    [form],
  )

  const testData = useMemo(
    () => ({
      minutes: form.minutes,
      seconds: form.seconds,
      totalKills: form.totalKills,
    }),
    [form.minutes, form.seconds, form.totalKills],
  )

  const rewards = useMemo(
    () => ({
      creditPerKill: form.creditPerKill,
      expPerKill: form.expPerKill,
      factionCoinPerKill: form.factionCoinPerKill,
      expBonusPercent: form.expBonusPercent,
      rewardsIncludeBuffs: form.rewardsIncludeBuffs,
    }),
    [form],
  )

  const rates = calculated ? calculateRates(testData, rewards) : null
  const projection = calculated
    ? calculateProjection(rates, rewards, form.projectionMinutes, {
        targetKills: form.targetKills,
        targetExp: form.targetExp,
        targetCredit: form.targetCredit,
        targetFactionCoin: form.targetFactionCoin,
      })
    : null

  const handleCalculate = () => {
    const next = calculateRates(testData, rewards)
    if (!next) {
      setCalculated(false)
      setError(
        'Enter a valid Farming Duration and Total Kills greater than zero.',
      )
      return
    }
    setError(null)
    setCalculated(true)
  }

  const handleSave = () => {
    const nextRates = calculateRates(testData, rewards)
    if (!nextRates) {
      setError(
        'Calculate a valid session before saving. Duration and kills are required.',
      )
      return
    }
    const now = new Date().toISOString()
    const label =
      form.spotName.trim() ||
      form.monsterName.trim() ||
      'Untitled KPM Session'
    onSave({
      id: newId(),
      createdAt: now,
      updatedAt: now,
      kind: 'kpm',
      label,
      spot,
      testData,
      rewards,
      rates: nextRates,
    })
    onToast('Session saved to History.')
  }

  const handleCopy = async () => {
    const nextRates = rates ?? calculateRates(testData, rewards)
    if (!nextRates) {
      onToast('Calculate results before copying a summary.')
      return
    }
    const ok = await copyText(buildKpmSummary(spot, testData, nextRates))
    onToast(ok ? 'Summary copied.' : 'Could not copy summary.')
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>KPM Calculator</h1>
        <p>
          Measure Kill per Minute, then project EXP, Credit, and Faction Coin
          income for any farming spot.
        </p>
      </header>

      <div className="toolbar">
        <button type="button" className="btn primary" onClick={handleCalculate}>
          Calculate
        </button>
        <button type="button" className="btn" onClick={handleSave}>
          Save Session
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setForm(emptyForm)
            setCalculated(false)
            setError(null)
          }}
        >
          Reset
        </button>
        <button type="button" className="btn" onClick={handleCopy}>
          Copy Summary
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setForm(sampleKpmForm)
            setCalculated(true)
            setError(null)
            onToast('Sample data loaded.')
          }}
        >
          Use Sample Data
        </button>
      </div>

      {error ? <p className="banner error" role="alert">{error}</p> : null}

      <SpotFields
        idPrefix="kpm"
        value={spot}
        onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
      />
      <RewardFields
        idPrefix="kpm"
        rewards={rewards}
        testData={testData}
        onRewardsChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
        onTestDataChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
      />

      <section className="panel">
        <h2>Farming Projection</h2>
        <div className="grid-2">
          <NumberField
            id="kpm-projection-minutes"
            label="Projection Minutes"
            value={form.projectionMinutes}
            onChange={(v) =>
              setForm((prev) => ({ ...prev, projectionMinutes: v }))
            }
            placeholder="60"
          />
          <NumberField
            id="kpm-target-kills"
            label="Target Kills"
            value={form.targetKills}
            onChange={(v) => setForm((prev) => ({ ...prev, targetKills: v }))}
          />
          <NumberField
            id="kpm-target-exp"
            label="Target EXP"
            value={form.targetExp}
            onChange={(v) => setForm((prev) => ({ ...prev, targetExp: v }))}
          />
          <NumberField
            id="kpm-target-credit"
            label="Target Credit"
            value={form.targetCredit}
            onChange={(v) => setForm((prev) => ({ ...prev, targetCredit: v }))}
          />
          <NumberField
            id="kpm-target-fc"
            label="Target Faction Coin"
            value={form.targetFactionCoin}
            onChange={(v) =>
              setForm((prev) => ({ ...prev, targetFactionCoin: v }))
            }
          />
        </div>
      </section>

      <ResultsCards
        rates={rates}
        projection={projection}
        projectionMinutes={form.projectionMinutes}
      />
    </div>
  )
}
