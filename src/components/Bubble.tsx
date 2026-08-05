import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { BubbleDef } from '../data/bubbles';
import { WAND_SPAWN } from '../data/bubbles';

interface BubbleProps {
  def: BubbleDef;
  index: number;
  /** 'intro': blow out from the wand. 'settled': already floating in place. */
  mode: 'intro' | 'settled';
  isMobile: boolean;
  dimmed: boolean;
  onSettled: (id: BubbleDef['id']) => void;
  onPopStart: (id: BubbleDef['id']) => void;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Random organic 8-value border-radius, e.g. "46% 54% 58% 42% / 44% 57% 43% 56%". */
function blobRadius(): string {
  const r = () => `${Math.round(rand(40, 60))}%`;
  return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
}

const CIRCLE = '50% 50% 50% 50% / 50% 50% 50% 50%';
const DROPLET_ANGLES = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180);

const STAGGER = 0.5;
const ENTRANCE_DURATION = 1.4;

export function Bubble({ def, index, mode, isMobile, dimmed, onSettled, onPopStart }: BubbleProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const [settled, setSettled] = useState(mode === 'settled');
  const [popping, setPopping] = useState(false);

  const bp = isMobile ? 'mobile' : 'desktop';
  const anchor = def.anchor[bp];
  const size = def.size[bp];

  // Spawn offset (px) from the wand tip to this bubble's settled anchor.
  const spawnOffset = useMemo(() => {
    const spawn = WAND_SPAWN[bp];
    return {
      dx: ((spawn.x - anchor.x) / 100) * window.innerWidth,
      dy: ((spawn.y - anchor.y) / 100) * window.innerHeight,
    };
  }, [bp, anchor.x, anchor.y]);

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
    if (popping) return;
    if (reduced) {
      navigate(def.path);
      return;
    }
    setPopping(true);
    onPopStart(def.id);
  };

  const wobbling = settled && !reduced && !popping;

  // Entrance / pop / rest states for the button element.
  // x/y must stay pinned at 0 here — omitting them would make Motion animate
  // them back to their `initial` spawn-offset values mid-pop.
  const buttonAnimate = popping
    ? { x: 0, y: 0, scale: [1, 1.28, 0], opacity: [1, 1, 0] }
    : settled || mode === 'settled'
      ? { x: 0, y: 0, scale: 1, opacity: dimmed ? 0.35 : 1 }
      : reduced
        ? { x: 0, y: 0, scale: 1, opacity: 1 }
        : {
            x: [spawnOffset.dx, spawnOffset.dx * 0.5, 0],
            y: [spawnOffset.dy, spawnOffset.dy * 0.6 - 70, 0],
            scale: [0.12, 0.6, 1.1, 1],
            opacity: [0, 1, 1, 1],
          };

  const buttonTransition = popping
    ? { duration: 0.45, times: [0, 0.45, 1], ease: 'easeIn' as const }
    : settled
      ? { duration: 0.3 }
      : {
          duration: reduced ? 0.3 : ENTRANCE_DURATION,
          delay: index * (reduced ? 0.05 : STAGGER),
          ease: 'easeOut' as const,
        };

  return (
    <div className="bubble-anchor" style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}>
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
          aria-label={`Go to ${def.label} page`}
          initial={
            mode === 'settled'
              ? false
              : reduced
                ? { opacity: 0 }
                : { x: spawnOffset.dx, y: spawnOffset.dy, scale: 0.12, opacity: 0 }
          }
          animate={buttonAnimate}
          transition={buttonTransition}
          whileHover={popping ? undefined : { scale: 1.07 }}
          whileTap={popping ? undefined : { scale: 0.94 }}
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
            className="bubble-skin"
            style={{ width: size, height: size }}
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
            <span className="bubble-label">{def.label}</span>
          </motion.div>
        </motion.button>

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
