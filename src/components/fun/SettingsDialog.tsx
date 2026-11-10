import { Download, Maximize, Music, Sparkles, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { actions, useGame } from "@/lib/store";
import { sfx } from "@/lib/audio";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "chunky flex min-h-20 items-center gap-4 rounded-3xl px-5 text-left font-display text-xl font-bold",
        on ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-paper/30">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-base">{on ? "ON" : "OFF"}</span>
    </button>
  );
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useGame();
  const [full, setFull] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const h = () => setFull(!!document.fullscreenElement);
    h();
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    setIsInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const installed = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!open) return null;
  const canFull = typeof document !== "undefined" && !!document.documentElement.requestFullscreen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 pt-safe pb-safe" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Settings"
        className="animate-float-in max-h-full w-full max-w-md overflow-y-auto rounded-[2.5rem] bg-card p-6 shadow-[var(--shadow-chunky)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-ink">Settings</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="chunky flex size-14 items-center justify-center rounded-2xl bg-muted">
            <X className="size-7" />
          </button>
        </div>
        <div className="grid gap-4">
          {!isInstalled && (
            <button
              type="button"
              onClick={async () => {
                if (!installPrompt) {
                  setInstallHelp(true);
                  return;
                }
                await installPrompt.prompt();
                await installPrompt.userChoice;
                setInstallPrompt(null);
              }}
              className="chunky flex min-h-16 items-center justify-center gap-3 rounded-3xl bg-primary px-5 font-display text-xl font-bold text-primary-foreground"
            >
              <Download className="size-6" /> Install for offline play
            </button>
          )}
          {installHelp && (
            <div className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-ink">
              <p className="flex-1 font-semibold">
                Open your browser menu and choose Install app or Add to Home Screen. Open Fun Hut online once so it can save the game for offline play.
              </p>
              <button type="button" aria-label="Close install instructions" onClick={() => setInstallHelp(false)} className="chunky flex size-10 shrink-0 items-center justify-center rounded-xl bg-card">
                <X className="size-5" />
              </button>
            </div>
          )}
          <Toggle
            on={settings.sound}
            icon={<Volume2 className="size-7" />}
            label="Sounds"
            onClick={() => {
              actions.setSettings({ sound: !settings.sound });
              sfx.pop();
            }}
          />
          <Toggle on={settings.music} icon={<Music className="size-7" />} label="Music" onClick={() => actions.setSettings({ music: !settings.music })} />
          <Toggle on={settings.calm} icon={<Sparkles className="size-7" />} label="Calm motion" onClick={() => actions.setSettings({ calm: !settings.calm })} />
          {canFull && (
            <Toggle
              on={full}
              icon={<Maximize className="size-7" />}
              label="Full screen"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void document.documentElement.requestFullscreen().catch(() => {});
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
