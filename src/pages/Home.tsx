import { useEffect } from 'react';
import { motion } from 'motion/react';
import { LottieBubbleField } from '../components/LottieBubbleField';

/**
 * Landing: Comp1 Lottie drives bubble diverge from the center;
 * HTML overlays carry labels and navigation clicks.
 */
export function Home() {
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
      <LottieBubbleField />
    </motion.div>
  );
}
