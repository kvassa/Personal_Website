import { useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * Shared shell for the five subpages: bubble-font title, placeholder content,
 * a small "Home" bubble to float back to the landing page, and the fade/rise
 * page transition used with AnimatePresence.
 */
export function PageLayout({ title, children }: PageLayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${title} · Kaavya Vassa`;
  }, [title]);

  return (
    <>
      {/* Kept outside the animated <main>: a transformed ancestor would turn
          position: fixed into container-relative positioning and make the
          bubble jump from mid-screen to the corner when the transform ends. */}
      <motion.button
        type="button"
        className="home-bubble bubble-button"
        aria-label="Back to home"
        onClick={() => navigate('/')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <div className="bubble-skin">
          <i className="bubble-glints" aria-hidden="true" />
        </div>
        <span className="bubble-label">Home</span>
      </motion.button>

      <motion.main
        className="page"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          minHeight: '100vh',
          padding: 'clamp(5.5rem, 10vh, 7rem) clamp(1.25rem, 6vw, 5rem) 4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: 'var(--color-heading)' }}>
          {title}
        </h1>
        {children}
      </motion.main>
    </>
  );
}
