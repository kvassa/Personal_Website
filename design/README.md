# Design sources

Kaavya's Adobe project files for the landing animation:

- `BubblesforPersonalWeb.aep` — After Effects 2026 comp ("Comp 1"): the main
  bubble with the four bubbles emerging from it (ellipse shape layers,
  gradient fills, gaussian blur, turbulence).
- `BubblesforPersonalWeb.prproj` — Premiere sequence dynamic-linking the comp.

- `Comp1.json` — Bodymovin/Lottie export of the comp (1920x1080, 29.97fps).

Browsers can't play the project formats, and the Lottie export flattens the
comp to plain white ellipses (AE fill/blur/turbulence effects don't survive
Bodymovin) with no labels or interactivity. So instead of playing the Lottie
directly, the site drives its interactive glass bubbles with the **exact
choreography measured from Comp1.json's keyframes**: anchors, sizes,
emergence order, per-bubble timing, and easing all live in
`src/data/bubbles.ts` (see `MAIN_BUBBLE`, `SATELLITE_BUBBLES`, `AE_EASE`).
If Kaavya updates the animation, re-export the Lottie and update those
values from its keyframes.
