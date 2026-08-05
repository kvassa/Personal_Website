import { useRef, useState } from 'react';
import type { BubbleDef } from '../data/bubbles';
import { BUBBLES } from '../data/bubbles';
import { useIsMobile } from '../hooks/useIsMobile';
import { Bubble } from './Bubble';

interface BubbleFieldProps {
  /** 'intro': bubbles blow out of the wand, staggered. 'settled': render in place. */
  mode: 'intro' | 'settled';
  /** Measured on-screen wand-tip position (px); bubbles originate here. */
  spawnPoint: { x: number; y: number } | null;
  onAllSettled: () => void;
}

/**
 * Renders the five navigation bubbles at their scattered anchors and reports
 * when the last one has finished its entrance so the girl can slide away.
 */
export function BubbleField({ mode, spawnPoint, onAllSettled }: BubbleFieldProps) {
  const isMobile = useIsMobile();
  const settledIds = useRef(new Set<BubbleDef['id']>());
  const [poppingId, setPoppingId] = useState<BubbleDef['id'] | null>(null);

  const handleSettled = (id: BubbleDef['id']) => {
    settledIds.current.add(id);
    if (settledIds.current.size === BUBBLES.length) onAllSettled();
  };

  return (
    <>
      {BUBBLES.map((def, index) => (
        <Bubble
          key={def.id}
          def={def}
          index={index}
          mode={mode}
          spawnPoint={spawnPoint}
          isMobile={isMobile}
          dimmed={poppingId !== null && poppingId !== def.id}
          onSettled={handleSettled}
          onPopStart={setPoppingId}
        />
      ))}
    </>
  );
}
