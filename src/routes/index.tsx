import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Plus, Settings } from "lucide-react";
import { useState } from "react";
import mapImg from "@/assets/map.jpg";
import { Avatar } from "@/components/fun/Avatar";
import { SettingsDialog } from "@/components/fun/SettingsDialog";
import { BigButton, Funny } from "@/components/fun/ui";
import { actions, useGame, useHydrated } from "@/lib/store";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fun Hut — a little world full of fun" },
      { name: "description", content: "Learning adventure games for children aged 4–8: letters, numbers, colours, animals, puzzles and drawing." },
      { property: "og:title", content: "Fun Hut — a little world full of fun" },
      { property: "og:description", content: "Learning adventure games for children aged 4–8." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { players } = useGame();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(false);

  const start = () => {
    sfx.pop();
    if (players.length === 0) void navigate({ to: "/setup" });
    else if (players.length === 1) {
      actions.selectPlayer(players[0]!.id);
      void navigate({ to: "/home" });
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden isolate">
      <img src={mapImg} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" width={1920} height={1088} />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-sky/40 via-transparent to-ink/30" />

      <div className="relative z-20 flex h-full flex-col px-safe pt-safe pb-safe">
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setSettings(true)}
            className="chunky flex size-14 items-center justify-center rounded-full bg-card text-ink shadow-[0_12px_0_rgba(37,52,78,0.12)]"
          >
            <Settings className="size-7" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-6">
          <div className="relative flex w-full max-w-[1500px] flex-col items-center justify-center gap-[2vmin] landscape:flex-row landscape:items-end landscape:justify-center landscape:gap-[3vw]">
            <Funny className="z-20 h-[clamp(8rem,32vmin,22rem)] w-auto self-end" />

            <div className="z-20 flex flex-col items-center gap-[2.5vmin] text-center">
              <h1 className="font-display text-[clamp(3.5rem,12vmin,8rem)] font-bold leading-none text-paper [text-shadow:0_6px_0_var(--primary),0_12px_24px_oklch(0.2_0.05_250/0.4)]">
                Fun Hut
              </h1>
              <p className="rounded-full bg-card/90 px-5 py-2 font-display text-[clamp(1.1rem,3.2vmin,1.75rem)] font-semibold text-ink">
                A little world full of fun!
              </p>

              {hydrated && players.length > 1 ? (
                <div className="flex max-w-[90vw] flex-wrap justify-center gap-3">
                  {players.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        sfx.pop();
                        actions.selectPlayer(p.id);
                        void navigate({ to: "/home" });
                      }}
                      className="chunky flex w-32 flex-col items-center rounded-[2rem] bg-card p-2 pb-3"
                    >
                      <Avatar look={p.avatar} className="h-24 w-auto" />
                      <span className="w-full truncate font-display text-lg font-bold text-ink">{p.nickname}</span>
                    </button>
                  ))}
                  <Link to="/setup" aria-label="Add player" className="chunky flex w-32 flex-col items-center justify-center rounded-[2rem] bg-card/70 p-2 text-ink">
                    <Plus className="size-12" />
                    <span className="font-display text-lg font-bold">New</span>
                  </Link>
                </div>
              ) : (
                <BigButton size="xl" onClick={start} className="animate-float-in">
                  {hydrated && players.length === 1 ? `Play, ${players[0]!.nickname}!` : "Start Playing"}
                </BigButton>
              )}

              <Link to="/parent" className="chunky inline-flex min-h-12 items-center gap-2 rounded-full bg-card/80 px-5 font-display font-bold text-ink">
                <Lock className="size-5" /> Parent / Guardian
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
