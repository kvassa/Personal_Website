import { forwardRef } from "react";
import "./Girl.css";

type GirlProps = {
  /** enter = rising/in view, exit = dropping away */
  pose?: "enter" | "in" | "exit";
};

const Girl = forwardRef<HTMLDivElement, GirlProps>(function Girl(
  { pose = "enter" },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`girl girl--${pose}`}
      aria-hidden={pose === "exit"}
    >
      <p className="girl__name bubble-text bubble-text--name">Kaavya Vassa</p>
      <img
        className="girl__img"
        src="/assets/girl.png"
        alt=""
        draggable={false}
      />
    </div>
  );
});

export default Girl;
