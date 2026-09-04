# DrainSense Design System

DrainSense uses a light-only civic operations style for the Earth Forward prototype. The interface should feel practical outdoors, trustworthy for community organizers, and clear enough for judges to understand in one pass.

## Visual System

- Backgrounds use warm paper and white surfaces: `#FFFDF8`, `#FFFFFF`, `#EEF5F1`.
- Primary action is river teal: `#0E7C72`.
- Status colors are functional: leaf green for resolved, marigold for priority, brick red for critical, muted blue for water/map context.
- Cards and controls use small radii, visible focus rings, and soft offset shadows only on major containers.
- Typography uses system UI for controls and Georgia for major headings, keeping the prototype dependency-light and Vercel-ready.

## Product Rules

- No dark UI.
- Sample data and demo estimates must be labelled.
- Public map locations are approximate.
- Impact only changes after before/after evidence.
- The app must never claim real city, NGO, SMS, WhatsApp Business, AI accuracy, or field-measurement deployment until those are actually configured.

## Key Interaction

The signature flow is: resident report -> prototype risk assessment -> coordinator review -> pre-rain queue -> cleanup route -> volunteer proof -> verified impact.
