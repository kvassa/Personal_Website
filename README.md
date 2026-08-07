# Kaavya Vassa — Personal Website

A bubble-themed personal website with an iridescent glass aesthetic on a
blue-lavender gradient. On load, a main bubble carrying Kaavya's name
appears at the center and four navigation bubbles — Education, Projects,
Art, Experience — glide out from behind it one by one along smooth curved
paths (~6.5s total). All five then drift and morph organically in place
until clicked: the bubble bursts into droplets with a wash that expands
into the matching page (the main bubble opens "More about me").

The choreography follows Kaavya's After Effects design — emergence order,
positions, and layout are measured from her Lottie export (see `design/`).

## Stack

- React + Vite (TypeScript)
- [`motion`](https://motion.dev) (Framer Motion) for all animation
- `react-router-dom` for routing (`/`, `/education`, `/projects`, `/art`,
  `/experience`, `/about`)
- Quicksand (Google Fonts) for typography

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## How the landing animation works

- `src/hooks/useLandingSequence.ts` — phase state machine:
  `main-appearing → birthing → idle`, advanced by animation-completion
  callbacks (no timers).
- `src/data/bubbles.ts` — single source of truth: labels, routes, anchors
  (% of viewport, per breakpoint), sizes, and per-bubble emergence timing
  (`MAIN_BUBBLE` + `SATELLITE_BUBBLES`). Tweak the `emerge` values to
  re-pace the intro.
- `src/components/Bubble.tsx` — one bubble: curved bézier glide out of the
  main bubble, idle drift + blob morph, pop-burst, and navigation. Bubbles
  aren't clickable until they've fully settled.
- `src/components/BubbleField.tsx` — renders main + satellites and reports
  sequence milestones.
- The intro replays on every page refresh; navigating back home within the
  visit shows the bubbles already settled (in-memory flag, not persisted).
  Users with reduced-motion enabled skip straight to the settled layout.

## Content

The five pages (`src/pages/`) currently hold themed placeholder copy in
frosted-glass cards — swap in Kaavya's real education, projects, art,
experience, and bio whenever ready.

## Design sources

Kaavya's Adobe files live in `design/` (`.aep`, `.prproj`, and the
`Comp1.json` Lottie export). Browsers can't run the Adobe project formats,
so the site drives its interactive bubbles with the choreography measured
from the Lottie keyframes — `design/README.md` explains how to re-measure
if the animation is updated.

## Deploy

Static SPA — both `netlify.toml` and `vercel.json` include the
history-fallback rewrite so deep links like `/education` work. Import the
repo at [vercel.com/new](https://vercel.com/new) (or Netlify) and every
merge to `main` deploys automatically.
