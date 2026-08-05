import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export type LandingPhase = 'girl-entering' | 'blowing' | 'girl-exiting' | 'idle';

const INTRO_KEY = 'kv:hasSeenIntro';

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Phase state machine for the landing experience:
 * girl-entering → blowing → girl-exiting → idle.
 *
 * Phases advance via animation-completion callbacks, not timers. The intro
 * plays once per browser session; afterwards (and under reduced motion) the
 * page starts directly in `idle` with the bubbles already settled.
 */
export function useLandingSequence() {
  const reducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<LandingPhase>(() =>
    reducedMotion || hasSeenIntro() ? 'idle' : 'girl-entering',
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

  const onGirlEntered = useCallback(() => {
    setPhase((p) => (p === 'girl-entering' ? 'blowing' : p));
  }, []);

  const onAllBubblesSettled = useCallback(() => {
    setPhase((p) => (p === 'blowing' ? 'girl-exiting' : p));
  }, []);

  const onGirlExited = useCallback(() => {
    setPhase((p) => (p === 'girl-exiting' ? 'idle' : p));
  }, []);

  return { phase, reducedMotion, onGirlEntered, onAllBubblesSettled, onGirlExited };
}
