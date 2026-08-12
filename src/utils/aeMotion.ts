/**
 * Playback helpers for animation data extracted from Kaavya's After Effects
 * export (design/Website2.json, "Website2", 1920x1080 @ 29.97fps).
 *
 * AE position keyframes are spatial cubic beziers (a "to"/"ti" tangent pair
 * per keyframe) combined with a temporal ease curve per segment. Every
 * keyframe in that file uses AE's default ease (0.167/0.833 on both axes),
 * so a single shared ease covers the whole comp.
 */

export const COMP_W = 1920;
export const COMP_H = 1080;
export const FPS = 29.9700012207031;

export const framesToSeconds = (frames: number) => frames / FPS;

export interface Vec2 {
  x: number;
  y: number;
}

export interface BezierSegment {
  p0: Vec2;
  p1: Vec2;
  p2: Vec2;
  p3: Vec2;
  frames: number;
}

function cubicPoint(seg: BezierSegment, t: number): Vec2 {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * seg.p0.x + b * seg.p1.x + c * seg.p2.x + d * seg.p3.x,
    y: a * seg.p0.y + b * seg.p1.y + c * seg.p2.y + d * seg.p3.y,
  };
}

/** Standard cubic-bezier timing-function solver (WebKit UnitBezier-style Newton/bisection). */
function makeEase(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveTForX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      t -= (sampleX(t) - x) / dx;
    }
    let lo = 0;
    let hi = 1;
    t = Math.min(1, Math.max(0, t));
    for (let i = 0; i < 20 && (sampleX(t) - x) ** 2 > 1e-12; i++) {
      if (sampleX(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveTForX(x)));
}

/** AE's default auto-bezier temporal ease — used by every keyframe in Website2.json. */
export const AE_EASE = makeEase(0.167, 0.167, 0.833, 0.833);

export interface SampledPath {
  xs: number[];
  ys: number[];
  times: number[];
  totalSeconds: number;
}

/**
 * Samples a sequence of AE spatial-bezier segments into dense point/time
 * arrays (comp-pixel space), honoring each segment's real frame duration and
 * AE's default temporal ease. `times` is normalized 0..1 across the whole
 * path, suitable for a motion `transition.times`.
 */
export function samplePath(segments: BezierSegment[], samplesPerSecond = 14): SampledPath {
  const totalFrames = segments.reduce((sum, seg) => sum + seg.frames, 0);
  const totalSeconds = framesToSeconds(totalFrames);
  const xs: number[] = [];
  const ys: number[] = [];
  const times: number[] = [];
  let elapsedSeconds = 0;

  segments.forEach((seg, segIndex) => {
    const segSeconds = framesToSeconds(seg.frames);
    const steps = Math.max(2, Math.round(segSeconds * samplesPerSecond));
    const startStep = segIndex === 0 ? 0 : 1;
    for (let i = startStep; i <= steps; i++) {
      const localT = i / steps;
      const eased = AE_EASE(localT);
      const pt = cubicPoint(seg, eased);
      xs.push(pt.x);
      ys.push(pt.y);
      times.push((elapsedSeconds + localT * segSeconds) / totalSeconds);
    }
    elapsedSeconds += segSeconds;
  });

  return { xs, ys, times, totalSeconds };
}

export interface ColorStop {
  frame: number;
  color: string;
}

export interface ColorSpec {
  colors: string[];
  times: number[];
  delay: number;
  duration: number;
}

/** Converts absolute-frame color keyframes into a motion-ready delay/duration/times spec. */
export function colorSpecFromStops(stops: ColorStop[]): ColorSpec {
  const absoluteTimes = stops.map((s) => framesToSeconds(s.frame));
  const delay = absoluteTimes[0];
  const span = absoluteTimes[absoluteTimes.length - 1] - delay;
  const duration = span > 0 ? span : 0.01;
  return {
    colors: stops.map((s) => s.color),
    times: absoluteTimes.map((t) => (t - delay) / duration),
    delay,
    duration,
  };
}

/**
 * Deterministic PRNG seeded from a string. The idle wobble/blob-morph is
 * generated independently in two places (the visible goo layer and the
 * invisible interactive hit layer, so the label rides with the blob) — this
 * makes both derive identical "random" values for the same bubble id
 * without either one needing to share state with the other.
 */
export function seededRand(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export const CIRCLE_RADIUS = '50% 50% 50% 50% / 50% 50% 50% 50%';

export interface Wobble {
  driftX: number[];
  driftY: number[];
  driftDuration: number;
  driftDelay: number;
  morphKeys: string[];
  morphDuration: number;
  squishX: number[];
  squishY: number[];
}

/** Random organic 8-value border-radius, e.g. "46% 54% 58% 42% / 44% 57% 43% 56%". */
function blobRadius(rand: () => number): string {
  const r = () => `${Math.round(44 + rand() * 12)}%`;
  return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
}

/** Idle wobble/blob-morph parameters, deterministic per bubble id. */
export function createWobble(seedId: string): Wobble {
  const rand = seededRand(`${seedId}-wobble`);
  const r = (min: number, max: number) => min + rand() * (max - min);
  return {
    driftX: [0, r(-16, 16), r(-12, 12), 0],
    driftY: [0, r(-14, 14), r(-16, 16), 0],
    driftDuration: r(6, 10),
    driftDelay: r(0, 1.5),
    morphKeys: [CIRCLE_RADIUS, blobRadius(rand), blobRadius(rand), blobRadius(rand), CIRCLE_RADIUS],
    morphDuration: r(5, 8),
    squishX: [1, 1.04, 0.97, 1.02, 1],
    squishY: [1, 0.96, 1.05, 0.98, 1],
  };
}

