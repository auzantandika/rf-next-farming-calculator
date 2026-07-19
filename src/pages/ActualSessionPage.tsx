import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { ResultsCards } from '../components/ResultsCards'
import { RewardFields } from '../components/RewardFields'
import { SpotFields } from '../components/SpotFields'
import {
  VERIFICATION_LABELS,
  calculateRates,
  calculateSessionResults,
  deriveExpPercentPerKill,
  derivePerKillFromTotals,
  earnedDelta,
} from '../lib/calculations'
import { buildSessionSummary, copyText } from '../lib/copySummary'
import { formatDecimal, formatInteger } from '../lib/numbers'
import { sampleSessionForm } from '../lib/sampleData'
import { newId } from '../lib/storage'
import type { LootDrop, SavedSession, SessionFormState } from '../types'

const emptyForm: SessionFormState = {
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
  startingCredit: null,
  endingCredit: null,
  startingExpPercent: null,
  endingExpPercent: null,
  startingFactionCoin: null,
  endingFactionCoin: null,
  potionCost: null,
  consumableCost: null,
  otherCosts: null,
  lootDrops: [],
}

interface ActualSessionPageProps {
  onSave: (session: SavedSession) => void
  onToast: (message: string) => void
}

export function ActualSessionPage({
  onSave,
  onToast,
}: ActualSessionPageProps) {
  const [form, setForm] = useState<SessionFormState>(emptyForm)
  const [showResults, setShowResults] = useState(false)
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

  const testData = {
    minutes: form.minutes,
    seconds: form.seconds,
    totalKills: form.totalKills,
  }

  const rewards = {
    creditPerKill: form.creditPerKill,
    expPerKill: form.expPerKill,
    factionCoinPerKill: form.factionCoinPerKill,
    expBonusPercent: form.expBonusPercent,
    rewardsIncludeBuffs: form.rewardsIncludeBuffs,
  }

  const sessionCosts = {
    startingCredit: form.startingCredit,
    endingCredit: form.endingCredit,
    startingExpPercent: form.startingExpPercent,
    endingExpPercent: form.endingExpPercent,
    startingFactionCoin: form.startingFactionCoin,
    endingFactionCoin: form.endingFactionCoin,
    potionCost: form.potionCost,
    consumableCost: form.consumableCost,
    otherCosts: form.otherCosts,
    lootDrops: form.lootDrops,
  }

  const rates = showResults ? calculateRates(testData, rewards) : null
  const sessionResults = showResults
    ? calculateSessionResults(testData, rewards, sessionCosts)
    : null

  const handleDerivePerKill = () => {
    const derived = derivePerKillFromTotals(form.totalKills, {
      creditEarned: earnedDelta(form.startingCredit, form.endingCredit),
      factionCoinEarned: earnedDelta(
        form.startingFactionCoin,
        form.endingFactionCoin,
      ),
    })
    const percentPerKill = deriveExpPercentPerKill(
      form.totalKills,
      form.startingExpPercent,
      form.endingExpPercent,
    )

    if (!derived && percentPerKill == null) {
      onToast(
        'Enter Total Kills plus Credit/FC wallet points, and/or EXP % before and after.',
      )
      return
    }

    if (derived) {
      setForm((prev) => ({
        ...prev,
        creditPerKill: derived.creditPerKill ?? prev.creditPerKill,
        factionCoinPerKill:
          derived.factionCoinPerKill ?? prev.factionCoinPerKill,
        rewardsIncludeBuffs: true,
        expBonusPercent: 0,
      }))
    }

    setShowResults(false)
    const parts: string[] = []
    if (derived) parts.push(`${derived.derivedCount} wallet average(s)`)
    if (percentPerKill != null) {
      parts.push(`${formatDecimal(percentPerKill, 4)}% EXP per kill`)
    }
    parts.push('EXP points still come from the kill popup')
    onToast(`Derived ${parts.join(' · ')}.`)
  }

  const handleCalculate = () => {
    const nextRates = calculateRates(testData, rewards)
    if (!nextRates) {
      setShowResults(false)
      setError(
        'Enter a valid Farming Duration and Total Kills greater than zero.',
      )
      return
    }
    setError(null)
    setShowResults(true)
  }

  const handleSave = () => {
    const nextRates = calculateRates(testData, rewards)
    const results = calculateSessionResults(testData, rewards, sessionCosts)
    if (!nextRates) {
      setError('Calculate a valid session before saving.')
      return
    }
    const now = new Date().toISOString()
    const label =
      form.spotName.trim() ||
      form.monsterName.trim() ||
      'Untitled Actual Session'
    onSave({
      id: newId(),
      createdAt: now,
      updatedAt: now,
      kind: 'session',
      label,
      spot,
      testData,
      rewards,
      rates: nextRates,
      session: sessionCosts,
      sessionResults: results,
    })
    onToast('Session saved to History.')
  }

  const updateDrop = (id: string, patch: Partial<LootDrop>) => {
    setForm((prev) => ({
      ...prev,
      lootDrops: prev.lootDrops.map((drop) =>
        drop.id === id ? { ...drop, ...patch } : drop,
      ),
    }))
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Actual Session</h1>
        <p>
          Log a real farming run, subtract costs, value loot, and verify whether
          results match your per-kill estimates.
        </p>
      </header>

      <div className="toolbar">
        <button type="button" className="btn primary" onClick={handleCalculate}>
          Calculate
        </button>
        <button type="button" className="btn" onClick={handleDerivePerKill}>
          Derive Per Kill
        </button>
        <button type="button" className="btn" onClick={handleSave}>
          Save Session
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setForm(emptyForm)
            setShowResults(false)
            setError(null)
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            if (!sessionResults) {
              onToast('Calculate results before copying a summary.')
              return
            }
            const ok = await copyText(
              buildSessionSummary(spot, testData, rates, sessionResults),
            )
            onToast(ok ? 'Summary copied.' : 'Could not copy summary.')
          }}
        >
          Copy Summary
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setForm(sampleSessionForm)
            setShowResults(true)
            setError(null)
            onToast('Sample data loaded.')
          }}
        >
          Use Sample Data
        </button>
      </div>

      {error ? <p className="banner error" role="alert">{error}</p> : null}

      <SpotFields
        idPrefix="session"
        value={spot}
        onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
      />
      <RewardFields
        idPrefix="session"
        rewards={rewards}
        testData={testData}
        onRewardsChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
        onTestDataChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
      />

      <section className="panel">
        <div className="panel-head">
          <h2>Wallet Totals</h2>
          <button type="button" className="btn" onClick={handleDerivePerKill}>
            Derive Per Kill
          </button>
        </div>
        <p className="muted">
          Credit and Faction Coin use wallet point balances. EXP uses the HUD
          percent bar (for example 30.1631%). EXP points for hourly rates still
          come from the kill popup into EXP per Kill.
        </p>
        <div className="grid-2">
          <NumberField
            id="session-start-credit"
            label="Starting Credit (points)"
            value={form.startingCredit}
            onChange={(v) => setForm((p) => ({ ...p, startingCredit: v }))}
          />
          <NumberField
            id="session-end-credit"
            label="Ending Credit (points)"
            value={form.endingCredit}
            onChange={(v) => setForm((p) => ({ ...p, endingCredit: v }))}
          />
          <NumberField
            id="session-start-fc"
            label="Starting Faction Coin (points)"
            value={form.startingFactionCoin}
            onChange={(v) =>
              setForm((p) => ({ ...p, startingFactionCoin: v }))
            }
          />
          <NumberField
            id="session-end-fc"
            label="Ending Faction Coin (points)"
            value={form.endingFactionCoin}
            onChange={(v) => setForm((p) => ({ ...p, endingFactionCoin: v }))}
          />
          <NumberField
            id="session-start-exp-pct"
            label="Starting EXP %"
            value={form.startingExpPercent}
            onChange={(v) => setForm((p) => ({ ...p, startingExpPercent: v }))}
            mode="decimal"
            placeholder="30.1631"
            hint="HUD EXP bar percent"
          />
          <NumberField
            id="session-end-exp-pct"
            label="Ending EXP %"
            value={form.endingExpPercent}
            onChange={(v) => setForm((p) => ({ ...p, endingExpPercent: v }))}
            mode="decimal"
            placeholder="32.1631"
            hint="HUD EXP bar percent after farming"
          />
        </div>
      </section>

      <section className="panel">
        <h2>Costs</h2>
        <div className="grid-3">
          <NumberField
            id="session-potion"
            label="Potion Cost"
            value={form.potionCost}
            onChange={(v) => setForm((p) => ({ ...p, potionCost: v }))}
          />
          <NumberField
            id="session-consumable"
            label="Consumable Cost"
            value={form.consumableCost}
            onChange={(v) => setForm((p) => ({ ...p, consumableCost: v }))}
          />
          <NumberField
            id="session-other"
            label="Other Costs"
            value={form.otherCosts}
            onChange={(v) => setForm((p) => ({ ...p, otherCosts: v }))}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Loot Value</h2>
          <button
            type="button"
            className="btn"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                lootDrops: [
                  ...prev.lootDrops,
                  {
                    id: newId(),
                    name: '',
                    quantity: 1,
                    unitValue: 0,
                  },
                ],
              }))
            }
          >
            Add Drop
          </button>
        </div>
        {form.lootDrops.length === 0 ? (
          <p className="empty-state">
            No loot rows yet. Add drops to include market value in Total Farming
            Value.
          </p>
        ) : (
          <div className="loot-list">
            {form.lootDrops.map((drop) => (
              <div className="loot-row" key={drop.id}>
                <label className="field">
                  <span className="field-label">Item</span>
                  <input
                    className="field-input"
                    value={drop.name}
                    onChange={(e) =>
                      updateDrop(drop.id, { name: e.target.value })
                    }
                    placeholder="Drop name"
                  />
                </label>
                <NumberField
                  id={`qty-${drop.id}`}
                  label="Qty"
                  value={drop.quantity}
                  onChange={(v) =>
                    updateDrop(drop.id, { quantity: v ?? 0 })
                  }
                />
                <NumberField
                  id={`val-${drop.id}`}
                  label="Unit Value"
                  value={drop.unitValue}
                  onChange={(v) =>
                    updateDrop(drop.id, { unitValue: v ?? 0 })
                  }
                />
                <button
                  type="button"
                  className="btn danger"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      lootDrops: prev.lootDrops.filter((d) => d.id !== drop.id),
                    }))
                  }
                >
                  Remove Drop
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ResultsCards rates={rates} projection={null} projectionMinutes={null} />

      {sessionResults ? (
        <section className="panel">
          <h2>Session Totals</h2>
          <div className="stat-grid">
            <article className="stat">
              <h3>Credit Earned</h3>
              <p className="stat-value">
                {formatInteger(sessionResults.creditEarned)}
              </p>
            </article>
            <article className="stat">
              <h3>EXP % Gained</h3>
              <p className="stat-value">
                {formatDecimal(sessionResults.expPercentGained, 4)}%
              </p>
            </article>
            <article className="stat">
              <h3>EXP % per Kill</h3>
              <p className="stat-value">
                {formatDecimal(sessionResults.expPercentPerKill, 4)}%
              </p>
            </article>
            <article className="stat">
              <h3>Faction Coin Earned</h3>
              <p className="stat-value">
                {formatInteger(sessionResults.factionCoinEarned)}
              </p>
            </article>
            <article className="stat">
              <h3>Loot Value</h3>
              <p className="stat-value">
                {formatInteger(sessionResults.lootValue)}
              </p>
            </article>
            <article className="stat">
              <h3>Net Credit</h3>
              <p className="stat-value">
                {formatInteger(sessionResults.netCredit)}
              </p>
            </article>
            <article className="stat">
              <h3>Total Farming Value</h3>
              <p className="stat-value">
                {formatInteger(sessionResults.totalFarmingValue)}
              </p>
            </article>
          </div>
          <div className={`verify verify-${sessionResults.verification}`}>
            <strong>
              {VERIFICATION_LABELS[sessionResults.verification]}
            </strong>
            <p>{sessionResults.verificationNote}</p>
          </div>
        </section>
      ) : null}

      <div className="bottom-actions" aria-label="Bottom actions">
        <div className="toolbar">
          <button
            type="button"
            className="btn primary"
            onClick={handleCalculate}
          >
            Calculate
          </button>
          <button type="button" className="btn" onClick={handleDerivePerKill}>
            Derive Per Kill
          </button>
          <button type="button" className="btn" onClick={handleSave}>
            Save Session
          </button>
        </div>
      </div>
    </div>
  )
}
