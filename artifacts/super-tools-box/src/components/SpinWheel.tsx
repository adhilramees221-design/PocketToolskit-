import { useEffect, useRef } from "react";

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#82E0AA", "#F1948A",
  "#85C1E9", "#F0B27A", "#C39BD3", "#76D7C4", "#FAD7A0",
  "#A9CCE3", "#A8D5A2",
];

interface SpinWheelProps {
  items: string[];
  spinning: boolean;
  targetIndex: number | null;
  onSpinComplete: () => void;
  size?: number;
}

export function SpinWheel({ items, spinning, targetIndex, onSpinComplete, size = 300 }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(-Math.PI / 2); // start pointer at top
  const animRef = useRef<number | null>(null);
  const startRotRef = useRef(0);
  const targetRotRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef(4000);

  const draw = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;
    const n = items.length;
    const arcSize = (2 * Math.PI) / n;
    const fontSize = Math.min(13, size / (n > 10 ? 26 : 22));

    ctx.clearRect(0, 0, size, size);

    // Outer ring shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // Draw segments
    for (let i = 0; i < n; i++) {
      const startAngle = rot + i * arcSize;
      const endAngle = startAngle + arcSize;
      const midAngle = startAngle + arcSize / 2;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;
      const maxChars = Math.max(8, Math.floor(r * 0.055));
      const rawLabel = items[i].replace(/[\u{1F300}-\u{1FFFF}]/gu, "").trim();
      const emoji = items[i].match(/[\u{1F300}-\u{1FFFF}]/gu)?.[0] ?? "";
      const label = rawLabel.length > maxChars ? rawLabel.slice(0, maxChars - 1) + "…" : rawLabel;
      ctx.fillText(`${emoji} ${label}`.trim(), r - 12, fontSize / 3);
      ctx.restore();
    }

    // Center circle (hub)
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 20);
    grad.addColorStop(0, "#f8fafc");
    grad.addColorStop(1, "#cbd5e1");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer arrow at top
    ctx.save();
    ctx.translate(cx, 0);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-13, 28);
    ctx.lineTo(13, 28);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "rgba(239,68,68,0.5)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    // Pointer inner highlight
    ctx.save();
    ctx.translate(cx, 0);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(-7, 24);
    ctx.lineTo(7, 24);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    ctx.restore();
  };

  // Redraw on item changes
  useEffect(() => {
    draw(rotRef.current);
  }, [items, size]);

  // Spin animation
  useEffect(() => {
    if (!spinning || targetIndex === null || items.length === 0) return;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const n = items.length;
    const arcSize = (2 * Math.PI) / n;
    // Center of targetIndex segment before rotation = targetIndex * arcSize + arcSize / 2
    // We want it at the top = -π/2
    // After rotation `rot`: position = angle + rot → we need angle + rot = -π/2
    // rot_target = -π/2 - (targetIndex * arcSize + arcSize / 2)
    const rawTarget = -Math.PI / 2 - (targetIndex * arcSize + arcSize / 2);
    // Ensure we spin forward at least 5 full rotations from current
    const minSpins = 5 * 2 * Math.PI;
    let finalRot = rawTarget;
    while (finalRot < rotRef.current + minSpins) finalRot += 2 * Math.PI;

    startRotRef.current = rotRef.current;
    targetRotRef.current = finalRot;
    startTimeRef.current = null;
    durationRef.current = 3800 + Math.random() * 800;

    // Ease-out quartic
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / durationRef.current, 1);
      const angle = startRotRef.current + (targetRotRef.current - startRotRef.current) * easeOut(progress);
      rotRef.current = angle;
      draw(angle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onSpinComplete();
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [spinning, targetIndex]);

  const canvasSize = Math.min(size, 340);
  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="mx-auto block"
      style={{ width: "100%", maxWidth: `${canvasSize}px`, touchAction: "none" }}
    />
  );
}
