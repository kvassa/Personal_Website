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
 * Single source of truth for the five navigation bubbles: labels, routes,
 * settled anchors (playful scatter on desktop, zigzag column on mobile)
 * and per-bubble size variation.
 */
export const BUBBLES: BubbleDef[] = [
  {
    id: 'education',
    label: 'Education',
    path: '/education',
    anchor: { desktop: { x: 18, y: 26 }, mobile: { x: 30, y: 16 } },
    size: { desktop: 180, mobile: 132 },
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    anchor: { desktop: { x: 45, y: 52 }, mobile: { x: 70, y: 31 } },
    size: { desktop: 205, mobile: 140 },
  },
  {
    id: 'art',
    label: 'Art',
    path: '/art',
    anchor: { desktop: { x: 66, y: 22 }, mobile: { x: 28, y: 46 } },
    size: { desktop: 150, mobile: 118 },
  },
  {
    id: 'experience',
    label: 'Experience',
    path: '/experience',
    anchor: { desktop: { x: 24, y: 70 }, mobile: { x: 68, y: 61 } },
    size: { desktop: 190, mobile: 138 },
  },
  {
    id: 'about',
    label: 'More about me',
    path: '/about',
    anchor: { desktop: { x: 82, y: 55 }, mobile: { x: 34, y: 77 } },
    size: { desktop: 170, mobile: 130 },
  },
];

/**
 * Where bubbles spawn from, as % of the viewport — approximately the tip of
 * the girl's bubble wand in the bottom-right corner. If the character art is
 * swapped, tune this point to match the new wand position.
 */
export const WAND_SPAWN = {
  desktop: { x: 84, y: 60 },
  mobile: { x: 72, y: 72 },
};
