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
   * Emergence timing in seconds, taken from Kaavya's After Effects comp
   * (design/Comp1.json keyframes at 29.97fps). Satellites only.
   */
  emerge?: { start: number; duration: number };
}

/*
 * All anchors, sizes, order, and timing below are measured from Kaavya's
 * Lottie export (design/Comp1.json, "Comp 1", 1920x1080):
 * - Main bubble: static at (960, 540), ~600px effective diameter.
 * - Four satellites slide out full-size from behind the main bubble,
 *   sequentially: bottom-left (f0-75), bottom-right (f75-148),
 *   top-right (f148-225), top-left (f225-298).
 * Desktop px sizes are scaled from her 1920-wide comp to a ~1440 viewport.
 */

/** The main bubble: center of the screen, carries the name, opens /about. */
export const MAIN_BUBBLE: BubbleDef = {
  id: 'about',
  label: 'Kaavya Vassa',
  path: '/about',
  anchor: { desktop: { x: 50, y: 50 }, mobile: { x: 50, y: 45 } },
  size: { desktop: 440, mobile: 195 },
};

/** The four satellites, in Kaavya's emergence order. */
export const SATELLITE_BUBBLES: BubbleDef[] = [
  {
    id: 'education',
    label: 'Education',
    path: '/education',
    anchor: { desktop: { x: 16.4, y: 72.3 }, mobile: { x: 24, y: 76 } },
    size: { desktop: 308, mobile: 132 },
    emerge: { start: 0, duration: 2.5 },
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    anchor: { desktop: { x: 80.2, y: 77.7 }, mobile: { x: 77, y: 82 } },
    size: { desktop: 341, mobile: 142 },
    emerge: { start: 2.5, duration: 2.44 },
  },
  {
    id: 'art',
    label: 'Art',
    path: '/art',
    anchor: { desktop: { x: 77.5, y: 23.4 }, mobile: { x: 76, y: 13 } },
    size: { desktop: 307, mobile: 128 },
    emerge: { start: 4.94, duration: 2.57 },
  },
  {
    id: 'experience',
    label: 'Experience',
    path: '/experience',
    anchor: { desktop: { x: 24, y: 24.6 }, mobile: { x: 23, y: 17 } },
    size: { desktop: 345, mobile: 138 },
    emerge: { start: 7.51, duration: 2.43 },
  },
];

export const ALL_BUBBLES: BubbleDef[] = [MAIN_BUBBLE, ...SATELLITE_BUBBLES];

/** AE's default keyframe interpolation from the export: near-linear ease. */
export const AE_EASE: [number, number, number, number] = [0.167, 0.167, 0.833, 0.833];
