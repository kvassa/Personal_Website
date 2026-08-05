/**
 * Placeholder character art: a simple illustrated girl holding a bubble wand.
 * Swap this component's contents for the real artwork later — keep the wand
 * ring near the upper-left of the drawing (and update WAND_SPAWN in
 * src/data/bubbles.ts if its on-screen position changes).
 */
export function GirlPlaceholder() {
  return (
    <svg
      className="girl-art"
      viewBox="0 0 200 240"
      aria-hidden="true"
      focusable="false"
    >
      {/* wand stick + ring, raised in her left hand (viewer's upper-left) */}
      <line x1="62" y1="118" x2="30" y2="58" stroke="#b3577d" strokeWidth="6" strokeLinecap="round" />
      <circle cx="24" cy="46" r="16" fill="none" stroke="#ef7fab" strokeWidth="6" />
      <circle cx="24" cy="46" r="10" fill="rgba(255,255,255,0.45)" />

      {/* dress */}
      <path d="M100 128 L58 226 Q100 240 142 226 Z" fill="#ef7fab" />
      <path d="M100 128 L70 226 Q100 236 130 226 Z" fill="#f7a8c4" opacity="0.6" />

      {/* arms */}
      <line x1="84" y1="150" x2="62" y2="118" stroke="#f0b9a2" strokeWidth="10" strokeLinecap="round" />
      <line x1="116" y1="150" x2="140" y2="176" stroke="#f0b9a2" strokeWidth="10" strokeLinecap="round" />

      {/* head */}
      <circle cx="100" cy="96" r="34" fill="#f8c9b2" />

      {/* hair */}
      <path
        d="M66 96 Q62 52 100 50 Q138 52 134 96 Q134 74 118 68 Q100 62 82 68 Q66 74 66 96 Z"
        fill="#6b3a2a"
      />
      <path d="M66 96 Q60 128 70 150 Q76 130 72 108 Z" fill="#6b3a2a" />
      <path d="M134 96 Q140 128 130 150 Q124 130 128 108 Z" fill="#6b3a2a" />

      {/* face */}
      <circle cx="88" cy="96" r="3.5" fill="#4a2b35" />
      <circle cx="112" cy="96" r="3.5" fill="#4a2b35" />
      <path d="M92 110 Q100 118 108 110" fill="none" stroke="#c96a8e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="80" cy="106" r="5" fill="#f7a8c4" opacity="0.7" />
      <circle cx="120" cy="106" r="5" fill="#f7a8c4" opacity="0.7" />

      {/* legs */}
      <line x1="88" y1="228" x2="88" y2="240" stroke="#f0b9a2" strokeWidth="9" strokeLinecap="round" />
      <line x1="112" y1="228" x2="112" y2="240" stroke="#f0b9a2" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
