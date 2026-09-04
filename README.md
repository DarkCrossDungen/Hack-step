# DrainSense

DrainSense is a light-only Earth Forward hackathon prototype that helps neighborhoods find blocked storm drains before rain, organize safe cleanup routes, and count impact only after before/after proof.

## Project Idea

Blocked storm drains can cause local flooding and carry plastic waste into waterways. DrainSense turns one resident report into an accountable action flow:

1. Resident adds a photo placeholder, location, blockage severity, and water-flow state.
2. The app generates a transparent prototype risk assessment.
3. A coordinator approves the report into the pre-rain queue.
4. A cleanup group adopts the drain and creates a route.
5. Volunteers join, share the event, and download a calendar file.
6. Before/after proof is submitted.
7. Impact updates only after evidence is verified.

## Current Build

- Next.js App Router and TypeScript
- Light civic UI with no dark mode
- Local state plus browser persistence
- Judge demo mode for the full report-to-resolution story
- Report, rain queue, map/list, cleanup, adopt-a-drain, impact, and admin review sections
- WhatsApp share link and `.ics` calendar download
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
- The prototype risk score is not a flood forecast.
- SMS, WhatsApp Business automation, Supabase, and Resend are future integrations until credentials are configured.

## Suggested Demo Path

Click **Judge demo**. It automatically walks through:

resident report -> coordinator approval -> rain queue -> cleanup route -> proof upload -> verified impact
