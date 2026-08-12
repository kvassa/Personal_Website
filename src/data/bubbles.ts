import type { BezierSegment, ColorStop } from '../utils/aeMotion';

export interface BubbleDef {
  id: 'education' | 'projects' | 'art' | 'experience' | 'about';
  label: string;
  path: string;
  /** Settled position as % of the viewport, per breakpoint. */
  anchor: {
    desktop: { x: number; y: number };
    mobile: { x: number; y: number };
  };
  /** Bubble diameter in px, per breakpoint. */
  size: {
    desktop: number;
    mobile: number;
  };
  /**
   * Emergence timing in seconds, taken from Kaavya's After Effects export
   * (design/Website2.json keyframes at 29.97fps). Satellites only.
   */
  emerge?: { start: number; duration: number };
  /** AE spatial-bezier path (comp-pixel space) from the main bubble to the anchor. Satellites only. */
  segments?: BezierSegment[];
  /** Drives --outer (the glow, blended in from the true inner-circle radius to the edge) on .bubble-skin. */
  outerColorStops: ColorStop[];
  /** Drives --inner (the core, solid through the true inner-circle radius) on .bubble-skin. */
  innerColorStops: ColorStop[];
  /** Inner-circle diameter / outer-circle diameter in the comp — where the solid core ends and the blend to --outer begins. */
  innerRatio: number;
}

/*
 * Anchors, sizes, colors, and glide paths (segments) below are read
 * directly out of Kaavya's After Effects export (design/Website2.json,
 * "Website2", 1920x1080 @ 29.9700012207031fps) — confirmed against her
 * reference screen recording (~/Desktop/Animation.mov): every bubble's
 * inner/outer hue and final settled position matches exactly.
 *
 * Timing (emerge.start/duration and the color-stop frames below) does NOT
 * match the JSON's literal keyframes, though — the recording shows the
 * satellites overlapping/merging with the main bubble far longer than the
 * JSON's near-back-to-back windows imply (e.g. Projects stays visibly
 * fused with the main blob until ~9s in, not ~5s), and the whole intro
 * runs closer to 13s with a longer initial hold. These values are
 * recalibrated from that recording (frame-inspected by eye, not
 * pixel-tracked, so treat as a close approximation rather than exact):
 * main holds alone ~1.8s, Education buds+separates fast (~1.8-3.1s),
 * Projects buds right after but stays merged until ~9.3s, Art buds ~4.5s
 * overlapping Projects and separates ~9s, Experience is last (~9.3-12.5s),
 * and the main bubble's own pink-to-blue-violet pulse finishes as
 * everything settles (~12.5s). "frame" numbers below are this timeline in
 * comp-equivalent frames (seconds × 29.97), kept only so colorSpecFromStops
 * can share its frame→seconds conversion; they're not from the JSON.
 *
 * Each bubble is two concentric flat-color circles — a static inner core
 * and a crossfading outer glow — rendered as a single radial gradient on
 * .bubble-skin: solid --inner out to innerRatio of the radius, blending to
 * --outer at the edge. Desktop px sizes are scaled from the 1920-wide comp
 * to a ~1440 viewport.
 */

const v = (x: number, y: number) => ({ x, y });

export const MAIN_BUBBLE: BubbleDef = {
  id: 'about',
  label: 'Kaavya Vassa',
  path: '/about',
  anchor: { desktop: { x: 50, y: 50 }, mobile: { x: 50, y: 45 } },
  size: { desktop: 445, mobile: 147 },
  // Center stays pink; the edge pulses pink -> blue-violet as the intro
  // finishes (confirmed against the recording: the center bubble is still
  // pink through the whole satellite sequence, then turns purple at the
  // very end, from the edge inward).
  innerColorStops: [{ frame: 0, color: '#ff00c4' }],
  outerColorStops: [
    { frame: 266.733, color: '#ff00c4' },
    { frame: 269.73, color: '#ff00c4' },
    { frame: 356.643, color: '#6301ff' },
  ],
  innerRatio: 0.758,
};

/**
 * The four satellites, in Kaavya's emergence order, with her literal
 * comp-pixel positions/tangents and frame-accurate timing.
 */
export const SATELLITE_BUBBLES: BubbleDef[] = [
  {
    id: 'education',
    label: 'Education',
    path: '/education',
    anchor: { desktop: { x: 16.365, y: 72.285 }, mobile: { x: 24, y: 76 } },
    size: { desktop: 190, mobile: 108 },
    emerge: { start: 1.2, duration: 1.3 },
    segments: [
      {
        p0: v(950.978, 521.527),
        p1: v(960.85, 621.485),
        p2: v(62.459, 707.869),
        p3: v(314.206, 780.678),
        frames: 75.0000030548126,
      },
    ],
    outerColorStops: [
      { frame: 35.964, color: '#fe01b1' },
      { frame: 71.928, color: '#fd81ef' },
    ],
    innerColorStops: [{ frame: 35.964, color: '#fe01b1' }],
    innerRatio: 0.667,
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    anchor: { desktop: { x: 80.199, y: 77.674 }, mobile: { x: 77, y: 82 } },
    size: { desktop: 212, mobile: 118 },
    emerge: { start: 1.7, duration: 7.0 },
    segments: [
      {
        p0: v(945.005, 518.023),
        p1: v(955.096, 698.86),
        p2: v(1703.341, 1071.156),
        p3: v(1509.174, 795.489),
        frames: 71,
      },
      {
        p0: v(1509.174, 795.489),
        p1: v(1512.876, 800.745),
        p2: v(1543.381, 844.448),
        p3: v(1539.818, 838.876),
        frames: 2.000006028164,
      },
    ],
    outerColorStops: [
      { frame: 50.949, color: '#ffb358' },
      { frame: 251.748, color: '#ff93ec' },
    ],
    innerColorStops: [{ frame: 50.949, color: '#ffb358' }],
    innerRatio: 0.574,
  },
  {
    id: 'art',
    label: 'Art',
    path: '/art',
    anchor: { desktop: { x: 77.453, y: 23.43 }, mobile: { x: 76, y: 13 } },
    size: { desktop: 186, mobile: 104 },
    emerge: { start: 3.9, duration: 4.5 },
    segments: [
      {
        p0: v(944.108, 526.998),
        p1: v(1195.032, 607.211),
        p2: v(1540.568, -4.878),
        p3: v(1487.092, 253.039),
        frames: 77.000009164438,
      },
    ],
    outerColorStops: [
      { frame: 116.883, color: '#cd08f5' },
      { frame: 221.778, color: '#f9b517' },
      { frame: 251.748, color: '#f9b517' },
    ],
    innerColorStops: [{ frame: 116.883, color: '#cd08f5' }],
    innerRatio: 0.694,
  },
  {
    id: 'experience',
    label: 'Experience',
    path: '/experience',
    anchor: { desktop: { x: 20.624, y: 25.923 }, mobile: { x: 23, y: 17 } },
    size: { desktop: 214, mobile: 116 },
    emerge: { start: 8.7, duration: 3.2 },
    // Control points dampened to 0.4x of the raw AE tangent handles — at
    // full scale this segment's curve peaks ~140px above the entire canvas,
    // producing a much bigger leap-and-return than the actual comp shows.
    segments: [
      {
        p0: v(946.36, 521.845),
        p1: v(865.571, 255.948),
        p2: v(302.348, 134.517),
        p3: v(395.972, 279.971),
        frames: 73.000012137789,
      },
    ],
    outerColorStops: [
      { frame: 260.739, color: '#fbae45' },
      { frame: 356.643, color: '#cd08f5' },
    ],
    innerColorStops: [{ frame: 260.739, color: '#fbae45' }],
    innerRatio: 0.65,
  },
];

export const ALL_BUBBLES: BubbleDef[] = [MAIN_BUBBLE, ...SATELLITE_BUBBLES];
