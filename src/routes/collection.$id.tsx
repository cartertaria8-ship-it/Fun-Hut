import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { useRequirePlayer } from "@/components/fun/ChildShell";
import { ProgressBar, Stars } from "@/components/fun/ui";
import { getCollection } from "@/lib/content";
import { collectionProgress, isActivityUnlocked, STARS_TO_UNLOCK_NEXT_ACTIVITY } from "@/lib/store";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/collection/$id")({
  loader: ({ params }) => {
    const c = getCollection(params.id);
    if (!c) throw notFound();
    return { name: c.name, short: c.short };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "World"} — Fun Hut` },
      { name: "description", content: `${loaderData?.name}: ${loaderData?.short} games for children in Fun Hut.` },
      { property: "og:title", content: `${loaderData?.name ?? "World"} — Fun Hut` },
      { property: "og:description", content: `${loaderData?.short} games in Fun Hut.` },
    ],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { id } = Route.useParams();
  const c = getCollection(id)!;
  const player = useRequirePlayer();

  return (
    <div className="fixed inset-0 overflow-hidden">
      <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" width={1280} height={832} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/40" />
      {player && (
        <div className="relative flex h-full flex-col px-safe pt-safe pb-safe">
          <header className="flex items-center gap-3">
            <Link to="/collections" aria-label="Back" onClick={() => sfx.pop()} className="chunky flex size-16 shrink-0 items-center justify-center rounded-full bg-card text-ink">
              <ArrowLeft className="size-8" />
            </Link>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-card/95 py-2 pl-2 pr-5 shadow-[var(--shadow-chunky)]">
              <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full text-2xl", c.bg)}>{c.mascotEmoji}</span>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[clamp(1.2rem,3.6vmin,2rem)] font-bold leading-tight text-ink">{c.name}</h1>
                <ProgressBar percent={collectionProgress(player, c.id).percent} barClass={c.bg} className="h-3 bg-muted" />
              </div>
            </div>
          </header>

          {/* Stepping-stone path */}
          <div className="flex min-h-0 flex-1 items-center overflow-auto py-4">
            <div className="mx-auto flex flex-col items-center gap-4 landscape:flex-row landscape:flex-wrap landscape:justify-center landscape:gap-[3vw]">
              {c.activities.map((a, i) => {
                const pr = player.progress[a.id];
                const unlocked = a.playable && isActivityUnlocked(player, c.id, a.id);
                const stone = cn(
                  "chunky relative flex size-[clamp(8.5rem,24vmin,12rem)] flex-col items-center justify-center gap-1 rounded-full border-[6px] bg-card text-center",
                  pr ? "border-success" : unlocked ? c.border : "border-paper opacity-70",
                  i % 2 === 0 ? "portrait:-translate-x-[18vw] landscape:-translate-y-[5vh]" : "portrait:translate-x-[18vw] landscape:translate-y-[5vh]",
                );
                const body = (
                  <>
                    <span className="text-[clamp(2.4rem,8vmin,4rem)] leading-none">{a.emoji}</span>
                    <span className="px-2 font-display text-[clamp(0.85rem,2.2vmin,1.1rem)] font-bold leading-tight text-ink">{a.name}</span>
                    {!a.playable ? (
                      <span className="flex items-center gap-1 text-sm font-bold text-muted-foreground"><Lock className="size-4" /> Soon</span>
                    ) : unlocked ? (
                      <Stars value={pr?.best ?? 0} />
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-bold text-muted-foreground"><Lock className="size-4" /> {STARS_TO_UNLOCK_NEXT_ACTIVITY} stars</span>
                    )}
                    <span className={cn("absolute -top-2 -left-2 flex size-10 items-center justify-center rounded-full font-display text-lg font-bold text-primary-foreground", c.bg)}>{i + 1}</span>
                  </>
                );
                return unlocked ? (
                  <Link key={a.id} to="/play/$activityId" params={{ activityId: a.id }} onClick={() => sfx.pop()} className={cn(stone, "animate-float-in")} style={{ animationDelay: `${i * 70}ms` }}>
                    {body}
                  </Link>
                ) : (
                  <div key={a.id} className={stone} aria-disabled="true" title={a.playable ? `Earn ${STARS_TO_UNLOCK_NEXT_ACTIVITY} stars in the previous stage to unlock` : "Coming soon"}>
                    {body}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
