import type { MeasuredSessionRates } from '../lib/calculations'
import { formatDecimal, formatDurationMinutes, formatInteger } from '../lib/numbers'

interface SessionMeasuredCardsProps {
  measured: MeasuredSessionRates | null
}

export function SessionMeasuredCards({ measured }: SessionMeasuredCardsProps) {
  if (!measured) return null

  return (
    <section className="panel">
      <h2>Measured from This Session</h2>
      <p className="muted">
        From your start/end values over{' '}
        {formatDurationMinutes(measured.durationMinutes)}. Prefer these Credit
        rates when they differ from a single kill popup.
      </p>
      <div className="stat-grid">
        <article className="stat">
          <h3>Credit Earned</h3>
          <p className="stat-value">
            {formatInteger(measured.creditEarned)}
          </p>
        </article>
        <article className="stat">
          <h3>Credit per Kill (avg)</h3>
          <p className="stat-value">
            {formatInteger(measured.creditPerKill)}
          </p>
        </article>
        <article className="stat">
          <h3>Credit per Hour</h3>
          <p className="stat-value">
            {formatInteger(measured.creditPerHour)}
          </p>
        </article>
        <article className="stat">
          <h3>EXP % Gained</h3>
          <p className="stat-value">
            {formatDecimal(measured.expPercentGained, 4)}%
          </p>
        </article>
        <article className="stat">
          <h3>EXP % per Kill</h3>
          <p className="stat-value">
            {formatDecimal(measured.expPercentPerKill, 4)}%
          </p>
        </article>
        <article className="stat">
          <h3>EXP % per Hour</h3>
          <p className="stat-value">
            {formatDecimal(measured.expPercentPerHour, 4)}%
          </p>
        </article>
        <article className="stat">
          <h3>Contribution % Gained</h3>
          <p className="stat-value">
            {formatDecimal(measured.contributionPercentGained, 4)}%
          </p>
        </article>
        <article className="stat">
          <h3>Contribution % per Kill</h3>
          <p className="stat-value">
            {formatDecimal(measured.contributionPercentPerKill, 4)}%
          </p>
        </article>
        <article className="stat">
          <h3>Contribution % per Hour</h3>
          <p className="stat-value">
            {formatDecimal(measured.contributionPercentPerHour, 4)}%
          </p>
        </article>
      </div>
    </section>
  )
}
