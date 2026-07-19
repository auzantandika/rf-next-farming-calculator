import { useMemo, useState } from 'react'
import { ResultsCards } from '../components/ResultsCards'
import { RewardFields } from '../components/RewardFields'
import { SessionMeasuredCards } from '../components/SessionMeasuredCards'
import { SpotFields } from '../components/SpotFields'
import { NumberField } from '../components/NumberField'
import {
  calculateProjection,
  calculateRates,
  measureSessionRates,
  type MeasuredSessionRates,
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

interface DeriveWallet {
  startingCredit: number | null
  endingCredit: number | null
  startingExpPercent: number | null
  endingExpPercent: number | null
  startingContributionPercent: number | null
  endingContributionPercent: number | null
}

const emptyWallet: DeriveWallet = {
  startingCredit: null,
  endingCredit: null,
  startingExpPercent: null,
  endingExpPercent: null,
  startingContributionPercent: null,
  endingContributionPercent: null,
}

interface KpmCalculatorPageProps {
  onSave: (session: SavedSession) => void
  onToast: (message: string) => void
}

export function KpmCalculatorPage({ onSave, onToast }: KpmCalculatorPageProps) {
  const [form, setForm] = useState<KpmFormState>(emptyForm)
  const [wallet, setWallet] = useState<DeriveWallet>(emptyWallet)
  const [measured, setMeasured] = useState<MeasuredSessionRates | null>(null)
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

  const applyMeasuredAndCalculate = () => {
    const sessionMeasured = measureSessionRates(testData, wallet)
    const nextRewards = {
      ...rewards,
      creditPerKill:
        sessionMeasured?.creditPerKill ?? rewards.creditPerKill,
      rewardsIncludeBuffs: true,
    }

    const nextRates = calculateRates(testData, nextRewards)
    if (!nextRates && !sessionMeasured) {
      setCalculated(false)
      setMeasured(null)
      setError(
        'Enter Farming Duration and Total Kills, plus rewards and/or Auto-Calc start/end values.',
      )
      return
    }

    if (sessionMeasured?.creditPerKill != null) {
      setForm((prev) => ({
        ...prev,
        creditPerKill: sessionMeasured.creditPerKill,
        rewardsIncludeBuffs: true,
      }))
    }

    setMeasured(sessionMeasured)
    setError(null)
    setCalculated(!!nextRates)
    onToast(
      sessionMeasured
        ? 'Session measured. Scroll down for Measured from This Session + Results.'
        : 'Calculated from kill-popup rewards.',
    )
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

  const actionButtons = (
    <>
      <button
        type="button"
        className="btn primary"
        onClick={applyMeasuredAndCalculate}
      >
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
          setWallet(emptyWallet)
          setMeasured(null)
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
          setMeasured(null)
          setError(null)
          onToast('Sample data loaded.')
        }}
      >
        Use Sample Data
      </button>
    </>
  )

  return (
    <div className="page">
      <header className="page-header">
        <h1>KPM Calculator</h1>
        <p>
          Fill Test Data + Auto-Calc (and kill-popup rewards), then press
          Calculate to see measured session rates and hourly projections.
        </p>
      </header>

      <div className="toolbar">{actionButtons}</div>

      {error ? <p className="banner error" role="alert">{error}</p> : null}

      <SpotFields
        idPrefix="kpm"
        value={spot}
        onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
      />

      <RewardFields
        idPrefix="kpm"
        show="test"
        rewards={rewards}
        testData={testData}
        onRewardsChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
        onTestDataChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
      />

      <section className="panel">
        <div className="panel-head">
          <h2>Auto-Calc Per Kill</h2>
          <button
            type="button"
            className="btn primary"
            onClick={applyMeasuredAndCalculate}
          >
            Calculate
          </button>
        </div>
        <p className="muted">
          After a farm window (for example 5 minutes), enter start/end values
          below, keep Test Data filled, then press Calculate. The app shows
          Credit earned / hour from your wallet and EXP / Contribution % rates
          from the HUD bars.
        </p>
        <div className="grid-2">
          <NumberField
            id="kpm-start-credit"
            label="Starting Credit (points)"
            value={wallet.startingCredit}
            onChange={(v) => setWallet((p) => ({ ...p, startingCredit: v }))}
          />
          <NumberField
            id="kpm-end-credit"
            label="Ending Credit (points)"
            value={wallet.endingCredit}
            onChange={(v) => setWallet((p) => ({ ...p, endingCredit: v }))}
          />
          <NumberField
            id="kpm-start-exp-pct"
            label="Starting EXP %"
            value={wallet.startingExpPercent}
            onChange={(v) =>
              setWallet((p) => ({ ...p, startingExpPercent: v }))
            }
            mode="decimal"
            placeholder="30.1631"
            hint="HUD EXP bar percent"
          />
          <NumberField
            id="kpm-end-exp-pct"
            label="Ending EXP %"
            value={wallet.endingExpPercent}
            onChange={(v) =>
              setWallet((p) => ({ ...p, endingExpPercent: v }))
            }
            mode="decimal"
            placeholder="32.1631"
            hint="HUD EXP bar after farming"
          />
          <NumberField
            id="kpm-start-contrib-pct"
            label="Starting Contribution %"
            value={wallet.startingContributionPercent}
            onChange={(v) =>
              setWallet((p) => ({ ...p, startingContributionPercent: v }))
            }
            mode="decimal"
            placeholder="35.5"
            hint="From Contribution Lv. xx(yy.y%)"
          />
          <NumberField
            id="kpm-end-contrib-pct"
            label="Ending Contribution %"
            value={wallet.endingContributionPercent}
            onChange={(v) =>
              setWallet((p) => ({ ...p, endingContributionPercent: v }))
            }
            mode="decimal"
            placeholder="37.5"
            hint="Same Contribution bar after farming"
          />
        </div>
      </section>

      <RewardFields
        idPrefix="kpm"
        show="rewards"
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

      <SessionMeasuredCards measured={measured} />

      <ResultsCards
        rates={rates}
        projection={projection}
        projectionMinutes={form.projectionMinutes}
      />

      <div className="bottom-actions" aria-label="Bottom actions">
        <div className="toolbar">{actionButtons}</div>
      </div>
    </div>
  )
}
