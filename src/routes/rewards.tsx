import { createFileRoute } from "@tanstack/react-router";
import { ChildShell } from "@/components/fun/ChildShell";
import { ProgressBar } from "@/components/fun/ui";
import { COLLECTIONS, STICKERS } from "@/lib/content";
import { collectionProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "My Rewards — Fun Hut" },
      { name: "description", content: "Your Fun Hut sticker book, stars and world badges." },
      { property: "og:title", content: "My Rewards — Fun Hut" },
      { property: "og:description", content: "Stickers, stars and badges earned in Fun Hut." },
    ],
  }),
  component: () => (
    <ChildShell>
      {(player) => {
        const totalStickers = Object.keys(STICKERS).length;
        const got = Object.keys(STICKERS).filter((k) => player.progress[k]).length;
        return (
          <div className="flex flex-col gap-5 pb-2">
            <div className="flex flex-wrap items-center gap-4 rounded-[2rem] bg-sun-gradient p-5 text-primary-foreground shadow-[var(--shadow-chunky)]">
              <span className="text-6xl">🏆</span>
              <div>
                <h1 className="text-3xl font-bold">My Sticker Book</h1>
                <p className="font-display text-xl font-semibold">
                  {got} of {totalStickers} stickers · {player.stars} stars to spend
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 landscape:grid-cols-3">
              {COLLECTIONS.map((c) => {
                const pr = collectionProgress(player, c.id);
                const complete = pr.percent === 100;
                return (
                  <section key={c.id} className={cn("flex flex-col gap-3 rounded-[2rem] border-[5px] bg-card p-4 shadow-[var(--shadow-chunky)]", c.border)}>
                    <div className="flex items-center gap-3">
                      <span className={cn("flex size-14 items-center justify-center rounded-2xl text-3xl", c.bg, !complete && "opacity-40 grayscale")} aria-label={complete ? "Badge earned" : "Badge not yet earned"}>
                        {complete ? "🏅" : c.mascotEmoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-bold text-ink">{c.name}</h2>
                        <ProgressBar percent={pr.percent} barClass={c.bg} className="h-3 bg-muted" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {c.activities
                        .filter((a) => a.playable)
                        .map((a) => {
                          const has = !!player.progress[a.id];
                          return (
                            <div key={a.id} className={cn("flex size-20 flex-col items-center justify-center rounded-3xl border-4 border-dashed", has ? "animate-pop border-star bg-star/20" : "border-muted bg-muted")}>
                              <span className={cn("text-4xl", !has && "opacity-20 grayscale")}>{has ? STICKERS[a.id] : "?"}</span>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        );
      }}
    </ChildShell>
  ),
});
