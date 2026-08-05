import { motion } from 'motion/react';
import type { LandingPhase } from '../hooks/useLandingSequence';
import { GirlPlaceholder } from './GirlPlaceholder';
import { NameTitle } from './NameTitle';

interface GirlCharacterProps {
  phase: LandingPhase;
  onEntered: () => void;
  onExited: () => void;
}

/**
 * The girl (with "Kaavya Vassa" above her) rises from the bottom-right
 * corner, stays while she blows the bubbles, then slides back down and takes
 * the name with her. Mounted only while phase !== 'idle'.
 */
export function GirlCharacter({ phase, onEntered, onExited }: GirlCharacterProps) {
  const exiting = phase === 'girl-exiting';

  return (
    <motion.div
      className="girl"
      initial={{ y: '105%' }}
      animate={{ y: exiting ? '112%' : '0%' }}
      transition={
        exiting
          ? { duration: 0.7, ease: 'easeIn' }
          : { type: 'spring', stiffness: 110, damping: 14 }
      }
      onAnimationComplete={() => {
        if (phase === 'girl-entering') onEntered();
        else if (phase === 'girl-exiting') onExited();
      }}
    >
      <NameTitle />
      <GirlPlaceholder />
    </motion.div>
  );
}
