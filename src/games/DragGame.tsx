import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";
import { FaceView } from "./FaceView";
import type { DragRound } from "./types";

interface DragState {
  key: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

/** Drag items onto targets. Tapping an item then a target works too. */
export function DragGame({
  round,
  onMistake,
  onDone,
}: {
  round: DragRound;
  onMistake: () => void;
  onDone: () => void;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [glow, setGlow] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const done = useRef(false);

  const attempt = (itemKey: string, targetKey: string) => {
    const item = round.items.find((i) => i.key === itemKey);
    if (!item || placed[itemKey]) return;
    if (item.match === targetKey) {
      sfx.correct();
      setPlaced((p) => ({ ...p, [itemKey]: targetKey }));
      setGlow(targetKey);
      setTimeout(() => setGlow(null), 450);
    } else {
      sfx.wrong();
      setShake(targetKey);
      setTimeout(() => setShake(null), 500);
      onMistake();
    }
    setSelected(null);
  };

  useEffect(() => {
    if (!done.current && Object.keys(placed).length === round.items.length) {
      done.current = true;
      setTimeout(onDone, 800);
    }
  }, [placed, round.items.length, onDone]);

  const onPointerDown = (e: React.PointerEvent, key: string) => {
    if (placed[key]) return;
    e.preventDefault();
    const s = { key, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0 };
    dragRef.current = s;
    setDrag(s);
    sfx.drag();

    const move = (ev: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;
      const next = { ...cur, dx: ev.clientX - cur.startX, dy: ev.clientY - cur.startY };
      dragRef.current = next;
      setDrag(next);
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const cur = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!cur) return;
      const moved = Math.hypot(cur.dx, cur.dy) > 12;
      if (!moved) {
        sfx.pop();
        setSelected((s) => (s === cur.key ? null : cur.key));
        return;
      }
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>("[data-drop]");
      const drop = el?.dataset["drop"];
      if (drop) attempt(cur.key, drop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const remaining = round.items.filter((i) => !placed[i.key]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[5vmin]">
      <div className="flex flex-wrap items-center justify-center gap-[3vmin]">
        {round.targets.map((t) => {
          const inside = round.items.filter((i) => placed[i.key] === t.key);
          return (
            <button
              key={t.key}
              type="button"
              data-drop={t.key}
              aria-label={`Drop here: ${t.text ?? t.big ?? t.key}`}
              onClick={() => selected && attempt(selected, t.key)}
              className={cn(
                "tile relative min-h-[clamp(8rem,26vmin,13rem)] min-w-[clamp(8rem,24vmin,13rem)] border-dashed p-3",
                selected && "border-primary",
                shake === t.key && "animate-wiggle",
                glow === t.key && "tile-correct animate-pop",
              )}
            >
              <FaceView face={t} />
              {inside.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {inside.map((i) => (
                    <span
                      key={i.key}
                      className="animate-pop rounded-xl bg-success/25 px-2 font-display text-[clamp(1.4rem,5vmin,2.5rem)] font-bold text-ink"
                    >
                      {i.emoji ?? i.big}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-[clamp(6rem,18vmin,10rem)] flex-wrap items-center justify-center gap-[3vmin] rounded-[2rem] bg-paper/50 p-[2vmin]">
        {remaining.map((i) => {
          const isDragging = drag?.key === i.key;
          return (
            <div
              key={i.key}
              role="button"
              aria-label={`Move ${i.big ?? i.key}`}
              onPointerDown={(e) => onPointerDown(e, i.key)}
              style={
                isDragging
                  ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.12)`, zIndex: 50, pointerEvents: "none" }
                  : undefined
              }
              className={cn(
                "tile size-[clamp(5.5rem,16vmin,9rem)] cursor-grab touch-none",
                isDragging ? "transition-none" : "",
                selected === i.key && "tile-hint",
              )}
            >
              <FaceView face={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
