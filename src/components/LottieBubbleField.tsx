import { useEffect, useRef, useState } from 'react';
import { useLottie } from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import {
  COMP1_ANIMATION,
  COMP1_META,
  COMP1_SAMPLERS,
  sampleAllPoses,
} from '../data/comp1Layers';
import type { BubbleDef } from '../data/bubbles';
import './LottieBubbleField.css';

const INTRO_KEY = 'kv:hasSeenIntro';
const SETTLE_MS = (COMP1_META.settleFrame / COMP1_META.fr) * 1000;

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    /* ignore */
  }
}

function applyPose(
  el: HTMLButtonElement | null,
  xPct: number,
  yPct: number,
  sizePct: number,
) {
  if (!el) return;
  const diameterVmin = Math.max(12, Math.min(42, sizePct * 0.85));
  el.style.left = `${xPct}%`;
  el.style.top = `${yPct}%`;
  el.style.width = `${diameterVmin}vmin`;
  el.style.height = `${diameterVmin}vmin`;
}

/**
 * Comp1 Lottie as the bubble visuals + HTML overlays for labels/clicks.
 * Overlay poses are driven by wall-clock time matching Comp1 keyframes.
 */
export function LottieBubbleField() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion() ?? false;
  const skipIntro = reducedMotion || hasSeenIntro();

  const [settled, setSettled] = useState(skipIntro);
  const [poppingId, setPoppingId] = useState<BubbleDef['id'] | null>(null);
  const settledRef = useRef(skipIntro);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const startRef = useRef<number | null>(null);

  const lottie = useLottie({
    animationData: COMP1_ANIMATION,
    loop: false,
    autoplay: !skipIntro,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
    },
  });

  useEffect(() => {
    const paint = (frame: number) => {
      for (const { def, pose } of sampleAllPoses(frame)) {
        applyPose(buttonRefs.current[def.id], pose.xPct, pose.yPct, pose.sizePct);
      }
    };

    const finish = () => {
      paint(COMP1_META.settleFrame);
      try {
        lottie.goToAndStop?.(COMP1_META.settleFrame, true);
        lottie.pause?.();
      } catch {
        /* ignore */
      }
      if (!settledRef.current) {
        settledRef.current = true;
        setSettled(true);
        markIntroSeen();
      }
    };

    if (skipIntro) {
      paint(COMP1_META.settleFrame);
      finish();
      return;
    }

    startRef.current = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const frame = Math.min(COMP1_META.settleFrame, (elapsed / 1000) * COMP1_META.fr);
      paint(frame);
      if (elapsed >= SETTLE_MS) {
        finish();
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    try {
      lottie.play?.();
    } catch {
      /* ignore */
    }

    return () => window.cancelAnimationFrame(raf);
    // Intentionally only re-run when skipIntro changes; lottie methods are stable enough for play/stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipIntro]);

  const handlePop = (def: BubbleDef) => {
    if (!settledRef.current || poppingId) return;
    setPoppingId(def.id);
    window.setTimeout(() => navigate(def.path), 320);
  };

  return (
    <div className="lottie-field">
      <div className={`lottie-field__stage${settled ? ' lottie-field__stage--idle' : ''}`}>
        <div className="lottie-field__anim">{lottie.View}</div>
      </div>

      <div className="lottie-field__overlays" aria-label="Site sections">
        {COMP1_SAMPLERS.map(({ def }) => {
          const isMain = def.id === 'about';
          const dimmed = poppingId !== null && poppingId !== def.id;
          const popping = poppingId === def.id;
          return (
            <button
              key={def.id}
              type="button"
              ref={(el) => {
                buttonRefs.current[def.id] = el;
              }}
              className={[
                'lottie-overlay',
                isMain ? 'lottie-overlay--main' : '',
                settled ? 'lottie-overlay--idle' : '',
                popping ? 'lottie-overlay--popping' : '',
                dimmed ? 'lottie-overlay--dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={def.label}
              disabled={!settled || dimmed}
              onClick={() => handlePop(def)}
            >
              <span className="lottie-overlay__wobble">
                <span
                  className={`lottie-overlay__label${isMain ? ' lottie-overlay__label--main' : ''}`}
                >
                  {def.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
