import { useEffect, useState } from "react";
import NavBubble from "./NavBubble";
import { BUBBLE_SLOTS, SECTIONS, type SectionId } from "../data/sections";
import "./BubbleField.css";

export type BubblePhase = "hidden" | "flying" | "idle" | "popping";

type BubbleFieldProps = {
  phases: Record<SectionId, BubblePhase>;
  origin: { x: number; y: number };
  onPop: (id: SectionId) => void;
};

const MOBILE_SLOTS: Record<SectionId, { x: number; y: number; size: number }> = {
  education: { x: 30, y: 22, size: 26 },
  projects: { x: 70, y: 20, size: 28 },
  art: { x: 50, y: 40, size: 24 },
  experience: { x: 30, y: 58, size: 26 },
  about: { x: 70, y: 60, size: 28 },
};

function useNarrow() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return narrow;
}

export default function BubbleField({ phases, origin, onPop }: BubbleFieldProps) {
  const narrow = useNarrow();
  const slots = narrow ? MOBILE_SLOTS : BUBBLE_SLOTS;

  return (
    <div className="bubble-field" aria-label="Site sections">
      {SECTIONS.map((section) => {
        const slot = slots[section.id];
        return (
          <NavBubble
            key={section.id}
            id={section.id}
            title={section.title}
            size={slot.size}
            phase={phases[section.id]}
            origin={origin}
            slot={{ x: slot.x, y: slot.y }}
            variant={section.variant}
            onPop={onPop}
          />
        );
      })}
    </div>
  );
}
