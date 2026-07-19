import type { FarmingMode, SpotInfo } from '../types'
import { NumberField } from './NumberField'

interface SpotFieldsProps {
  value: SpotInfo
  onChange: (next: SpotInfo) => void
  idPrefix: string
}

export function SpotFields({ value, onChange, idPrefix }: SpotFieldsProps) {
  const set = <K extends keyof SpotInfo>(key: K, next: SpotInfo[K]) => {
    onChange({ ...value, [key]: next })
  }

  return (
    <section className="panel">
      <h2>Spot Information</h2>
      <div className="grid-2">
        <label className="field" htmlFor={`${idPrefix}-spot`}>
          <span className="field-label">Spot Name</span>
          <input
            id={`${idPrefix}-spot`}
            className="field-input"
            value={value.spotName}
            onChange={(e) => set('spotName', e.target.value)}
            placeholder="e.g. Eastern Ridge"
          />
        </label>
        <label className="field" htmlFor={`${idPrefix}-monster`}>
          <span className="field-label">Monster Name</span>
          <input
            id={`${idPrefix}-monster`}
            className="field-input"
            value={value.monsterName}
            onChange={(e) => set('monsterName', e.target.value)}
            placeholder="e.g. Desert Stalker"
          />
        </label>
        <label className="field" htmlFor={`${idPrefix}-map`}>
          <span className="field-label">Map</span>
          <input
            id={`${idPrefix}-map`}
            className="field-input"
            value={value.map}
            onChange={(e) => set('map', e.target.value)}
            placeholder="e.g. Edora"
          />
        </label>
        <label className="field" htmlFor={`${idPrefix}-class`}>
          <span className="field-label">Class / Biosuit</span>
          <input
            id={`${idPrefix}-class`}
            className="field-input"
            value={value.classBiosuit}
            onChange={(e) => set('classBiosuit', e.target.value)}
            placeholder="e.g. Ranger / Assault"
          />
        </label>
        <NumberField
          id={`${idPrefix}-monster-level`}
          label="Monster Level"
          value={value.monsterLevel}
          onChange={(v) => set('monsterLevel', v)}
          placeholder="45"
        />
        <NumberField
          id={`${idPrefix}-char-level`}
          label="Character Level"
          value={value.characterLevel}
          onChange={(v) => set('characterLevel', v)}
          placeholder="48"
        />
        <NumberField
          id={`${idPrefix}-cp`}
          label="Combat Power"
          value={value.combatPower}
          onChange={(v) => set('combatPower', v)}
          placeholder="12500"
        />
        <fieldset className="field field-fieldset">
          <legend className="field-label">Farming Mode</legend>
          <div className="segmented" role="group" aria-label="Farming Mode">
            {([
              ['solo', 'Solo'],
              ['party', 'Party'],
            ] as Array<[FarmingMode, string]>).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                className={
                  value.farmingMode === mode
                    ? 'segmented-btn active'
                    : 'segmented-btn'
                }
                onClick={() => set('farmingMode', mode)}
                aria-pressed={value.farmingMode === mode}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  )
}
