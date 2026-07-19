import type { ProjectionResults, RateResults } from '../types'
import {
  formatDecimal,
  formatDurationMinutes,
  formatInteger,
} from '../lib/numbers'

interface ResultsCardsProps {
  rates: RateResults | null
  projection: ProjectionResults | null
  projectionMinutes: number | null
}

export function ResultsCards({
  rates,
  projection,
  projectionMinutes,
}: ResultsCardsProps) {
  if (!rates) {
    return (
      <section className="panel">
        <h2>Results</h2>
        <p className="empty-state">
          Enter Farming Duration and Total Kills, then press Calculate to see
          Kill per Minute and hourly projections.
        </p>
      </section>
    )
  }

  return (
    <>
      <section className="panel">
        <h2>Results</h2>
        <div className="stat-grid">
          <article className="stat">
            <h3>Kill per Minute</h3>
            <p className="stat-value">{formatDecimal(rates.kpm, 2)}</p>
          </article>
          <article className="stat">
            <h3>Seconds per Kill</h3>
            <p className="stat-value">
              {formatDecimal(rates.secondsPerKill, 2)}
            </p>
          </article>
          <article className="stat">
            <h3>Kills per Hour</h3>
            <p className="stat-value">{formatInteger(rates.killsPerHour)}</p>
          </article>
          <article className="stat">
            <h3>EXP per Minute</h3>
            <p className="stat-value">{formatInteger(rates.expPerMinute)}</p>
          </article>
          <article className="stat">
            <h3>EXP per Hour</h3>
            <p className="stat-value">{formatInteger(rates.expPerHour)}</p>
          </article>
          <article className="stat">
            <h3>Credit per Hour</h3>
            <p className="stat-value">{formatInteger(rates.creditPerHour)}</p>
          </article>
          <article className="stat">
            <h3>Faction Coin per Hour</h3>
            <p className="stat-value">
              {formatInteger(rates.factionCoinPerHour)}
            </p>
          </article>
        </div>
      </section>

      {projection ? (
        <section className="panel">
          <h2>Farming Projection</h2>
          <p className="muted">
            Projection window:{' '}
            {formatDurationMinutes(projectionMinutes ?? 60)}
          </p>
          <div className="stat-grid">
            <article className="stat">
              <h3>Estimated Kills</h3>
              <p className="stat-value">
                {formatInteger(projection.estimatedKills)}
              </p>
            </article>
            <article className="stat">
              <h3>Estimated EXP</h3>
              <p className="stat-value">
                {formatInteger(projection.estimatedExp)}
              </p>
            </article>
            <article className="stat">
              <h3>Estimated Credit</h3>
              <p className="stat-value">
                {formatInteger(projection.estimatedCredit)}
              </p>
            </article>
            <article className="stat">
              <h3>Estimated Faction Coin</h3>
              <p className="stat-value">
                {formatInteger(projection.estimatedFactionCoin)}
              </p>
            </article>
          </div>

          <h3 className="subhead">Time to Target</h3>
          <ul className="detail-list">
            <li>
              Target kills:{' '}
              {formatDurationMinutes(projection.timeToTargetKillsMinutes)}
            </li>
            <li>
              Target EXP:{' '}
              {formatDurationMinutes(projection.timeToTargetExpMinutes)}
            </li>
            <li>
              Target Credit:{' '}
              {formatDurationMinutes(projection.timeToTargetCreditMinutes)}
            </li>
            <li>
              Target Faction Coin:{' '}
              {formatDurationMinutes(
                projection.timeToTargetFactionCoinMinutes,
              )}
            </li>
          </ul>
        </section>
      ) : null}
    </>
  )
}
