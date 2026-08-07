import { useEffect, useRef } from "react";
import "./WandSparks.css";

type WandSparksProps = {
  origin: { x: number; y: number };
  active: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
};

export default function WandSparks({ origin, active }: WandSparksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (!active) return;
      const ox = (origin.x / 100) * window.innerWidth;
      const oy = (origin.y / 100) * window.innerHeight;
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: ox + (Math.random() - 0.5) * 14,
          y: oy + (Math.random() - 0.5) * 10,
          vx: -0.4 - Math.random() * 1.2,
          vy: -0.8 - Math.random() * 1.6,
          r: 3 + Math.random() * 7,
          life: 0,
          maxLife: 40 + Math.random() * 50,
        });
      }
    };

    let tick = 0;
    const loop = () => {
      if (!running) return;
      tick++;
      if (active && tick % 3 === 0) spawn();

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01;
        p.r *= 1.008;
        const t = p.life / p.maxLife;
        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = (1 - t) * 0.85;
        const grd = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r);
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grd.addColorStop(0.4, `rgba(200,230,255,${alpha * 0.5})`);
        grd.addColorStop(0.7, `rgba(180,140,255,${alpha * 0.3})`);
        grd.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.beginPath();
        ctx.fillStyle = grd;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.55})`;
        ctx.lineWidth = 1;
        ctx.arc(p.x, p.y, p.r * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [origin.x, origin.y, active]);

  return (
    <canvas
      ref={canvasRef}
      className="wand-sparks"
      aria-hidden
    />
  );
}
