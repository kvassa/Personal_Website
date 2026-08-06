import { useMemo, useRef, useState } from 'react';
import type { BubbleDef } from '../data/bubbles';
import { MAIN_BUBBLE, SATELLITE_BUBBLES } from '../data/bubbles';
import type { LandingPhase } from '../hooks/useLandingSequence';
import { useIsMobile } from '../hooks/useIsMobile';
import { Bubble } from './Bubble';

interface BubbleFieldProps {
  /** 'intro': play the emergence sequence. 'settled': render all in place. */
  mode: 'intro' | 'settled';
  phase: LandingPhase;
  onMainAppeared: () => void;
  onAllSettled: () => void;
}

/**
 * Renders the main bubble plus the four satellites that emerge out of it,
 * and reports the sequence milestones: main bubble fully grown, and the last
 * satellite settled.
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

  return (
    <>
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

      {(mode === 'settled' || phase !== 'main-appearing') &&
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
