# RF NEXT Farming Calculator

Unofficial community tool for RF Online Next farming analysis. Calculate Kill per Minute (KPM), EXP per hour, Credit income, and Faction Coin income, then compare spots and keep a local session history.

**Tagline:** KPM, EXP, Credit, and Faction Coin farming analysis.

## Main Features

- **KPM Calculator** — measure kill speed and project hourly rewards
- **Actual Session** — log start/end wallets, costs, loot value, and verification status
- **Compare Spots** — rank saved sessions by KPM, EXP, Credit, Faction Coin, and farming value
- **History** — edit, duplicate, delete, export, and import sessions
- **Calculation Guide** — formulas, number entry rules, and worked example

## Calculation Formulas

- Farming Duration (minutes) = Minutes + (Seconds ÷ 60)
- Kill per Minute = Total Kills ÷ Farming Duration
- Seconds per Kill = (Farming Duration × 60) ÷ Total Kills
- Kills per Hour = Kill per Minute × 60
- Credit per Hour = Credit per Kill × Kills per Hour
- EXP per Hour = Effective EXP per Kill × Kills per Hour
- Faction Coin per Hour = Faction Coin per Kill × Kills per Hour

If **Rewards Already Include Buffs** is checked, EXP per Kill is used directly. Otherwise:

`Effective EXP per Kill = EXP per Kill × (1 + EXP Bonus ÷ 100)`

### Worked Example

| Input | Value |
| --- | --- |
| Duration | 10 minutes |
| Total kills | 200 |
| Credit per kill | 617 |
| EXP per kill | 23,621 |
| Faction Coin per kill | 6,590 |

| Output | Value |
| --- | --- |
| KPM | 20 |
| Seconds per kill | 3 |
| Kills per hour | 1,200 |
| Credit per hour | 740,400 |
| EXP per hour | 28,345,200 |
| Faction Coin per hour | 7,908,000 |

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest
- Browser `localStorage` only (no backend)

## Local Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Testing

```bash
npm test -- --run
```

## LocalStorage Behavior

- Storage key: `rf-next-farming-sessions`
- Sessions stay in the current browser only
- Data is not synced across devices or accounts
- Use **Export Data** / **Import Data** for JSON backups
- Storage failures are handled safely and shown as warnings

## JSON Backup

1. Open **History**
2. Click **Export Data** to download a JSON backup
3. On another browser, click **Import Data** and select the file

Malformed JSON will not crash the app; an error toast is shown instead.

## Vercel Deployment Notes

This app is a free static Vite frontend intended for Vercel Hobby:

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- No environment variables
- No serverless functions
- No paid integrations (Analytics, databases, AI, etc.)

Because navigation uses in-app tab state (not URL routes), a `vercel.json` rewrite is not required.

Deploy with:

```bash
npx vercel --prod
```

## Production Website

- Production URL: https://rf-next-farming-calculator.vercel.app
- Vercel project name: `rf-next-farming-calculator`

## Known Limitations

- Estimates depend entirely on user-entered kill windows and reward values
- Actual in-game results vary with buffs, mixed monsters, lag, and party share
- History is browser-local only
- No cloud sync, accounts, or multi-device sync

## Disclaimer

This is an unofficial community tool and is not affiliated with or endorsed by Netmarble. All calculations are estimates based on user-provided data. Actual farming results may vary.
