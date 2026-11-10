import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";
import type { MemoryDeck } from "./types";

export function MemoryGame({
  round,
  onMistake,
  onDone,
}: {
  round: MemoryDeck;
  onMistake: () => void;
  onDone: () => void;
}) {
  const cards = useMemo(() => {
    const d = [...round.pairs, ...round.pairs].map((e, i) => ({ id: i, e }));
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j]!, d[i]!];
    }
    return d;
  }, [round]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const busy = useRef(false);

  const finished = useRef(false);
  useEffect(() => {
    if (!finished.current && matched.length === round.pairs.length) {
      finished.current = true;
      setTimeout(onDone, 700);
    }
  }, [matched, round.pairs.length, onDone]);

  const flip = (id: number) => {
    if (busy.current || open.includes(id)) return;
    const card = cards.find((c) => c.id === id)!;
    if (matched.includes(card.e)) return;
    sfx.pop();
    const next = [...open, id];
    setOpen(next);
    if (next.length === 2) {
      busy.current = true;
      const a = cards.find((c) => c.id === next[0])!;
      const b = cards.find((c) => c.id === next[1])!;
      setTimeout(() => {
        if (a.e === b.e) {
          sfx.correct();
          setMatched((m) => [...m, a.e]);
        } else {
          sfx.wrong();
          onMistake();
        }
        setOpen([]);
        busy.current = false;
      }, 750);
    }
  };

  const cols = cards.length <= 8 ? "grid-cols-4 portrait:grid-cols-2" : "grid-cols-4 landscape:grid-cols-6 portrait:grid-cols-3";
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className={cn("grid gap-[2.5vmin]", cols)}>
        {cards.map((c) => {
          const faceUp = open.includes(c.id) || matched.includes(c.e);
          return (
            <button
              key={c.id}
              type="button"
              aria-label={faceUp ? c.e : "Hidden card"}
              onClick={() => flip(c.id)}
              className={cn(
                "tile size-[clamp(5.5rem,17vmin,10rem)] text-[clamp(2.4rem,8vmin,4.5rem)]",
                !faceUp && "bg-island",
                matched.includes(c.e) && "tile-correct",
              )}
            >
              {faceUp ? <span className="animate-pop">{c.e}</span> : <span className="opacity-80">❔</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
