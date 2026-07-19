import { comparisonWinners } from '../lib/calculations'
import { formatDecimal, formatInteger } from '../lib/numbers'
import type { SavedSession } from '../types'

interface CompareSpotsPageProps {
  sessions: SavedSession[]
}

export function CompareSpotsPage({ sessions }: CompareSpotsPageProps) {
  const comparable = sessions
    .filter((s) => s.rates)
    .map((s) => ({
      id: s.id,
      label: s.label,
      spotName: s.spot.spotName || s.label,
      map: s.spot.map,
      rates: s.rates,
      farmingValue: s.sessionResults?.totalFarmingValue ?? null,
    }))

  const winners = comparisonWinners(comparable)

  if (comparable.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Compare Spots</h1>
          <p>Compare saved farming sessions side by side.</p>
        </header>
        <section className="panel">
          <p className="empty-state">
            No saved sessions yet. Calculate and save sessions from KPM
            Calculator or Actual Session, then return here to compare spots.
          </p>
        </section>
      </div>
    )
  }

  const winnerRows: Array<[string, { label: string } | null]> = [
    ['Highest KPM', winners.highestKpm],
    ['Best EXP', winners.bestExp],
    ['Best Credit', winners.bestCredit],
    ['Best Faction Coin', winners.bestFactionCoin],
    ['Best Farming Value', winners.bestFarmingValue],
  ]

  return (
    <div className="page">
      <header className="page-header">
        <h1>Compare Spots</h1>
        <p>
          Rank saved sessions by Kill per Minute, EXP, Credit, Faction Coin, and
          farming value.
        </p>
      </header>

      <section className="panel">
        <h2>Highlights</h2>
        <div className="stat-grid">
          {winnerRows.map(([title, winner]) => (
            <article className="stat" key={title}>
              <h3>{title}</h3>
              <p className="stat-value small">
                {winner ? winner.label : '—'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Saved Spots</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Spot Name</th>
                <th>Map</th>
                <th>Kill per Minute</th>
                <th>EXP per Hour</th>
                <th>Credit per Hour</th>
                <th>Faction Coin per Hour</th>
                <th>Total Farming Value</th>
              </tr>
            </thead>
            <tbody>
              {comparable.map((item) => (
                <tr key={item.id}>
                  <td>{item.spotName || '—'}</td>
                  <td>{item.map || '—'}</td>
                  <td>{formatDecimal(item.rates?.kpm, 2)}</td>
                  <td>{formatInteger(item.rates?.expPerHour)}</td>
                  <td>{formatInteger(item.rates?.creditPerHour)}</td>
                  <td>{formatInteger(item.rates?.factionCoinPerHour)}</td>
                  <td>{formatInteger(item.farmingValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
