import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLandingSequence } from '../hooks/useLandingSequence';
import { BubbleField } from '../components/BubbleField';

/**
 * Landing experience (after Kaavya's Adobe comp): a single main bubble
 * carrying her name grows in at the center, four navigation bubbles emerge
 * out of it one by one and settle around it, then everything idles — waiting
 * to be popped.
 */
export function Home() {
  const { phase, onMainAppeared, onAllBubblesSettled } = useLandingSequence();

  // Whether this mount is playing the intro (fixed at mount so the bubbles
  // keep intro mode as the phase advances underneath them).
  const [introMode] = useState(phase !== 'idle');

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
      <BubbleField
        mode={introMode ? 'intro' : 'settled'}
        phase={phase}
        onMainAppeared={onMainAppeared}
        onAllSettled={onAllBubblesSettled}
      />
    </motion.div>
  );
}
