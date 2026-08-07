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
  size: { desktop: 300, mobile: 165 },
};

/**
 * The four satellites, in Kaavya's emergence order. Timing is a compressed
 * version of her sequence — same order and sequential feel, ~1.5s per slide
 * with slight overlap so the whole intro lands around 4.5s instead of 10s.
 */
export const SATELLITE_BUBBLES: BubbleDef[] = [
  {
    id: 'education',
    label: 'Education',
    path: '/education',
    anchor: { desktop: { x: 16.4, y: 72.3 }, mobile: { x: 24, y: 76 } },
    size: { desktop: 190, mobile: 108 },
    emerge: { start: 0, duration: 1.5 },
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    anchor: { desktop: { x: 80.2, y: 77.7 }, mobile: { x: 77, y: 82 } },
    size: { desktop: 212, mobile: 118 },
    emerge: { start: 1.05, duration: 1.5 },
  },
  {
    id: 'art',
    label: 'Art',
    path: '/art',
    anchor: { desktop: { x: 77.5, y: 23.4 }, mobile: { x: 76, y: 13 } },
    size: { desktop: 186, mobile: 104 },
    emerge: { start: 2.1, duration: 1.5 },
  },
  {
    id: 'experience',
    label: 'Experience',
    path: '/experience',
    anchor: { desktop: { x: 24, y: 24.6 }, mobile: { x: 23, y: 17 } },
    size: { desktop: 214, mobile: 116 },
    emerge: { start: 3.15, duration: 1.5 },
  },
];

export const ALL_BUBBLES: BubbleDef[] = [MAIN_BUBBLE, ...SATELLITE_BUBBLES];

/** Smooth glide for the slide-outs: gentle start, soft settle. */
export const EMERGE_EASE: [number, number, number, number] = [0.42, 0, 0.22, 1];
