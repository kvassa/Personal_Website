import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { BubbleDef } from '../data/bubbles';
import { EMERGE_EASE } from '../data/bubbles';

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

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Random organic 8-value border-radius, e.g. "46% 54% 58% 42% / 44% 57% 43% 56%". */
function blobRadius(): string {
  const r = () => `${Math.round(rand(44, 56))}%`;
  return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
}

const CIRCLE = '50% 50% 50% 50% / 50% 50% 50% 50%';
const DROPLET_ANGLES = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180);


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

  // Per-bubble randomized idle-wobble parameters, generated once so each
  // bubble drifts and morphs with its own rhythm while staying at its anchor
  // (drift keyframes orbit 0, so the bubble never leaves its relative space).
  const wobble = useMemo(
    () => ({
      driftX: [0, rand(-16, 16), rand(-12, 12), 0],
      driftY: [0, rand(-14, 14), rand(-16, 16), 0],
      driftDuration: rand(6, 10),
      driftDelay: rand(0, 1.5),
      morphKeys: [CIRCLE, blobRadius(), blobRadius(), blobRadius(), CIRCLE],
      morphDuration: rand(5, 8),
      squishX: [1, 1.04, 0.97, 1.02, 1],
      squishY: [1, 0.96, 1.05, 0.98, 1],
    }),
    [],
  );

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

  // Gently bowed slide-out path: a midpoint offset perpendicular to the
  // straight line (alternating side per bubble) so the glide reads as a
  // natural float rather than a mechanical straight line.
  const path = useMemo(() => {
    const { dx, dy } = spawnOffset;
    const len = Math.hypot(dx, dy) || 1;
    const bow = len * 0.12 * (index % 2 === 0 ? 1 : -1);
    return {
      x: [dx, dx * 0.5 + (-dy / len) * bow, 0],
      y: [dy, dy * 0.5 + (dx / len) * bow, 0],
    };
  }, [spawnOffset, index]);

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
            duration: reduced ? 0.3 : (def.emerge?.duration ?? 1.5),
            delay: reduced ? index * 0.05 : (def.emerge?.start ?? 0),
            ease: EMERGE_EASE,
            times: [0, 0.55, 1],
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
          <motion.div
            className={`bubble-skin bubble-skin--${def.id}`}
            animate={
              wobbling
                ? {
                    borderRadius: wobble.morphKeys,
                    scaleX: wobble.squishX,
                    scaleY: wobble.squishY,
                  }
                : { borderRadius: CIRCLE, scaleX: 1, scaleY: 1 }
            }
            transition={
              wobbling
                ? { duration: wobble.morphDuration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          >
            <i className="bubble-glints" aria-hidden="true" />
          </motion.div>
          <motion.span
            className={`bubble-label${isMain ? ' bubble-label--main' : ''}`}
            initial={mode === 'intro' && !isMain && !reduced ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={
              mode === 'intro' && !isMain && !reduced
                ? // Fade the label in once the bubble has cleared the main
                  // bubble, so it doesn't show through the translucent glass.
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
