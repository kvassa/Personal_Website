import type { CSSProperties } from "react";
import type { BubbleVariant, SectionId } from "../data/sections";
import "./NavBubble.css";

type NavBubbleProps = {
  id: SectionId;
  title: string;
  size: number;
  phase: "hidden" | "flying" | "idle" | "popping";
  origin: { x: number; y: number };
  slot: { x: number; y: number };
  variant: BubbleVariant;
  onPop: (id: SectionId) => void;
};

export default function NavBubble({
  id,
  title,
  size,
  phase,
  origin,
  slot,
  variant,
  onPop,
}: NavBubbleProps) {
  const pos = phase === "hidden" ? origin : slot;

  return (
    <button
      type="button"
      className={`nav-bubble nav-bubble--${phase} nav-bubble--${variant}`}
      style={
        {
          width: `${size}vmin`,
          height: `${size}vmin`,
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        } as CSSProperties
      }
      aria-label={title}
      disabled={phase !== "idle"}
      onClick={() => {
        if (phase === "idle") onPop(id);
      }}
    >
      <span className="nav-bubble__media" aria-hidden />
      <span className="nav-bubble__label bubble-text">{title}</span>
      {phase === "popping" && (
        <span className="nav-bubble__burst" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="nav-bubble__shard"
              style={{ "--i": i } as CSSProperties}
            />
          ))}
        </span>
      )}
    </button>
  );
}
