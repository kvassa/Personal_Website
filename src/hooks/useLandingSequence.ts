import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export type LandingPhase = 'main-appearing' | 'birthing' | 'idle';

const INTRO_KEY = 'kv:hasSeenIntro';

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Phase state machine for the landing experience (after Kaavya's Adobe comp):
 * main-appearing → birthing → idle.
 *
 * The main bubble grows in at the center, the four satellite bubbles emerge
 * out of it, then everything idles. Phases advance via animation-completion
 * callbacks, not timers. The intro plays once per browser session; afterwards
 * (and under reduced motion) the page starts directly in `idle`.
 */
export function useLandingSequence() {
  const reducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<LandingPhase>(() =>
    reducedMotion || hasSeenIntro() ? 'idle' : 'main-appearing',
  );

  useEffect(() => {
    if (phase === 'idle') {
      try {
        sessionStorage.setItem(INTRO_KEY, '1');
      } catch {
        // storage unavailable — the intro will simply replay next time
      }
    }
  }, [phase]);

  const onMainAppeared = useCallback(() => {
    setPhase((p) => (p === 'main-appearing' ? 'birthing' : p));
  }, []);

  const onAllBubblesSettled = useCallback(() => {
    setPhase((p) => (p === 'birthing' ? 'idle' : p));
  }, []);

  return { phase, reducedMotion, onMainAppeared, onAllBubblesSettled };
}
