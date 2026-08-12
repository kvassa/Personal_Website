import { useMemo, useRef, useState } from 'react';
import type { BubbleDef } from '../data/bubbles';
import { MAIN_BUBBLE, SATELLITE_BUBBLES } from '../data/bubbles';
import type { LandingPhase } from '../hooks/useLandingSequence';
import { useIsMobile } from '../hooks/useIsMobile';
import { Bubble } from './Bubble';
import { BubbleGoo } from './BubbleGoo';

interface BubbleFieldProps {
  /** 'intro': play the emergence sequence. 'settled': render all in place. */
  mode: 'intro' | 'settled';
  phase: LandingPhase;
  onMainAppeared: () => void;
  onAllSettled: () => void;
}

/**
 * Two layers sharing the same bubble data:
 *  - the goo layer (BubbleGoo) is the visible, colored blob per bubble,
 *    rendered inside an SVG filter that reproduces the comp's Gaussian Blur
 *    + Simple Choker + Turbulent Displace "liquid" merge — overlapping
 *    bubbles bridge together, separated ones render crisp.
 *  - the interactive layer (Bubble) carries the label, hit area, and
 *    click/pop/navigate behavior, unfiltered so text and hit targets stay
 *    crisp on top.
 * Both derive their motion/color from the same deterministic math (same
 * `def`, same seeded wobble), so they move in lockstep without either one
 * sharing state with the other.
 */
export function BubbleField({ mode, phase, onMainAppeared, onAllSettled }: BubbleFieldProps) {
  const isMobile = useIsMobile();
  const settledIds = useRef(new Set<BubbleDef['id']>());
  const [poppingId, setPoppingId] = useState<BubbleDef['id'] | null>(null);

  // Satellites emerge from the main bubble's center (its anchor, in px).
  const bp = isMobile ? 'mobile' : 'desktop';
  const spawnPoint = useMemo(
    () => ({
      x: (MAIN_BUBBLE.anchor[bp].x / 100) * window.innerWidth,
      y: (MAIN_BUBBLE.anchor[bp].y / 100) * window.innerHeight,
    }),
    [bp],
  );

  const handleMainSettled = () => {
    onMainAppeared();
  };

  const handleSatelliteSettled = (id: BubbleDef['id']) => {
    settledIds.current.add(id);
    if (settledIds.current.size === SATELLITE_BUBBLES.length) onAllSettled();
  };

  const satellitesVisible = mode === 'settled' || phase !== 'main-appearing';

  return (
    <>
      {/* Shared goo filter for .bubble-goo-layer: reproduces the comp's
          Gaussian Blur + Simple Choker adjustment layer — bubbles rendered
          inside this one filtered group bridge together where they overlap
          and stay crisp (no turbulence/displacement — that made edges look
          noisy/squiggly instead of clean liquid). */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="bubble-goo" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
            />
          </filter>
        </defs>
      </svg>

      <div className="bubble-goo-layer">
        <BubbleGoo def={MAIN_BUBBLE} isMain mode={mode} isMobile={isMobile} dimmed={false} popping={poppingId === MAIN_BUBBLE.id} />
        {satellitesVisible &&
          SATELLITE_BUBBLES.map((def) => (
            <BubbleGoo
              key={def.id}
              def={def}
              mode={mode}
              isMobile={isMobile}
              dimmed={poppingId !== null && poppingId !== def.id}
              popping={poppingId === def.id}
            />
          ))}
      </div>

      <Bubble
        def={MAIN_BUBBLE}
        index={0}
        mode={mode}
        isMain
        spawnPoint={null}
        isMobile={isMobile}
        dimmed={poppingId !== null && poppingId !== MAIN_BUBBLE.id}
        onSettled={handleMainSettled}
        onPopStart={setPoppingId}
      />

      {satellitesVisible &&
        SATELLITE_BUBBLES.map((def, index) => (
          <Bubble
            key={def.id}
            def={def}
            index={index}
            mode={mode}
            spawnPoint={spawnPoint}
            isMobile={isMobile}
            dimmed={poppingId !== null && poppingId !== def.id}
            onSettled={handleSatelliteSettled}
            onPopStart={setPoppingId}
          />
        ))}
    </>
  );
}
