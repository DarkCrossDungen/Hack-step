# DrainSense Devpost Draft

## Tagline

Turn one photo into flood prevention.

## Inspiration

Heavy rain can turn a small blocked drain into a street-level flood problem. The same blockage can also push plastic and waste into nearby waterways. Many communities notice these problems, but they do not have a simple way to turn one observation into organized action.

## What It Does

DrainSense is an adopt-a-drain platform for pre-rain flood prevention. A resident reports a blocked storm drain with a photo placeholder, location, and safety-first issue details. The app creates a transparent prototype risk score, places the report into a pre-rain queue, helps a cleanup group create a safe route, and updates impact only after before/after evidence is reviewed.

## How We Built It

- Next.js and TypeScript for the web app
- React local state with browser persistence for the demo workflow
- CSS design system for a light, civic, mobile-friendly interface
- Lucide icons for accessible controls
- Prototype risk scoring based on reported blockage severity, water flow, and rain-readiness context
- Clearly labelled sample data to avoid false real-world impact claims

## What Makes It Different

DrainSense is not just a map or a dashboard. It is an action loop:

report -> review -> prioritize before rain -> adopt route -> volunteer cleanup -> proof -> verified impact

The adopt-a-drain coverage view shows not only what is fixed, but also which places still have no responsible group before rain.

## Challenges

The main challenge was keeping the project useful and truthful. It would be easy to overclaim real AI accuracy or real environmental measurements. Instead, the prototype clearly labels sample data, uses a transparent scoring model, and counts impact only after evidence.

## Accomplishments

- Built a complete judge demo flow
- Created role-aware views for residents, volunteers, coordinators, and moderators
- Added pre-rain priority scoring
- Added adopt-a-drain coverage
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
4. Show resident report and prototype risk score.
5. Show coordinator approval and rain queue.
6. Show cleanup route, safety instructions, WhatsApp share, and calendar download.
7. Show proof upload and admin verification.
8. End on the impact dashboard and explain that all sample data is labelled.
