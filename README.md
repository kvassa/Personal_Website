# Kaavya Vassa — Personal Website

A playful bubble-themed personal website. On load, a girl rises from the
bottom-right corner and blows five navigation bubbles — Education, Projects,
Art, Experience, More about me — which float and morph in place until popped,
opening the matching page.

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

- The intro plays once per browser session (`sessionStorage`); returning to
  the home page shows the bubbles already settled.
- The character art in `src/components/GirlPlaceholder.tsx` is a placeholder —
  swap its contents for real artwork and, if the wand moves, tune `WAND_SPAWN`
  in `src/data/bubbles.ts`.
- Bubble labels, routes, positions, and sizes all live in
  `src/data/bubbles.ts`.
- Deploys as a static SPA: `netlify.toml` and `vercel.json` both include the
  history-fallback rewrite.
