import { useEffect, useRef, useState } from "react";
import { Eraser, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";
import { COLOURS } from "./registry";

const SIZES = [8, 18, 34];

function PencilGuide({ itemName }: { itemName: string }) {
  const drawing =
    itemName === "ball" ? (
      <>
        <circle cx="55" cy="50" r="34" />
        <path d="M22 43c20 4 38-7 54-22M25 67c19-10 42-9 61 2M47 17c10 18 13 44 5 66" />
      </>
    ) : itemName === "cap" ? (
      <>
        <path d="M20 62c3-27 21-43 47-43 20 0 34 12 38 32l-29 17-56-6Z" />
        <path d="M20 62c21-6 52 2 85-11 13-5 25-2 28 5 4 9-11 17-29 20-30 6-63-1-84-14Z" />
        <path d="M65 20c-1 7 0 14 4 20" />
      </>
    ) : (
      <>
        <path d="m14 48 42-34 43 34M23 43v49h67V43M48 92V63h19v29M33 55h10v11H33zM71 55h10v11H71z" />
      </>
    );

  return (
    <svg viewBox="0 0 150 110" className="h-24 w-32 shrink-0 text-ink/70" fill="none" aria-label={`${itemName} pencil outline`} role="img">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(2 2)" opacity="0.35">{drawing}</g>
        {drawing}
      </g>
    </svg>
  );
}

export function DrawingBoard({ item, onDone }: { item: { name: string; emoji: string }; onDone: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLOURS[4]!.color);
  const [size, setSize] = useState<number>(SIZES[1]!);
  const [eraser, setEraser] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Keep the drawing when the device rotates.
  useEffect(() => {
    const c = canvas.current!;
    const w = wrap.current!;
    const resize = () => {
      const snapshot = document.createElement("canvas");
      snapshot.width = c.width;
      snapshot.height = c.height;
      if (c.width) snapshot.getContext("2d")!.drawImage(c, 0, 0);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = w.getBoundingClientRect();
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, c.width, c.height);
      if (snapshot.width) ctx.drawImage(snapshot, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(w);
    return () => ro.disconnect();
  }, []);

  const point = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    const k = canvas.current!.width / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, k };
  };
  const draw = (e: React.PointerEvent) => {
    if (!last.current) return;
    const p = point(e);
    const ctx = canvas.current!.getContext("2d")!;
    ctx.strokeStyle = eraser ? "white" : color;
    ctx.lineWidth = size * p.k;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const clear = () => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    sfx.whoosh();
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 landscape:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex min-h-28 shrink-0 items-center justify-center gap-3 rounded-2xl bg-card px-4 py-2 font-display font-bold text-ink shadow-[var(--shadow-chunky)]">
          <span className="text-7xl leading-none" aria-hidden>{item.emoji}</span>
          <span className="text-center text-[clamp(1.2rem,3.2vmin,2rem)]">Draw a {item.name}!</span>
          <PencilGuide itemName={item.name} />
        </div>
        <div ref={wrap} className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] border-4 border-paper bg-paper shadow-[var(--shadow-chunky)]">
          <canvas
            ref={canvas}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              last.current = point(e);
              draw(e);
            }}
            onPointerMove={draw}
            onPointerUp={() => (last.current = null)}
            onPointerCancel={() => (last.current = null)}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 landscape:w-[clamp(7rem,16vw,11rem)] landscape:flex-col landscape:flex-nowrap landscape:overflow-y-auto">
        <div className="grid grid-cols-8 gap-2 landscape:grid-cols-2">
          {COLOURS.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              onClick={() => {
                setColor(c.color);
                setEraser(false);
                sfx.pop();
              }}
              className={cn(
                "chunky size-12 rounded-full border-4 border-paper",
                color === c.color && !eraser && "ring-4 ring-ink",
              )}
              style={{ background: c.color }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Brush size ${s}`}
              onClick={() => setSize(s)}
              className={cn("chunky flex size-12 items-center justify-center rounded-2xl bg-card", size === s && "ring-4 ring-ink")}
            >
              <span className="rounded-full bg-ink" style={{ width: s / 1.4, height: s / 1.4 }} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Eraser" onClick={() => setEraser((x) => !x)} className={cn("chunky flex size-12 items-center justify-center rounded-2xl bg-card", eraser && "ring-4 ring-ink")}>
            <Eraser className="size-6" />
          </button>
          <button type="button" aria-label="Clear" onClick={clear} className="chunky flex size-12 items-center justify-center rounded-2xl bg-card">
            <Trash2 className="size-6" />
          </button>
        </div>
        <button type="button" onClick={onDone} className="chunky flex h-14 items-center gap-2 rounded-2xl bg-success px-5 text-lg font-bold text-primary-foreground">
          <Check className="size-6" /> Done!
        </button>
      </div>
    </div>
  );
}
