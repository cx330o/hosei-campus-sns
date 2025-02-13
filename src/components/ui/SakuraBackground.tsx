import { useEffect, useRef, useCallback } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  swaySpeed: number;
  swayAmount: number;
  opacity: number;
  phase: number;
  color: string;
}

const PETAL_COUNT = 35;

const PETAL_COLORS = [
  "255,183,197",  // sakura pink
  "255,192,203",  // pink
  "255,209,220",  // light pink
  "255,170,190",  // deeper pink
  "255,228,235",  // very light pink
];

const SakuraBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationRef = useRef<number>(0);

  const initPetals = useCallback((w: number, h: number) => {
    const petals: Petal[] = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h - h,
        size: Math.random() * 12 + 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        fallSpeed: Math.random() * 0.8 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.005,
        swayAmount: Math.random() * 60 + 20,
        opacity: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      });
    }
    petalsRef.current = petals;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (petalsRef.current.length === 0) initPetals(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      time += 1;

      for (const p of petalsRef.current) {
        p.y += p.fallSpeed;
        p.x += Math.sin(time * p.swaySpeed + p.phase) * p.swayAmount * 0.01;
        p.rotation += p.rotationSpeed;

        // Reset when off screen
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
          p.opacity = Math.random() * 0.5 + 0.3;
        }

        // Draw petal
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // Petal shape (two overlapping ellipses)
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.15, 0, p.size * 0.5, p.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},0.8)`;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(p.size * 0.15, 0, p.size * 0.5, p.size * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},0.6)`;
        ctx.fill();

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initPetals]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default SakuraBackground;
// updated: —@¥Ñ©`¥Æ¥£¥¯¥ë¥¢¥Ë¥á©`¥·¥ç¥ó
