# Kaavya Vassa — Personal Website

A bubble-themed personal website with an iridescent glass aesthetic. On
load, a main bubble carrying Kaavya's name grows in at the center and four
navigation bubbles — Education, Projects, Art, Experience — emerge out of
it. All five float and morph in place until popped, bursting open into the
matching page (the main bubble opens "More about me"). The sequence follows
Kaavya's After Effects design (sources in `design/`).

## Stack

- React + Vite (TypeScript)
- [`motion`](https://motion.dev) (Framer Motion) for all animation
- `react-router-dom` for routing

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Notes

- The intro replays on every page refresh; navigating back home within the
  visit shows the bubbles already settled (in-memory flag, not persisted).
- Bubble labels, routes, positions, and sizes all live in
  `src/data/bubbles.ts` (`MAIN_BUBBLE` + `SATELLITE_BUBBLES`).
- Kaavya's Adobe sources live in `design/` — see `design/README.md` for the
  Lottie export path if the exact AE animation should replace the native one.
- Deploys as a static SPA: `netlify.toml` and `vercel.json` both include the
  history-fallback rewrite.
