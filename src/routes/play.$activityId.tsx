import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { HelpCircle, Home, Pause, Play, RotateCcw, ArrowRight, Volume2, VolumeX, Map, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequirePlayer } from "@/components/fun/ChildShell";
import { BigButton, Funny } from "@/components/fun/ui";
import { ChoiceGame } from "@/games/ChoiceGame";
import { DragGame } from "@/games/DragGame";
import { DrawingBoard } from "@/games/DrawingBoard";
import { MemoryGame } from "@/games/MemoryGame";
import { Demo } from "@/games/Demo";
import { GAMES } from "@/games/registry";
import type { ChoiceRound, DragRound, DrawingRound, MemoryDeck } from "@/games/types";
import { collectionOfActivity, getActivity, STICKERS } from "@/lib/content";
import { starsForMistakes } from "@/lib/rules";
import { actions, isActivityUnlocked, previousPlayableActivity, STARS_TO_UNLOCK_NEXT_ACTIVITY, useCurrentPlayer, useGame } from "@/lib/store";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$activityId")({
  loader: ({ params }) => {
    const a = getActivity(params.activityId);
    if (!a || !GAMES[params.activityId]) throw notFound();
    return { name: a.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Play"} — Fun Hut` },
      { name: "description", content: `Play ${loaderData?.name} in Fun Hut.` },
      { property: "og:title", content: `${loaderData?.name ?? "Play"} — Fun Hut` },
      { property: "og:description", content: `A Fun Hut mini-game for children aged 4–8.` },
    ],
  }),
  component: PlayPage,
});

const CHEERS = ["Great job!", "You did it!", "Wonderful!", "Super star!", "Amazing!"];

function PlayPage() {
  const { activityId } = Route.useParams();
  const player = useRequirePlayer();
  if (!player) return <div className="fixed inset-0 bg-sky-gradient" />;
  const col = collectionOfActivity(activityId)!;
  if (!isActivityUnlocked(player, col.id, activityId)) {
    const previous = previousPlayableActivity(col.id, activityId);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-sky-gradient p-6">
        <div className="flex max-w-xl flex-col items-center gap-5 rounded-[2rem] bg-card p-8 text-center shadow-[var(--shadow-chunky)]">
          <Lock className="size-16 text-muted-foreground" />
          <h1 className="text-4xl font-bold text-ink">Level locked</h1>
          <p className="font-display text-xl font-semibold text-ink">
            Earn {STARS_TO_UNLOCK_NEXT_ACTIVITY} stars in {previous?.name ?? "the previous stage"} to unlock {getActivity(activityId)?.name}.
          </p>
          <Link to="/collection/$id" params={{ id: col.id }} className="chunky inline-flex min-h-16 items-center gap-2 rounded-[1.75rem] bg-sun-gradient px-7 font-display text-xl font-bold text-primary-foreground">
            <Map className="size-6" /> Back to {col.name}
          </Link>
        </div>
      </div>
    );
  }
  return <Game key={activityId} activityId={activityId} ageGroup={player.ageGroup} />;
}

function Game({ activityId, ageGroup }: { activityId: string; ageGroup: "4-5" | "6-8" }) {
  const def = GAMES[activityId]!;
  const activity = getActivity(activityId)!;
  const col = collectionOfActivity(activityId)!;
  const navigate = useNavigate();
  const player = useCurrentPlayer();
  const { settings } = useGame();

  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => def.build(ageGroup), [def, ageGroup, seed]);
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ stars: number } | null>(null);
  const [wrongBubble, setWrongBubble] = useState(false);
  const [demo, setDemo] = useState(true);

  const onMistake = useCallback(() => {
    setMistakes((m) => m + 1);
    setWrongBubble(true);
    setTimeout(() => setWrongBubble(false), 1200);
  }, []);

  const onDone = () => {
    if (idx + 1 < rounds.length) {
      sfx.whoosh();
      setIdx(idx + 1);
      return;
    }
    const stars = def.kind === "draw" ? 3 : starsForMistakes(mistakes, def.kind === "memory" ? 2 : 0);
    actions.recordResult(activityId, stars);
    sfx.yey();
    setTimeout(() => sfx.star(), 900);
    setResult({ stars });
  };

  const retry = () => {
    sfx.pop();
    setResult(null);
    setIdx(0);
    setMistakes(0);
    setSeed((s) => s + 1);
  };

  const playable = col.activities.filter((a) => a.playable);
  const candidateNextAct = playable[playable.findIndex((a) => a.id === activityId) + 1];
  const nextAct = candidateNextAct && player && isActivityUnlocked(player, col.id, candidateNextAct.id) ? candidateNextAct : null;

  useEffect(() => {
    if (!result || !nextAct) return;
    const timeout = setTimeout(() => {
      sfx.whoosh();
      void navigate({ to: "/play/$activityId", params: { activityId: nextAct.id } });
    }, 3500);
    return () => clearTimeout(timeout);
  }, [result, nextAct, navigate]);

  const round = rounds[idx];
  const instruction = round?.instruction ?? "";
  const showInstructionAboveGame = def.kind !== "choice" || Boolean((round as ChoiceRound | undefined)?.prompt);

  return (
    <div className={cn("fixed inset-0 flex flex-col overflow-hidden bg-sky-gradient")}>
      <img src={col.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" width={1280} height={832} />

      <header className="relative flex shrink-0 items-center gap-3 px-safe pt-safe pb-2">
        <BigButton variant="soft" size="icon" aria-label="Pause" onClick={() => setPaused(true)}>
          <Pause className="size-7 fill-current" />
        </BigButton>
        <div className="flex flex-1 items-center justify-center gap-2">
          {rounds.length > 1 &&
            rounds.map((_, i) => (
              <span key={i} className={cn("h-4 rounded-full transition-all", i < idx || result ? "w-8 bg-success" : i === idx ? "w-12 bg-primary" : "w-8 bg-paper/80")} />
            ))}
        </div>
        <BigButton variant="soft" size="icon" aria-label="Show me how" onClick={() => setDemo(true)}>
          <HelpCircle className="size-7" />
        </BigButton>
        <BigButton
          variant="soft"
          size="icon"
          aria-label={settings.sound ? "Sound off" : "Sound on"}
          onClick={() => actions.setSettings({ sound: !settings.sound })}
        >
          {settings.sound ? <Volume2 className="size-7" /> : <VolumeX className="size-7" />}
        </BigButton>
      </header>

      {showInstructionAboveGame && (
        <div className="relative flex shrink-0 items-center justify-center gap-3 px-safe pb-1">
          <Funny bob={false} className={cn("h-14 w-auto", wrongBubble && "animate-wiggle")} />
          <p className="rounded-3xl bg-card px-5 py-2 font-display text-[clamp(1.15rem,3.4vmin,1.9rem)] font-bold text-ink shadow-[var(--shadow-chunky)]">
            {wrongBubble ? "Oops! Try again 💛" : instruction}
          </p>
        </div>
      )}

      <main className="relative min-h-0 flex-1 px-safe pb-safe pt-2">
        {round && !result && (
          <div key={`${seed}-${idx}`} className="h-full w-full">
            {def.kind === "choice" && <ChoiceGame round={round as ChoiceRound} onMistake={onMistake} onDone={onDone} />}
            {def.kind === "drag" && <DragGame round={round as DragRound} onMistake={onMistake} onDone={onDone} />}
            {def.kind === "memory" && <MemoryGame round={round as MemoryDeck} onMistake={onMistake} onDone={onDone} />}
            {def.kind === "draw" && <DrawingBoard item={(round as DrawingRound).item} onDone={onDone} />}
          </div>
        )}
      </main>

      {demo && round && !result && (
        <Demo
          kind={def.kind}
          round={round}
          instruction={instruction}
          onStart={() => {
            sfx.pop();
            setDemo(false);
          }}
        />
      )}

      {paused && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4">
          <div className="animate-float-in flex flex-col items-center gap-4 rounded-[2.5rem] bg-card p-8">
            <h2 className="text-4xl font-bold text-ink">Paused</h2>
            <BigButton size="xl" variant="go" onClick={() => setPaused(false)}>
              <Play className="size-8 fill-current" /> Keep playing
            </BigButton>
            <BigButton variant="soft" onClick={() => navigate({ to: "/collection/$id", params: { id: col.id } })}>
              <Map className="size-6" /> Back to {col.name}
            </BigButton>
          </div>
        </div>
      )}

      {result && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-ink/40 px-safe pt-safe pb-safe">
          <Confetti />
          <div className="animate-yey pointer-events-none absolute top-[max(1rem,env(safe-area-inset-top))] z-10 font-display text-[clamp(4rem,16vmin,9rem)] font-bold text-star [text-shadow:0_6px_0_var(--primary),0_12px_30px_oklch(0.2_0.05_250/0.5)]">
            Yay!! 🎉
          </div>
          <div className="animate-float-in relative flex max-h-full w-full max-w-3xl flex-col items-center gap-4 overflow-y-auto rounded-[2.5rem] bg-card p-6 text-center landscape:flex-row landscape:text-left">
            <Funny className="h-[clamp(8rem,30vmin,16rem)] w-auto shrink-0" />
            <div className="flex flex-1 flex-col items-center gap-4 landscape:items-start">
              <h2 className="text-[clamp(2.2rem,7vmin,3.75rem)] font-bold leading-none text-ink">
                {CHEERS[(activityId.length + result.stars) % CHEERS.length]}
              </h2>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn("animate-star-in text-[clamp(3rem,10vmin,5rem)] leading-none", i >= result.stars && "opacity-20 grayscale")}
                    style={{ animationDelay: `${300 + i * 220}ms` }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="font-display text-xl font-semibold text-muted-foreground">
                +{result.stars} stars · sticker {STICKERS[activityId]} collected!
              </p>
              {nextAct && <p className="font-display text-lg font-bold text-success">Next up: {nextAct.name}!</p>}
              <div className="flex flex-wrap justify-center gap-3">
                <BigButton variant="soft" onClick={retry}>
                  <RotateCcw className="size-6" /> Again
                </BigButton>
                {nextAct && nextAct.id !== activityId && (
                  <BigButton variant="go" onClick={() => navigate({ to: "/play/$activityId", params: { activityId: nextAct.id } })}>
                    Next <ArrowRight className="size-6" />
                  </BigButton>
                )}
                <Link to="/collection/$id" params={{ id: col.id }} className="chunky inline-flex min-h-16 items-center gap-2 rounded-[1.75rem] bg-sun-gradient px-7 font-display text-xl font-bold text-primary-foreground">
                  <Home className="size-6" /> {activity.name === col.name ? "Back" : col.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.8,
        e: ["⭐", "🎉", "✨", "🎈", "💛"][i % 5],
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className="animate-confetti absolute top-0 text-3xl" style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}>
          {p.e}
        </span>
      ))}
    </div>
  );
}
