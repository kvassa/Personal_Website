import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLandingSequence } from '../hooks/useLandingSequence';
import { GirlCharacter } from '../components/GirlCharacter';
import { WAND_TIP_FRACTION } from '../components/GirlPlaceholder';
import { BubbleField } from '../components/BubbleField';

/**
 * Landing experience: the girl rises from the bottom-right with the name
 * above her, blows the five navigation bubbles out of her wand, then slides
 * back down while the bubbles wobble in place waiting to be popped.
 */
export function Home() {
  const { phase, onGirlEntered, onAllBubblesSettled, onGirlExited } = useLandingSequence();

  // Whether this mount is playing the intro (fixed at mount so the bubbles
  // keep intro mode as the phase advances underneath them).
  const [introMode] = useState(phase !== 'idle');

  // The wand tip's real on-screen position (px), measured once the girl has
  // fully risen, so every bubble emerges from the ring of her wand.
  const [spawnPoint, setSpawnPoint] = useState<{ x: number; y: number } | null>(null);

  const handleGirlEntered = () => {
    const art = document.querySelector('.girl-art');
    if (art) {
      const rect = art.getBoundingClientRect();
      setSpawnPoint({
        x: rect.left + rect.width * WAND_TIP_FRACTION.x,
        y: rect.top + rect.height * WAND_TIP_FRACTION.y,
      });
    }
    onGirlEntered();
  };

  useEffect(() => {
    document.title = 'Kaavya Vassa';
  }, []);

  return (
    <motion.div
      className="home"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight: '100vh' }}
    >
      {phase !== 'idle' && (
        <GirlCharacter phase={phase} onEntered={handleGirlEntered} onExited={onGirlExited} />
      )}

      {phase !== 'girl-entering' && (
        <BubbleField
          mode={introMode ? 'intro' : 'settled'}
          spawnPoint={spawnPoint}
          onAllSettled={onAllBubblesSettled}
        />
      )}
    </motion.div>
  );
}
