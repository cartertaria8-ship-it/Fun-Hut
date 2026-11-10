import { useState } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";
import { FaceView } from "./FaceView";
import type { ChoiceRound } from "./types";

const COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3 portrait:grid-cols-2",
  4: "grid-cols-2",
};

export function ChoiceGame({
  round,
  onMistake,
  onDone,
}: {
  round: ChoiceRound;
  onMistake: () => void;
  onDone: () => void;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const hint = wrong.length >= 2 && !right;

  const pick = (key: string) => {
    if (right || wrong.includes(key)) return;
    if (key === round.answer) {
      setRight(true);
      sfx.correct();
      setTimeout(onDone, 900);
    } else {
      sfx.wrong();
      setWrong((w) => [...w, key]);
      setShake(key);
      setTimeout(() => setShake(null), 500);
      onMistake();
    }
  };

  const p = round.prompt;
  return (
    <div
      className={cn(
        "flex h-full w-full items-center",
        p ? "flex-col justify-center gap-[4vmin] landscape:flex-row" : "flex-col justify-center gap-[2vmin]",
      )}
    >
      {!p && (
        <p className="rounded-3xl bg-card px-6 py-3 text-center font-display text-[clamp(1.6rem,4vmin,2.4rem)] font-bold text-ink shadow-[var(--shadow-chunky)]">
          {round.instruction}
        </p>
      )}
      {p && (
        <div className="tile animate-float-in min-h-[28vmin] min-w-[34vmin] max-w-[90vw] px-6 py-4">
          {p.kind === "big" && (
            <span
              className="font-display text-[clamp(3.5rem,15vmin,8rem)] font-bold leading-none text-ink"
              style={p.color ? { color: p.color } : undefined}
            >
              {p.text}
            </span>
          )}
          {p.kind === "count" && (
            <div className="grid max-w-[60vmin] grid-cols-5 gap-2 text-[clamp(2rem,8vmin,4.5rem)] leading-none">
              {Array.from({ length: p.n }, (_, i) => (
                <span key={i} className="animate-pop" style={{ animationDelay: `${i * 60}ms` }}>
                  {p.emoji}
                </span>
              ))}
            </div>
          )}
          {p.kind === "sequence" && (
            <div className="flex flex-wrap items-center justify-center gap-[1.5vmin]">
              {p.items.map((f, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex size-[clamp(3rem,10vmin,5.5rem)] items-center justify-center rounded-2xl bg-muted text-[clamp(1.8rem,6vmin,3.5rem)]",
                    f.text && "border-4 border-dashed border-primary font-display font-bold text-primary",
                  )}
                >
                  {f.emoji ?? f.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={cn("grid gap-[3vmin]", COLS[round.options.length] ?? "grid-cols-2")}>
        {round.options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-label={o.text ?? o.big ?? o.key}
            onClick={() => pick(o.key)}
            className={cn(
              "tile size-[clamp(7rem,22vmin,12rem)]",
              right && o.key === round.answer && "tile-correct animate-pop",
              wrong.includes(o.key) && "opacity-35",
              shake === o.key && "animate-wiggle",
              hint && o.key === round.answer && "tile-hint",
            )}
          >
            <FaceView face={o} size={p ? "md" : "lg"} />
          </button>
        ))}
      </div>
    </div>
  );
}
