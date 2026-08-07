import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export type LandingPhase = 'main-appearing' | 'birthing' | 'idle';

// In-memory only, deliberately NOT persisted: navigating back home within
// the visit skips the intro, but a page refresh replays it from the top.
let introPlayed = false;

/**
 * Phase state machine for the landing experience (after Kaavya's Adobe comp):
 * main-appearing → birthing → idle.
 *
 * The main bubble grows in at the center, the four satellite bubbles emerge
 * out of it, then everything idles. Phases advance via animation-completion
 * callbacks, not timers. The intro replays on every page refresh, but is
 * skipped when navigating back home within the visit (and under reduced
 * motion) — those start directly in `idle`.
 */
export function useLandingSequence() {
  const reducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<LandingPhase>(() =>
    reducedMotion || introPlayed ? 'idle' : 'main-appearing',
  );

  useEffect(() => {
    if (phase === 'idle') introPlayed = true;
  }, [phase]);

  const onMainAppeared = useCallback(() => {
    setPhase((p) => (p === 'main-appearing' ? 'birthing' : p));
  }, []);

  const onAllBubblesSettled = useCallback(() => {
    setPhase((p) => (p === 'birthing' ? 'idle' : p));
  }, []);

  return { phase, reducedMotion, onMainAppeared, onAllBubblesSettled };
}
