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
}

/**
 * The main bubble (per Kaavya's Adobe comp): appears first at the center
 * carrying her name, births the four satellite bubbles, and stays as the
 * "More about me" click target.
 */
export const MAIN_BUBBLE: BubbleDef = {
  id: 'about',
  label: 'Kaavya Vassa',
  path: '/about',
  anchor: { desktop: { x: 50, y: 45 }, mobile: { x: 50, y: 30 } },
  size: { desktop: 280, mobile: 170 },
};

/**
 * The four satellite bubbles that emerge from the main bubble, settling in a
 * playful scatter around it (labels, routes, anchors, size variation).
 */
export const SATELLITE_BUBBLES: BubbleDef[] = [
  {
    id: 'education',
    label: 'Education',
    path: '/education',
    anchor: { desktop: { x: 17, y: 22 }, mobile: { x: 27, y: 56 } },
    size: { desktop: 185, mobile: 122 },
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    anchor: { desktop: { x: 78, y: 25 }, mobile: { x: 74, y: 52 } },
    size: { desktop: 205, mobile: 132 },
  },
  {
    id: 'art',
    label: 'Art',
    path: '/art',
    anchor: { desktop: { x: 22, y: 72 }, mobile: { x: 30, y: 78 } },
    size: { desktop: 145, mobile: 104 },
  },
  {
    id: 'experience',
    label: 'Experience',
    path: '/experience',
    anchor: { desktop: { x: 79, y: 68 }, mobile: { x: 72, y: 80 } },
    size: { desktop: 190, mobile: 126 },
  },
];

export const ALL_BUBBLES: BubbleDef[] = [MAIN_BUBBLE, ...SATELLITE_BUBBLES];
