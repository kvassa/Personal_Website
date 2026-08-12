import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import type { BubbleDef } from '../data/bubbles';
import { CIRCLE_RADIUS, COMP_H, COMP_W, colorSpecFromStops, createWobble, samplePath } from '../utils/aeMotion';

interface BubbleGooProps {
  def: BubbleDef;
  isMain?: boolean;
  /** 'intro': play the emergence glide + color crossfade. 'settled': render final state only. */
  mode: 'intro' | 'settled';
  isMobile: boolean;
  dimmed: boolean;
  popping: boolean;
}

/**
 * The visible, colored half of a bubble: a single flat circle blended from
 * the JSON's inner core color to its outer glow color, animated on Kaavya's
 * literal After Effects path/timing/color keyframes (design/Website2.json).
 * Rendered inside the shared SVG-filtered goo layer (see BubbleField) so
 * overlapping bubbles bridge into each other the way the comp's Gaussian
 * Blur + Simple Choker adjustment layer does, while separated bubbles stay
 * crisp. Carries no label or click handling — an invisible hit layer
 * (Bubble.tsx) tracks the exact same deterministic path/wobble so the label
 * rides along in sync without the two sharing state.
 */
export function BubbleGoo({ def, isMain = false, mode, isMobile, dimmed, popping }: BubbleGooProps) {
  const reduced = useReducedMotion() ?? false;
  const [settled, setSettled] = useState(mode === 'settled');
  const bp = isMobile ? 'mobile' : 'desktop';
  const anchor = def.anchor[bp];
  const size = def.size[bp];

  const wobble = useMemo(() => createWobble(def.id), [def.id]);
  const wobbling = settled && !reduced && !popping;

  const outerSpec = useMemo(() => colorSpecFromStops(def.outerColorStops), [def.outerColorStops]);
  const innerSpec = useMemo(() => colorSpecFromStops(def.innerColorStops), [def.innerColorStops]);
  const outerLast = outerSpec.colors[outerSpec.colors.length - 1];
  const innerLast = innerSpec.colors[innerSpec.colors.length - 1];
  const colorTransition = {
    '--outer': { duration: outerSpec.duration, delay: outerSpec.delay, times: outerSpec.times, ease: 'linear' as const },
    '--inner': { duration: innerSpec.duration, delay: innerSpec.delay, times: innerSpec.times, ease: 'linear' as const },
  };

  const path = useMemo(() => {
    if (isMain || !def.segments || typeof window === 'undefined') return { x: [0], y: [0], times: [0] };
    const sampled = samplePath(def.segments);
    const anchorPxX = (anchor.x / 100) * window.innerWidth;
    const anchorPxY = (anchor.y / 100) * window.innerHeight;
    return {
      x: sampled.xs.map((x) => (x / COMP_W) * window.innerWidth - anchorPxX),
      y: sampled.ys.map((y) => (y / COMP_H) * window.innerHeight - anchorPxY),
      times: sampled.times,
    };
  }, [isMain, def.segments, anchor.x, anchor.y]);

  const offsetAnimate = popping
    ? { x: 0, y: 0, scale: 1.3, opacity: 0 }
    : settled || mode === 'settled'
      ? { x: 0, y: 0, scale: 1, opacity: dimmed ? 0.35 : 1 }
      : reduced
        ? { x: 0, y: 0, scale: 1, opacity: 1 }
        : isMain
          ? { x: 0, y: 0, scale: [0.94, 1], opacity: [0, 1] }
          : { x: path.x, y: path.y, scale: 1, opacity: 1 };

  const offsetTransition = popping
    ? { duration: 0.45, ease: 'easeIn' as const }
    : settled
      ? { duration: 0.3 }
      : isMain
        ? { duration: reduced ? 0.3 : 0.5, ease: 'easeOut' as const }
        : {
            duration: reduced ? 0.3 : (def.emerge?.duration ?? 1.9),
            delay: reduced ? 0 : (def.emerge?.start ?? 0),
            times: reduced ? undefined : path.times,
            ease: 'linear' as const,
          };

  return (
    <div
      className={`goo-anchor${isMain ? ' goo-anchor--main' : ''}`}
      style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
    >
      <motion.div
        animate={wobbling ? { x: wobble.driftX, y: wobble.driftY } : { x: 0, y: 0 }}
        transition={
          wobbling
            ? { duration: wobble.driftDuration, delay: wobble.driftDelay, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
      >
        <motion.div
          initial={
            mode === 'settled'
              ? false
              : reduced
                ? { opacity: 0 }
                : isMain
                  ? { scale: 0.94, opacity: 0 }
                  : { x: path.x[0], y: path.y[0], scale: 1, opacity: 1 }
          }
          animate={offsetAnimate}
          transition={offsetTransition}
          onAnimationComplete={() => {
            if (!popping && !settled) setSettled(true);
          }}
        >
          <motion.div
            className="bubble-skin"
            style={{
              ['--d' as string]: `${size}px`,
              ['--inner-stop' as string]: `${(def.innerRatio ?? 0.65) * 30}%`,
            }}
            initial={
              mode === 'settled' ? false : { '--inner': innerSpec.colors[0], '--outer': outerSpec.colors[0] }
            }
            animate={
              mode === 'settled'
                ? {
                    '--inner': innerLast,
                    '--outer': outerLast,
                    borderRadius: wobbling ? wobble.morphKeys : CIRCLE_RADIUS,
                    scaleX: wobbling ? wobble.squishX : 1,
                    scaleY: wobbling ? wobble.squishY : 1,
                  }
                : {
                    '--inner': innerSpec.colors,
                    '--outer': outerSpec.colors,
                    borderRadius: wobbling ? wobble.morphKeys : CIRCLE_RADIUS,
                    scaleX: wobbling ? wobble.squishX : 1,
                    scaleY: wobbling ? wobble.squishY : 1,
                  }
            }
            transition={{
              ...colorTransition,
              borderRadius: wobbling
                ? { duration: wobble.morphDuration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 },
              scaleX: wobbling
                ? { duration: wobble.morphDuration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 },
              scaleY: wobbling
                ? { duration: wobble.morphDuration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 },
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
