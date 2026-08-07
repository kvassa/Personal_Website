import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Girl from "../components/Girl";
import BubbleField, { type BubblePhase } from "../components/BubbleField";
import WandSparks from "../components/WandSparks";
import { SECTIONS, type SectionId } from "../data/sections";
import "./Home.css";

function initialPhases(): Record<SectionId, BubblePhase> {
  return SECTIONS.reduce(
    (acc, s) => {
      acc[s.id] = "hidden";
      return acc;
    },
    {} as Record<SectionId, BubblePhase>,
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [girlPose, setGirlPose] = useState<"enter" | "in" | "exit">("enter");
  const [phases, setPhases] = useState(initialPhases);
  const blowing = girlPose === "in" || girlPose === "enter";

  const origin = useMemo(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches
    ) {
      return { x: 78, y: 70 };
    }
    return { x: 82, y: 64 };
  }, []);

  useEffect(() => {
    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setGirlPose("in");
      }, 40),
    );

    timers.push(
      window.setTimeout(() => {
        SECTIONS.forEach((section, i) => {
          timers.push(
            window.setTimeout(() => {
              setPhases((prev) => ({ ...prev, [section.id]: "flying" }));
            }, i * 420),
          );
          timers.push(
            window.setTimeout(() => {
              setPhases((prev) => ({ ...prev, [section.id]: "idle" }));
            }, i * 420 + 1500),
          );
        });

        // Stay visible through the full blow, then drop
        const dropAt = SECTIONS.length * 420 + 2200;
        timers.push(
          window.setTimeout(() => {
            setGirlPose("exit");
          }, dropAt),
        );
      }, 500),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handlePop = (id: SectionId) => {
    const section = SECTIONS.find((s) => s.id === id);
    if (!section || phases[id] !== "idle") return;

    setPhases((prev) => ({ ...prev, [id]: "popping" }));
    window.setTimeout(() => {
      navigate(section.path);
    }, 380);
  };

  return (
    <main className="home">
      <div className="home__wash" aria-hidden />
      <BubbleField phases={phases} origin={origin} onPop={handlePop} />
      <WandSparks origin={origin} active={blowing} />
      <Girl pose={girlPose} />
    </main>
  );
}
