# DrainSense

DrainSense is a light-only Earth Forward hackathon prototype that helps neighborhoods prepare before heavy rain by finding weak drainage points, ranking cleanup priorities, and improving a transparent readiness score only after before/after proof is reviewed.

## Project Idea

Blocked drains, canal choke points, trash buildup, and low-ground roads can turn a normal rain event into street-level flooding. DrainSense turns community observations into an accountable pre-rain action flow:

1. A sample rain scenario shows heavy rain expected in 18 hours.
2. Weak points are ranked by practical flood-readiness risk.
3. A coordinator builds a safe cleanup route for the top priorities.
4. Volunteers can use the website as the task source of truth.
5. The group submits before/after proof for completed work.
6. Readiness improves only after proof is reviewed.

## Current Build

- Next.js App Router and TypeScript
- Light civic UI with no dark mode
- Local state plus browser persistence
- Judge demo mode for the full rain-warning-to-proof story
- Collapsible left sidebar with Overview, Rain Scenario, Weak Points, Action Plan, Report Intake, Proof Review, Demo Evidence, and Submission Kit
- Manual team invite copy and `.ics` calendar download
- Clearly labelled sample/demo data

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked:

```bash
npm.cmd run dev
npm.cmd run build
```

## Build

```bash
npm run build
```

## Deploy to Vercel

See `DEPLOYMENT.md` for the exact GitHub and Vercel deployment sequence.

No production environment variables are required for the current prototype.
Add future secrets only in Vercel environment variables, never in browser code.

## Truthfulness Rules

- Demo data is sample data.
- Impact numbers are demo estimates.
- The app does not claim municipal, NGO, or government adoption.
- The readiness score is not a flood forecast.
- SMS, WhatsApp Business automation, Supabase, and Resend are future integrations until credentials are configured.

## Suggested Demo Path

Click **Run judge demo**. It automatically walks through:

rain warning -> weak points -> action route -> proof review -> readiness evidence
