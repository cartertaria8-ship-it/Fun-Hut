import { Link, useNavigate } from "@tanstack/react-router";
import { Award, Home, Map, Settings, Shirt } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrentPlayer, useHydrated, type Player } from "@/lib/store";
import { sfx } from "@/lib/audio";
import { Avatar } from "./Avatar";
import { SettingsDialog } from "./SettingsDialog";
import { StarPill } from "./ui";

const NAV = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/collections", label: "Worlds", Icon: Map },
  { to: "/rewards", label: "Rewards", Icon: Award },
  { to: "/avatar", label: "Me", Icon: Shirt },
] as const;

/** Redirects to the welcome screen when no player is chosen. */
export function useRequirePlayer() {
  const hydrated = useHydrated();
  const player = useCurrentPlayer();
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !player) void navigate({ to: "/" });
  }, [hydrated, player, navigate]);
  return hydrated ? player : null;
}

export function ChildShell({ children }: { children: (player: Player) => React.ReactNode }) {
  const player = useRequirePlayer();
  const [settings, setSettings] = useState(false);
  if (!player) return <div className="fixed inset-0 bg-sky-gradient" />;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-sky-gradient landscape:flex-row">
      <nav
        aria-label="Main"
        className="order-last flex shrink-0 justify-around gap-1 border-t-4 border-paper bg-card/90 px-safe pb-safe pt-2 backdrop-blur landscape:order-first landscape:flex-col landscape:justify-center landscape:border-r-4 landscape:border-t-0 landscape:pl-safe landscape:pr-2 landscape:pt-safe"
      >
        {NAV.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => sfx.pop()}
            className="group flex min-h-16 min-w-16 flex-col items-center justify-center gap-0.5 rounded-3xl px-3 font-display text-sm font-bold text-muted-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
          >
            <Icon className="size-8" strokeWidth={2.5} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 px-safe pt-safe pb-2">
          <Link to="/" aria-label="Change player" className="chunky flex h-14 items-center gap-2 rounded-full bg-card pl-1 pr-4">
            <span className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-muted">
              <Avatar look={player.avatar} className="mt-3 size-14" />
            </span>
            <span className="max-w-[30vw] truncate font-display text-xl font-bold text-ink">{player.nickname}</span>
          </Link>
          <div className="flex-1" />
          <StarPill count={player.stars} />
          <button
            type="button"
            aria-label="Settings"
            onClick={() => {
              sfx.pop();
              setSettings(true);
            }}
            className="chunky flex size-14 items-center justify-center rounded-full bg-card text-ink"
          >
            <Settings className="size-7" />
          </button>
        </header>
        <main className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-safe pb-4")}>{children(player)}</main>
      </div>
      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
