# Design sources

Kaavya's Adobe project files for the landing animation:

- `BubblesforPersonalWeb.aep` — After Effects 2026 comp ("Comp 1"): the main
  bubble with the four bubbles emerging from it (ellipse shape layers,
  gradient fills, gaussian blur, turbulence).
- `BubblesforPersonalWeb.prproj` — Premiere sequence dynamic-linking the comp.

Browsers can't play these project formats, so the sequence is recreated
natively with Framer Motion in `src/` (main bubble grows at center → four
satellites emerge → idle wobble).

To use the *exact* After Effects animation on the web instead, export the
comp as Lottie JSON with the Bodymovin plugin (Window → Extensions →
Bodymovin) and integrate it via `lottie-web`/`lottie-react`. Note the Lottie
render would replace the interactive DOM bubbles, so clickable areas would
need to be overlaid separately.
