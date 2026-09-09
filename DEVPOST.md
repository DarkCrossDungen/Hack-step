# DrainSense Devpost Draft

## Tagline

Find weak points before rain. Prove the cleanup after.

## Inspiration

Heavy rain can turn small local issues into street-level flood problems: a blocked drain, a canal choke point, a trash pile uphill from a grate, or a low-ground road beside a school. Communities often notice these risks, but they need a clear way to act before the rain arrives.

## What It Does

DrainSense is a pre-rain flood readiness console for communities. It shows a sample rain scenario, ranks weak drainage points, creates a cleanup route for local groups, collects before/after proof, and updates a transparent readiness score only after evidence is reviewed.

## How We Built It

- Next.js and TypeScript for the web app
- React local state with browser persistence for the demo workflow
- CSS design system for a light, civic, mobile-friendly interface
- Lucide icons for accessible controls
- Prototype readiness scoring based on unresolved weak points, planned cleanup coverage, and reviewed proof
- Clearly labelled sample data to avoid false real-world impact claims

## What Makes It Different

DrainSense is not just a map or a dashboard. It is an action loop:

rain signal -> weak-point priority -> safe route -> volunteer action -> proof review -> readiness evidence

The important difference is that the score does not improve just because someone clicked a button. It improves only when a cleanup action has reviewed proof, so the demo stays useful and truthful.

## Challenges

The main challenge was keeping the project useful and truthful. It would be easy to overclaim real AI accuracy or real environmental measurements. Instead, the prototype clearly labels sample data, uses a transparent scoring model, and counts impact only after evidence.

## Accomplishments

- Built a complete judge demo flow
- Created a professional left-sidebar readiness console
- Added rain scenario, weak-point map/list, action plan, report intake, proof review, and evidence screens
- Added transparent readiness scoring from 42 to 76
- Added proof-first impact tracking
- Kept the interface light, accessible, and practical

## What We Learned

Environmental software needs an action path, not only information. A report is useful only when it becomes a safe task, gets assigned to people, and has verified proof after completion.

## What's Next

- Supabase authentication, database, storage, and row-level security
- Real image uploads and private media URLs
- Resend transactional email
- Optional weather API integration for real rain windows
- Pilot with a school eco-club or resident group
- Replace sample impact estimates with measured cleanup evidence

## Demo Video Outline

1. Show the problem: blocked drains cause flooding and waste pollution.
2. Open DrainSense and explain the one-line promise.
3. Click **Judge demo**.
4. Show the rain scenario and starting readiness score.
5. Show weak points and explain why each one may flood first.
6. Build the action plan for cleanup groups.
7. Submit and review proof for one critical weak point.
8. End on Demo Evidence and explain that all sample data is labelled.
