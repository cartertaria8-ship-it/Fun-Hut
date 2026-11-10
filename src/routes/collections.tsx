import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { ChildShell } from "@/components/fun/ChildShell";
import { ProgressBar, Stars } from "@/components/fun/ui";
import { COLLECTIONS } from "@/lib/content";
import { collectionProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Fun Collections — Fun Hut" },
      { name: "description", content: "Six learning worlds: Alphabet Forest, Number Town, Shapes & Colours City, Animal Kingdom, Puzzle Island and Creative Corner." },
      { property: "og:title", content: "Fun Collections — Fun Hut" },
      { property: "og:description", content: "Six playful learning worlds for children aged 4–8." },
    ],
  }),
  component: () => (
    <ChildShell>
      {(player) => (
        <div className="grid grid-cols-1 gap-5 pb-2 sm:grid-cols-2 landscape:grid-cols-3">
          {COLLECTIONS.map((c, i) => {
            const on = player.collections.includes(c.id);
            const pr = collectionProgress(player, c.id);
            return (
              <Link
                key={c.id}
                to="/collection/$id"
                params={{ id: c.id }}
                disabled={!on}
                onClick={() => sfx.whoosh()}
                className={cn(
                  "chunky animate-float-in flex flex-col overflow-hidden rounded-[2rem] border-[5px] bg-card",
                  c.border,
                  !on && "opacity-50 grayscale",
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative">
                  <img src={c.image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" width={1280} height={832} />
                  <span className={cn("absolute bottom-2 left-2 flex size-14 items-center justify-center rounded-2xl text-3xl", c.bg)}>
                    {on ? c.mascotEmoji : <Lock className="size-7 text-paper" />}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <h2 className="text-2xl font-bold leading-tight text-ink">{c.name}</h2>
                  <p className="text-muted-foreground">{c.short}</p>
                  <div className="flex items-center gap-3">
                    <ProgressBar percent={pr.percent} barClass={c.bg} />
                    <span className="font-display font-bold text-ink">{pr.percent}%</span>
                  </div>
                  <Stars value={pr.stars} max={pr.maxStars} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </ChildShell>
  ),
});
