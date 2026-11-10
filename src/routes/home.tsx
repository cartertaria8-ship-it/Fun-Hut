import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Play } from "lucide-react";
import mapImg from "@/assets/map.jpg";
import { ChildShell } from "@/components/fun/ChildShell";
import { BigButton, Funny, ProgressBar } from "@/components/fun/ui";
import { COLLECTIONS, getActivity, collectionOfActivity } from "@/lib/content";
import { collectionProgress, type Player } from "@/lib/store";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "My Fun Hut — home" },
      { name: "description", content: "Explore the Fun Hut world map and pick an adventure." },
      { property: "og:title", content: "My Fun Hut — home" },
      { property: "og:description", content: "Explore the Fun Hut world map." },
    ],
  }),
  component: () => <ChildShell>{(p) => <Home player={p} />}</ChildShell>,
});

function Home({ player }: { player: Player }) {
  const navigate = useNavigate();
  const recent = Object.entries(player.progress)
    .sort((a, b) => b[1].last - a[1].last)
    .slice(0, 4)
    .map(([id]) => id)
    .filter((id) => {
      const c = collectionOfActivity(id);
      return c && player.collections.includes(c.id);
    });

  const letsPlay = () => {
    sfx.pop();
    const firstNew = COLLECTIONS.filter((c) => player.collections.includes(c.id))
      .flatMap((c) => c.activities.filter((a) => a.playable))
      .find((a) => !player.progress[a.id]);
    const id = firstNew?.id ?? recent[0];
    if (id) void navigate({ to: "/play/$activityId", params: { activityId: id } });
    else void navigate({ to: "/collections" });
  };

  return (
    <div className="flex min-h-full flex-col gap-4 landscape:flex-row">
      <section className="flex shrink-0 flex-col items-center justify-center gap-3 text-center landscape:w-[28%]">
        <Funny className="h-[clamp(7rem,26vmin,15rem)] w-auto" />
        <h1 className="text-[clamp(1.8rem,5vmin,2.75rem)] font-bold leading-tight text-ink">Hi, {player.nickname}!</h1>
        <BigButton size="xl" onClick={letsPlay}>
          <Play className="size-8 fill-current" /> Let's Play
        </BigButton>
        {recent.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-2">
            <span className="font-display text-lg font-bold text-ink">Play again</span>
            <div className="flex flex-wrap justify-center gap-2">
              {recent.map((id) => {
                const a = getActivity(id)!;
                return (
                  <Link key={id} to="/play/$activityId" params={{ activityId: id }} aria-label={a.name} className="chunky flex size-16 items-center justify-center rounded-2xl bg-card text-4xl">
                    {a.emoji}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Tablet/landscape: illustrated map with world bubbles */}
      <section className="relative hidden min-h-0 flex-1 overflow-hidden rounded-[2.5rem] border-[6px] border-paper shadow-[var(--shadow-chunky)] landscape:block">
        <img src={mapImg} alt="Fun Hut world map" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1088} />
        {COLLECTIONS.map((c) => {
          const on = player.collections.includes(c.id);
          const pr = collectionProgress(player, c.id);
          const inner = (
            <>
              <span className="text-[clamp(1.8rem,5vmin,3rem)] leading-none">{on ? c.mascotEmoji : <Lock className="size-8" />}</span>
              <span className="font-display text-[clamp(0.85rem,2.1vmin,1.15rem)] font-bold leading-tight text-ink">{c.name}</span>
              {on && <ProgressBar percent={pr.percent} className="h-2.5" />}
            </>
          );
          const cls = cn(
            "chunky absolute flex w-[clamp(7rem,17vw,11rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-3xl border-4 bg-card/95 p-2 text-center",
            c.border,
            !on && "opacity-60 grayscale",
          );
          return on ? (
            <Link key={c.id} to="/collection/$id" params={{ id: c.id }} onClick={() => sfx.whoosh()} className={cls} style={{ left: `${c.map.x}%`, top: `${c.map.y}%` }}>
              {inner}
            </Link>
          ) : (
            <div key={c.id} className={cls} style={{ left: `${c.map.x}%`, top: `${c.map.y}%` }}>
              {inner}
            </div>
          );
        })}
      </section>

      {/* Phone/portrait: winding list of big world cards */}
      <section className="flex flex-col gap-4 landscape:hidden">
        {COLLECTIONS.map((c, i) => {
          const on = player.collections.includes(c.id);
          const pr = collectionProgress(player, c.id);
          return (
            <Link
              key={c.id}
              to="/collection/$id"
              params={{ id: c.id }}
              disabled={!on}
              className={cn(
                "chunky flex items-center gap-3 overflow-hidden rounded-[2rem] border-4 bg-card",
                c.border,
                i % 2 ? "ml-6" : "mr-6",
                !on && "opacity-50 grayscale",
              )}
            >
              <img src={c.image} alt="" className="h-24 w-28 shrink-0 object-cover" loading="lazy" width={1280} height={832} />
              <div className="flex min-w-0 flex-1 flex-col gap-1 py-2 pr-3">
                <span className="font-display text-xl font-bold leading-tight text-ink">{c.name}</span>
                {on ? <ProgressBar percent={pr.percent} className="h-3" /> : <Lock className="size-6" />}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
