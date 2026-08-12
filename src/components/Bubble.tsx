import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { BubbleDef } from '../data/bubbles';
import { COMP_H, COMP_W, createWobble, samplePath } from '../utils/aeMotion';

interface BubbleProps {
  def: BubbleDef;
  index: number;
  /** 'intro': play the emergence animation. 'settled': already floating in place. */
  mode: 'intro' | 'settled';
  /** The main bubble grows in place; satellites emerge from the spawn point. */
  isMain?: boolean;
  /** On-screen point (px) satellites emerge from — the main bubble's center. */
  spawnPoint: { x: number; y: number } | null;
  isMobile: boolean;
  dimmed: boolean;
  onSettled: (id: BubbleDef['id']) => void;
  onPopStart: (id: BubbleDef['id']) => void;
}

const DROPLET_ANGLES = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180);

/**
 * The invisible, interactive half of a bubble: a hit area plus its label,
 * carried on the exact same deterministic path/wobble math as the visible
 * blob rendered by BubbleGoo underneath (see aeMotion's createWobble /
 * samplePath) — computed independently here rather than shared, so the
 * label rides with the blob without the two components needing to
 * coordinate state. Handles click/pop/navigate.
 */
export function Bubble({
  def,
  index,
  mode,
  isMain = false,
  spawnPoint,
  isMobile,
  dimmed,
  onSettled,
  onPopStart,
}: BubbleProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const [settled, setSettled] = useState(mode === 'settled');
  const [popping, setPopping] = useState(false);

  const bp = isMobile ? 'mobile' : 'desktop';
  const anchor = def.anchor[bp];
  const size = def.size[bp];

  // Offset (px) from the emergence point (the main bubble's center) to this
  // bubble's settled anchor. The main bubble itself grows in place.
  const spawnOffset = useMemo(() => {
    if (isMain || !spawnPoint) return { dx: 0, dy: 0 };
    return {
      dx: spawnPoint.x - (anchor.x / 100) * window.innerWidth,
      dy: spawnPoint.y - (anchor.y / 100) * window.innerHeight,
    };
  }, [isMain, anchor.x, anchor.y, spawnPoint]);

  // Deterministic per-bubble idle-wobble parameters (same seed BubbleGoo
  // uses), so the label drifts in lockstep with the visible blob beneath it.
  const wobble = useMemo(() => createWobble(def.id), [def.id]);

  const handlePop = () => {
    // Not poppable until fully emerged and settled at its anchor.
    if (popping || !settled) return;
    if (reduced) {
      navigate(def.path);
      return;
    }
    setPopping(true);
    onPopStart(def.id);
  };

  const wobbling = settled && !reduced && !popping;

  // Kaavya's literal After Effects spatial-bezier path (design/Website2.json
  // "to"/"ti" tangent handles), sampled in comp-pixel space with AE's own
  // temporal ease, then converted to on-screen offset from this bubble's
  // anchor so the sampled path lands exactly at 0,0.
  const path = useMemo(() => {
    if (!def.segments || typeof window === 'undefined') return { x: [0], y: [0], times: [0] };
    const sampled = samplePath(def.segments);
    const anchorPxX = (anchor.x / 100) * window.innerWidth;
    const anchorPxY = (anchor.y / 100) * window.innerHeight;
    return {
      x: sampled.xs.map((x) => (x / COMP_W) * window.innerWidth - anchorPxX),
      y: sampled.ys.map((y) => (y / COMP_H) * window.innerHeight - anchorPxY),
      times: sampled.times,
    };
  }, [def.segments, anchor.x, anchor.y]);

  // x/y stay pinned at 0 in the pop target — omitting them would make Motion
  // animate them back to their `initial` spawn-offset values mid-pop.
  const buttonAnimate = popping
    ? { x: 0, y: 0, scale: [1, 1.28, 0], opacity: [1, 1, 0] }
    : settled || mode === 'settled'
      ? { x: 0, y: 0, scale: 1, opacity: dimmed ? 0.35 : 1 }
      : reduced
        ? { x: 0, y: 0, scale: 1, opacity: 1 }
        : isMain
          ? // In the comp the main bubble is simply present at frame 0 —
            // give it just a soft, quick materialize.
            { x: 0, y: 0, scale: [0.94, 1], opacity: [0, 1] }
          : {
              // Kaavya's keyframes: slide out from behind the main bubble to
              // the anchor at FULL size, on a gently bowed glide.
              x: path.x,
              y: path.y,
              scale: 1,
              opacity: 1,
            };

  const buttonTransition = popping
    ? { duration: 0.45, times: [0, 0.45, 1], ease: 'easeIn' as const }
    : settled
      ? { duration: 0.3 }
      : isMain
        ? { duration: reduced ? 0.3 : 0.5, ease: 'easeOut' as const }
        : {
            duration: reduced ? 0.3 : (def.emerge?.duration ?? 1.9),
            delay: reduced ? index * 0.05 : (def.emerge?.start ?? 0),
            times: reduced ? undefined : path.times,
            ease: 'linear' as const,
          };

  return (
    <div
      className={`bubble-anchor${isMain ? ' bubble-anchor--main' : ''}`}
      style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
    >
      <motion.div
        animate={wobbling ? { x: wobble.driftX, y: wobble.driftY } : { x: 0, y: 0 }}
        transition={
          wobbling
            ? {
                duration: wobble.driftDuration,
                delay: wobble.driftDelay,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.2 }
        }
      >
        <motion.button
          type="button"
          className="bubble-button"
          style={{
            ['--d' as string]: `${size}px`,
            pointerEvents: settled && !popping ? undefined : 'none',
          }}
          aria-label={isMain ? 'More about me — Kaavya Vassa' : `Go to ${def.label} page`}
          initial={
            mode === 'settled'
              ? false
              : reduced
                ? { opacity: 0 }
                : isMain
                  ? { scale: 0.94, opacity: 0 }
                  : { x: spawnOffset.dx, y: spawnOffset.dy, scale: 1, opacity: 1 }
          }
          animate={buttonAnimate}
          transition={buttonTransition}
          whileHover={popping || !settled ? undefined : { scale: 1.07 }}
          whileTap={popping || !settled ? undefined : { scale: 0.94 }}
          onClick={handlePop}
          onAnimationComplete={() => {
            if (popping) {
              navigate(def.path);
            } else if (!settled) {
              setSettled(true);
              onSettled(def.id);
            }
          }}
        >
          <motion.span
            className={`bubble-label${isMain ? ' bubble-label--main' : ''}`}
            initial={mode === 'intro' && !isMain && !reduced ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={
              mode === 'intro' && !isMain && !reduced
                ? // Fade the label in once the bubble has cleared the main
                  // bubble, so it doesn't show through the still-merging goo.
                  { duration: 0.5, delay: (def.emerge?.start ?? 0) + (def.emerge?.duration ?? 2) * 0.45 }
                : { duration: 0 }
            }
          >
            {def.label}
          </motion.span>
        </motion.button>

        {popping && (
          <motion.div
            className="bubble-burst"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{
              scale: (2.4 * Math.max(window.innerWidth, window.innerHeight)) / size,
              opacity: 0,
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}

        {popping &&
          DROPLET_ANGLES.map((angle, i) => (
            <motion.span
              key={i}
              className="bubble-droplet"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(angle) * (size * 0.7),
                y: Math.sin(angle) * (size * 0.7),
                opacity: 0,
                scale: 0.3,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
      </motion.div>
    </div>
  );
}
