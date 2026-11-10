import { Play } from "lucide-react";
import { BigButton, Funny } from "@/components/fun/ui";
import { FaceView } from "./FaceView";
import type { ChoiceRound, DragRound, DrawingRound, GameDef, MemoryDeck } from "./types";

function Hand({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-20 text-6xl drop-shadow-lg ${className}`}>
      👆
    </span>
  );
}

const mini = "tile size-28 shrink-0";

/** "Watch how" demo shown before a game: a hand acts out the first move. */
export function Demo({ kind, round, instruction, onStart }: { kind: GameDef["kind"]; round: unknown; instruction: string; onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-ink/45 px-safe pt-safe pb-safe">
      <div className="animate-float-in flex w-full max-w-3xl flex-col items-center gap-4 rounded-[2.5rem] bg-card p-6 text-center landscape:flex-row landscape:text-left">
        <div className="flex flex-col items-center gap-3 landscape:w-2/5 landscape:items-start">
          <Funny className="h-24 w-auto" />
          <h2 className="text-3xl font-bold text-ink">Watch how!</h2>
          <p className="font-display text-xl font-semibold text-muted-foreground">{instruction}</p>
        </div>
        <div className="flex flex-1 flex-col items-center gap-4">
          <div className="relative flex h-[21rem] w-full max-w-[20rem] items-center justify-center rounded-[2rem] bg-muted/60">
            {kind === "drag" && <DragDemo round={round as DragRound} />}
            {kind === "choice" && <ChoiceDemo round={round as ChoiceRound} />}
            {kind === "memory" && <MemoryDemo round={round as MemoryDeck} />}
            {kind === "draw" && <DrawDemo round={round as DrawingRound} />}
          </div>
          <BigButton size="xl" variant="go" onClick={onStart}>
            <Play className="size-8 fill-current" /> I'm ready!
          </BigButton>
        </div>
      </div>
    </div>
  );
}

function DragDemo({ round }: { round: DragRound }) {
  const item = round.items[0]!;
  const target = round.targets.find((t) => t.key === item.match) ?? round.targets[0]!;
  return (
    <div className="relative flex flex-col items-center gap-20">
      <div className={`${mini} demo-target border-dashed`}>
        <FaceView face={target} />
      </div>
      <div className={`${mini} opacity-40`}>
        <FaceView face={item} />
      </div>
      {/* the moving copy + hand */}
      <div className="demo-drag absolute bottom-0 left-1/2 -ml-14">
        <div className={mini}>
          <FaceView face={item} />
        </div>
        <Hand className="top-14 left-12" />
      </div>
    </div>
  );
}

function ChoiceDemo({ round }: { round: ChoiceRound }) {
  const opts = round.options.slice(0, 3);
  if (!opts.some((o) => o.key === round.answer)) opts[0] = round.options.find((o) => o.key === round.answer)!;
  const answerIdx = opts.findIndex((o) => o.key === round.answer);
  return (
    <div className="flex flex-col items-center gap-6">
      {round.prompt && (
        <div className="tile px-5 py-2">
          <span className="font-display text-4xl font-bold text-ink">
            {round.prompt.kind === "big" ? round.prompt.text : round.prompt.kind === "count" ? round.prompt.emoji.repeat(round.prompt.n) : round.prompt.items.map((f) => f.emoji ?? f.text).join(" ")}
          </span>
        </div>
      )}
      <div className="flex gap-3">
        {opts.map((o, i) => (
          <div key={o.key} className={`relative tile size-24 overflow-visible [&_span]:!text-4xl ${i === answerIdx ? "demo-correct" : ""}`}>
            <FaceView face={o} />
            {i === answerIdx && <Hand className="demo-tap top-12 left-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryDemo({ round }: { round: MemoryDeck }) {
  const e = round.pairs[0]!;
  return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="relative tile size-24 bg-island text-5xl">
          {i === 0 || i === 3 ? (
            <>
              <span className={i === 0 ? "demo-flip-a" : "demo-flip-b"}>{e}</span>
              <Hand className={`top-12 left-10 ${i === 0 ? "demo-tap-a" : "demo-tap-b"}`} />
            </>
          ) : (
            <span className="opacity-80">❔</span>
          )}
        </div>
      ))}
    </div>
  );
}

function DrawDemo({ round }: { round: DrawingRound }) {
  return (
    <div className="relative flex size-60 items-center justify-center rounded-3xl bg-paper">
      <span className="absolute top-3 right-4 text-5xl" aria-hidden>{round.item.emoji}</span>
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <path d="M20 60 Q35 20 50 50 T80 40" fill="none" stroke="oklch(0.58 0.18 255)" strokeWidth="6" strokeLinecap="round" className="demo-line" pathLength={100} />
      </svg>
      <Hand className="demo-draw top-0 left-0" />
    </div>
  );
}
