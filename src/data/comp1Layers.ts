import type { BubbleDef } from './bubbles';
import { MAIN_BUBBLE, SATELLITE_BUBBLES } from './bubbles';
import comp1 from '../assets/Comp1.json';

type Vec = number[];

interface Keyframe {
  t: number;
  s?: Vec;
}

interface LottieLayer {
  nm?: string;
  ind?: number;
  ty?: number;
  ip?: number;
  op?: number;
  ks?: {
    p?: { a?: number; k?: Vec | Keyframe[] };
    s?: { a?: number; k?: Vec | Keyframe[] };
  };
  shapes?: LottieShape[];
}

interface LottieShape {
  ty?: string;
  s?: { k?: Vec };
  it?: LottieShape[];
}

export interface Comp1Meta {
  w: number;
  h: number;
  fr: number;
  /** Frame when all satellites have reached their final positions. */
  settleFrame: number;
}

export interface BubblePose {
  /** Center X as % of the Lottie viewport width. */
  xPct: number;
  /** Center Y as % of the Lottie viewport height. */
  yPct: number;
  /** Diameter in % of the Lottie viewport width (for consistent sizing). */
  sizePct: number;
}

export interface MappedBubble {
  def: BubbleDef;
  layerInd: number;
}

const data = comp1 as {
  w: number;
  h: number;
  fr: number;
  ip: number;
  op: number;
  layers: LottieLayer[];
};

export const COMP1_META: Comp1Meta = {
  w: data.w,
  h: data.h,
  fr: data.fr,
  settleFrame: 300,
};

/**
 * Shape layer ind → bubble.
 * Final Comp1 positions (approx):
 * 6 center → about (Kaavya Vassa)
 * 5 end ~upper-left → education
 * 4 end ~upper-right → projects
 * 3 end ~lower-right → experience
 * 2 end ~lower-left → art
 */
const LAYER_TO_BUBBLE: Record<number, BubbleDef> = {
  6: MAIN_BUBBLE,
  5: SATELLITE_BUBBLES.find((b) => b.id === 'education')!,
  4: SATELLITE_BUBBLES.find((b) => b.id === 'projects')!,
  3: SATELLITE_BUBBLES.find((b) => b.id === 'experience')!,
  2: SATELLITE_BUBBLES.find((b) => b.id === 'art')!,
};

function findEllipseSize(shapes: LottieShape[] | undefined): Vec | null {
  if (!shapes) return null;
  for (const sh of shapes) {
    if (sh.ty === 'el' && sh.s?.k) return sh.s.k;
    const nested = findEllipseSize(sh.it);
    if (nested) return nested;
  }
  return null;
}

function sampleAnimated(prop: { a?: number; k?: Vec | Keyframe[] } | undefined, frame: number, fallback: Vec): Vec {
  if (!prop || prop.k == null) return fallback;
  if (!prop.a) {
    const staticVal = prop.k as Vec;
    return Array.isArray(staticVal) ? staticVal : fallback;
  }

  const keys = Array.isArray(prop.k) ? (prop.k as Keyframe[]) : [];
  if (keys.length === 0) return fallback;
  if (frame <= (keys[0].t ?? 0)) return keys[0].s ?? fallback;

  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    const t0 = a.t ?? 0;
    const t1 = b.t ?? t0;
    if (frame >= t0 && frame <= t1) {
      const u = t1 === t0 ? 1 : (frame - t0) / (t1 - t0);
      const e = u * u * (3 - 2 * u);
      const sa = a.s ?? fallback;
      const sb = b.s ?? sa;
      return sa.map((v, idx) => v + ((sb[idx] ?? v) - v) * e);
    }
  }
  return keys[keys.length - 1].s ?? fallback;
}

interface LayerSampler {
  layerInd: number;
  def: BubbleDef;
  sample: (frame: number) => BubblePose;
}

function buildSamplers(): LayerSampler[] {
  const samplers: LayerSampler[] = [];

  for (const layer of data.layers) {
    if (layer.ty !== 4 || layer.ind == null) continue;
    const def = LAYER_TO_BUBBLE[layer.ind];
    if (!def) continue;

    const ellipse = findEllipseSize(layer.shapes) ?? [300, 300];
    const baseScale = sampleAnimated(layer.ks?.s, 0, [100, 100, 100]);

    samplers.push({
      layerInd: layer.ind,
      def,
      sample: (frame: number) => {
        const pos = sampleAnimated(layer.ks?.p, frame, [data.w / 2, data.h / 2, 0]);
        const scale = sampleAnimated(layer.ks?.s, frame, baseScale);
        const sx = (scale[0] ?? 100) / 100;
        const diameter = (ellipse[0] ?? 300) * sx;
        return {
          xPct: (pos[0] / data.w) * 100,
          yPct: (pos[1] / data.h) * 100,
          sizePct: (diameter / data.w) * 100,
        };
      },
    });
  }

  // Stable order: main first, then satellites
  const order = [6, 5, 4, 3, 2];
  return order
    .map((ind) => samplers.find((s) => s.layerInd === ind))
    .filter((s): s is LayerSampler => Boolean(s));
}

export const COMP1_SAMPLERS = buildSamplers();

export function sampleAllPoses(frame: number): { def: BubbleDef; pose: BubblePose }[] {
  return COMP1_SAMPLERS.map((s) => ({ def: s.def, pose: s.sample(frame) }));
}

export { data as COMP1_ANIMATION };
