import { useEffect, useRef } from "react";
import "./BubbleVideo.css";

type BubbleVideoProps = {
  src?: string;
  timeOffset?: number;
  active?: boolean;
  className?: string;
};

/** Green-screen soap plate → soft glass disc + movie speculars. */
export default function BubbleVideo({
  src = "/assets/bubble-plate.mp4?v=2",
  timeOffset = 0,
  active = true,
  className = "",
}: BubbleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !active) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let running = true;
    let started = false;
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d", { willReadFrequently: true });
    if (!bctx) return;

    const paint = () => {
      if (!running) return;

      const cw = canvas.clientWidth || 256;
      const ch = canvas.clientHeight || 256;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const tw = Math.max(1, Math.round(cw * dpr));
      const th = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
      }

      if (video.readyState >= 2 && video.videoWidth > 0) {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (buffer.width !== vw || buffer.height !== vh) {
          buffer.width = vw;
          buffer.height = vh;
        }
        bctx.drawImage(video, 0, 0);
        const srcFrame = bctx.getImageData(0, 0, vw, vh);
        const s = srcFrame.data;

        // Center of mass of non-green pixels → bubble center
        let sumX = 0;
        let sumY = 0;
        let n = 0;
        for (let y = 0; y < vh; y++) {
          for (let x = 0; x < vw; x++) {
            const i = (y * vw + x) * 4;
            const r = s[i];
            const g = s[i + 1];
            const b = s[i + 2];
            const greenDom = g - Math.max(r, b);
            const isGreen =
              g > 95 && greenDom > 28 && g > r * 1.28 && g > b * 1.28;
            if (!isGreen) {
              sumX += x;
              sumY += y;
              n++;
            }
          }
        }

        const cx = n > 0 ? sumX / n : vw / 2;
        const cy = n > 0 ? sumY / n : vh / 2;
        const radius = Math.min(vw, vh) * 0.42;

        ctx.clearRect(0, 0, tw, th);

        // Draw glass disc in display space (contain fit of square plate)
        const scale = Math.min(tw / vw, th / vh) * 1.05;
        const ox = (tw - vw * scale) / 2;
        const oy = (th - vh * scale) / 2;
        const dcx = ox + cx * scale;
        const dcy = oy + cy * scale;
        const dr = radius * scale;

        // Soft pearlescent sphere
        const grd = ctx.createRadialGradient(
          dcx - dr * 0.28,
          dcy - dr * 0.32,
          dr * 0.05,
          dcx,
          dcy,
          dr,
        );
        grd.addColorStop(0, "rgba(255,255,255,0.55)");
        grd.addColorStop(0.35, "rgba(240,248,255,0.28)");
        grd.addColorStop(0.7, "rgba(255,210,235,0.22)");
        grd.addColorStop(0.88, "rgba(220,240,255,0.38)");
        grd.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.arc(dcx, dcy, dr, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Crisp rim
        ctx.beginPath();
        ctx.arc(dcx, dcy, dr * 0.97, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.65)";
        ctx.lineWidth = Math.max(1.5, dr * 0.025);
        ctx.stroke();

        // Specular highlights from Adobe plate (bright non-green only)
        bctx.clearRect(0, 0, vw, vh);
        const spec = bctx.createImageData(vw, vh);
        const d = spec.data;
        for (let y = 0; y < vh; y++) {
          for (let x = 0; x < vw; x++) {
            const i = (y * vw + x) * 4;
            const r = s[i];
            const g = s[i + 1];
            const b = s[i + 2];
            const greenDom = g - Math.max(r, b);
            const isGreen =
              g > 95 && greenDom > 28 && g > r * 1.28 && g > b * 1.28;
            const dx = x - cx;
            const dy = y - cy;
            const inside = dx * dx + dy * dy <= radius * radius * 1.05;
            if (isGreen || !inside) {
              d[i + 3] = 0;
              continue;
            }
            let gg = g;
            if (greenDom > 6) {
              const spill = Math.min(1, greenDom / 50);
              gg = Math.round(g * (1 - spill) + ((r + b) / 2) * spill);
            }
            const lum = (r + gg + b) / 3;
            if (lum < 150) {
              d[i + 3] = 0;
              continue;
            }
            d[i] = r;
            d[i + 1] = gg;
            d[i + 2] = b;
            d[i + 3] = Math.min(255, Math.round((lum - 140) * 3.2));
          }
        }
        bctx.putImageData(spec, 0, 0);
        ctx.drawImage(buffer, ox, oy, vw * scale, vh * scale);
      }

      rafRef.current = requestAnimationFrame(paint);
    };

    const onReady = () => {
      if (started) return;
      started = true;
      try {
        video.currentTime = timeOffset % (video.duration || 10);
      } catch {
        /* ignore */
      }
      void video.play().catch(() => undefined);
      rafRef.current = requestAnimationFrame(paint);
    };

    if (video.readyState >= 1) onReady();
    else video.addEventListener("loadedmetadata", onReady, { once: true });

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      video.pause();
    };
  }, [src, timeOffset, active]);

  return (
    <div className={`bubble-video ${className}`}>
      <video
        ref={videoRef}
        className="bubble-video__source"
        src={src}
        muted
        loop
        playsInline
        preload="auto"
      />
      <canvas ref={canvasRef} className="bubble-video__canvas" />
    </div>
  );
}
