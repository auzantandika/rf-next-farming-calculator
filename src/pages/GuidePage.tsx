export function GuidePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Calculation Guide</h1>
        <p>
          How the RF NEXT Farming Calculator turns a short kill window into
          hourly farming estimates.
        </p>
      </header>

      <section className="panel">
        <h2>Core Formulas</h2>
        <ul className="detail-list">
          <li>
            <strong>Farming Duration (minutes)</strong> = Minutes + (Seconds ÷
            60)
          </li>
          <li>
            <strong>Kill per Minute</strong> = Total Kills ÷ Farming Duration
          </li>
          <li>
            <strong>Seconds per Kill</strong> = (Farming Duration × 60) ÷ Total
            Kills
          </li>
          <li>
            <strong>Kills per Hour</strong> = Kill per Minute × 60
          </li>
          <li>
            <strong>Credit per Hour</strong> = Credit per Kill × Kills per Hour
          </li>
          <li>
            <strong>EXP per Hour</strong> = Effective EXP per Kill × Kills per
            Hour
          </li>
          <li>
            <strong>Faction Coin per Hour</strong> = Faction Coin per Kill ×
            Kills per Hour
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>EXP Bonus</h2>
        <p>
          If <em>Rewards Already Include Buffs</em> is checked, the entered EXP
          per Kill is used as-is. Otherwise Effective EXP per Kill = EXP per Kill
          × (1 + EXP Bonus ÷ 100).
        </p>
      </section>

      <section className="panel">
        <h2>Number Entry</h2>
        <p>
          Reward fields are whole numbers. These all mean 23,621: <code>23621</code>,{' '}
          <code>23,621</code>, <code>23.621</code>, and <code>23 621</code>.
          Displayed results use English (en-US) formatting such as 18.7 KPM and
          28,345,200 EXP per hour.
        </p>
      </section>

      <section className="panel">
        <h2>Getting Per-Kill Values</h2>
        <ul className="detail-list">
          <li>
            <strong>Credit</strong> — wallet shows point totals. Use
            Starting/Ending Credit + Total Kills → Derive Per Kill.
          </li>
          <li>
            <strong>EXP / Faction Coin points</strong> — take numbers from the
            kill popup into EXP per Kill and Faction Coin per Kill.
          </li>
          <li>
            <strong>EXP %</strong> — HUD bar (for example 30.1631%) measures
            average % per kill. Percent alone cannot become EXP points without
            the level’s total EXP table.
          </li>
          <li>
            <strong>Contribution %</strong> — same idea as EXP: use the
            Contribution Lv. xx(yy.y%) bar before/after farming. This tracks
            contribution progress; Faction Coin per hour still uses popup points.
          </li>
          <li>
            There is no free official RF Online Next API for live monster tables,
            so this calculator stays offline and uses your measured session data.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Actual Session Checks</h2>
        <ul className="detail-list">
          <li>
            <strong>Consistent</strong> — actual gains match per-kill estimates.
          </li>
          <li>
            <strong>Possible Mixed Monsters</strong> — actual gains look lower or
            uneven.
          </li>
          <li>
            <strong>Additional Rewards Detected</strong> — actual gains look
            higher than the kill math.
          </li>
          <li>
            <strong>Insufficient Data</strong> — not enough values to compare.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Worked Example</h2>
        <p>
          Duration 10 minutes, 200 kills, Credit 617, EXP 23,621, Faction Coin
          6,590:
        </p>
        <ul className="detail-list">
          <li>Kill per Minute: 20</li>
          <li>Seconds per Kill: 3</li>
          <li>Kills per Hour: 1,200</li>
          <li>Credit per Hour: 740,400</li>
          <li>EXP per Hour: 28,345,200</li>
          <li>Faction Coin per Hour: 7,908,000</li>
        </ul>
      </section>

      <section className="panel notice">
        <p>
          This is an unofficial community tool and is not affiliated with or
          endorsed by Netmarble. All calculations are estimates based on
          user-provided data. Actual farming results may vary.
        </p>
      </section>
    </div>
  )
}
