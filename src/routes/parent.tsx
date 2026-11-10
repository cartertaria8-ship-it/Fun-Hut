import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Play, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/fun/Avatar";
import { COLLECTIONS, getActivity } from "@/lib/content";
import { actions, collectionProgress, useGame, useHydrated, type Player } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent area — Fun Hut" },
      { name: "description", content: "Manage child profiles, see learning progress and back up Fun Hut data on this device." },
      { property: "og:title", content: "Parent area — Fun Hut" },
      { property: "og:description", content: "Profiles, progress and settings for grown-ups." },
    ],
  }),
  component: ParentPage,
});

function ParentPage() {
  const [ok, setOk] = useState(false);
  const hydrated = useHydrated();
  if (!hydrated) return <div className="fixed inset-0 bg-background" />;
  return ok ? <Dashboard /> : <Gate onPass={() => setOk(true)} />;
}

function Gate({ onPass }: { onPass: () => void }) {
  const q = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 6);
    const b = 3 + Math.floor(Math.random() * 6);
    const ans = a * b;
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(ans + (Math.floor(Math.random() * 9) - 4) * (1 + Math.floor(Math.random() * 3)));
    return { a, b, ans, opts: [...opts].filter((x) => x > 0).sort(() => Math.random() - 0.5) };
  }, []);
  const [err, setErr] = useState(false);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-card px-safe pt-safe pb-safe text-center">
      <Link to="/" className="absolute top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] flex min-h-12 items-center gap-2 rounded-2xl border px-4 font-semibold text-foreground">
        <ArrowLeft className="size-5" /> Back
      </Link>
      <h1 className="text-3xl font-bold text-foreground">Grown-ups only</h1>
      <p className="max-w-md text-muted-foreground">To continue, please answer: what is {q.a} × {q.b}?</p>
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => (o === q.ans ? onPass() : setErr(true))}
            className="min-h-16 min-w-28 rounded-2xl border-2 bg-background text-2xl font-bold text-foreground"
          >
            {o}
          </button>
        ))}
      </div>
      {err && <p className="text-destructive">That's not right — please try again.</p>}
    </div>
  );
}

const TABS = ["Overview", "Profiles", "Progress", "Settings"] as const;

function Dashboard() {
  const state = useGame();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const totalActs = state.players.reduce((s, p) => s + Object.values(p.progress).reduce((x, a) => x + a.plays, 0), 0);
  const totalStars = state.players.reduce((s, p) => s + Object.values(p.progress).reduce((x, a) => x + a.best, 0), 0);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-paper px-safe pt-safe pb-safe text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex items-center gap-3">
          <Link to="/" className="flex min-h-12 items-center gap-2 rounded-2xl border px-4 font-semibold">
            <ArrowLeft className="size-5" /> Exit
          </Link>
          <h1 className="text-2xl font-bold">Parent area</h1>
        </header>
        <nav className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn("min-h-12 shrink-0 rounded-2xl px-5 font-semibold", tab === t ? "bg-foreground text-paper" : "bg-muted")}>
              {t}
            </button>
          ))}
        </nav>

        {tab === "Overview" && (
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Child profiles" value={state.players.length} />
              <Stat label="Activities played" value={totalActs} />
              <Stat label="Best stars earned" value={totalStars} />
            </div>
            <Card title="Recently played">
              {state.players.flatMap((p) => Object.entries(p.progress).map(([id, a]) => ({ p, id, a }))).sort((x, y) => y.a.last - x.a.last).slice(0, 8).map(({ p, id, a }) => (
                <div key={p.id + id} className="flex items-center justify-between border-b py-2 last:border-0">
                  <span>
                    <b>{p.nickname}</b> — {getActivity(id)?.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{new Date(a.last).toLocaleDateString()}</span>
                </div>
              ))}
              {totalActs === 0 && <p className="text-muted-foreground">Nothing played yet.</p>}
            </Card>
            <p className="text-sm text-muted-foreground">
              Fun Hut keeps all profiles and progress on this device only. No account, email or internet connection is needed to play.
            </p>
          </div>
        )}

        {tab === "Profiles" && <Profiles players={state.players} />}
        {tab === "Progress" && (
          <div className="grid gap-4">
            {state.players.map((p) => <ProgressCard key={p.id} player={p} />)}
            {state.players.length === 0 && <p className="text-muted-foreground">No profiles yet.</p>}
          </div>
        )}
        {tab === "Settings" && <SettingsTab />}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-background/50 p-4">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Profiles({ players }: { players: Player[] }) {
  const navigate = useNavigate();
  return (
    <div className="grid gap-4">
      <Link to="/setup" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-foreground font-semibold text-paper">
        <Plus className="size-5" /> Add player
      </Link>
      {players.map((p) => (
        <Card key={p.id} title="">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar look={p.avatar} className="h-20 w-auto" />
            <div className="flex min-w-48 flex-1 flex-col gap-2">
              <input
                defaultValue={p.nickname}
                maxLength={16}
                aria-label="Nickname"
                onBlur={(e) => e.target.value.trim() && actions.editPlayer(p.id, { nickname: e.target.value.trim() })}
                className="min-h-12 rounded-xl border bg-background px-3 text-lg font-semibold"
              />
              <div className="flex gap-2">
                {(["4-5", "6-8"] as const).map((a) => (
                  <button key={a} type="button" onClick={() => actions.editPlayer(p.id, { ageGroup: a })} className={cn("min-h-11 rounded-xl px-4 font-semibold", p.ageGroup === a ? "bg-foreground text-paper" : "bg-muted")}>
                    {a} years
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                actions.selectPlayer(p.id);
                void navigate({ to: "/home" });
              }}
              className="flex min-h-12 items-center gap-2 rounded-xl bg-success px-4 font-semibold text-paper"
            >
              <Play className="size-5" /> Play as {p.nickname}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {COLLECTIONS.map((c) => {
              const on = p.collections.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => actions.editPlayer(p.id, { collections: on ? p.collections.filter((x) => x !== c.id) : [...p.collections, c.id] })}
                  className={cn("min-h-11 rounded-xl border-2 px-3 text-sm font-semibold", on ? c.border : "border-muted text-muted-foreground line-through")}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => confirm(`Reset all progress for ${p.nickname}?`) && actions.resetProgress(p.id)} className="flex min-h-11 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-semibold">
              <RotateCcw className="size-4" /> Reset progress
            </button>
            <button type="button" onClick={() => confirm(`Delete ${p.nickname}'s profile?`) && actions.deletePlayer(p.id)} className="flex min-h-11 items-center gap-2 rounded-xl bg-destructive/10 px-4 text-sm font-semibold text-destructive">
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProgressCard({ player }: { player: Player }) {
  const rows = COLLECTIONS.map((c) => ({ c, pr: collectionProgress(player, c.id) }));
  const strong = rows.filter((r) => r.pr.done > 0).sort((a, b) => b.pr.stars / b.pr.maxStars - a.pr.stars / a.pr.maxStars)[0];
  const unexplored = COLLECTIONS.flatMap((c) => c.activities.filter((a) => a.playable && !player.progress[a.id]));
  return (
    <Card title={player.nickname}>
      <div className="grid gap-2">
        {rows.map(({ c, pr }) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="w-48 shrink-0 text-sm font-semibold">{c.name}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full", c.bg)} style={{ width: `${pr.percent}%` }} />
            </div>
            <span className="w-12 text-right text-sm">{pr.percent}%</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-1 text-sm">
        {strong && <p>⭐ Doing well in <b>{strong.c.name}</b>.</p>}
        {unexplored.length > 0 && <p className="text-muted-foreground">Not tried yet: {unexplored.map((a) => a.name).join(", ")}.</p>}
      </div>
    </Card>
  );
}

function SettingsTab() {
  const { settings } = useGame();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const exportData = () => {
    const blob = new Blob([actions.exportBackup()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fun-hut-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="grid gap-4">
      <Card title="Sound">
        {(["sound", "music", "calm"] as const).map((k) => (
          <label key={k} className="flex min-h-12 items-center justify-between border-b last:border-0">
            <span>{k === "sound" ? "Sound effects" : k === "music" ? "Background music" : "Calm motion (fewer animations)"}</span>
            <input type="checkbox" className="size-6" checked={settings[k]} onChange={(e) => actions.setSettings({ [k]: e.target.checked })} />
          </label>
        ))}
      </Card>
      <Card title="Backup">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportData} className="flex min-h-12 items-center gap-2 rounded-xl bg-foreground px-4 font-semibold text-paper">
            <Download className="size-5" /> Download backup
          </button>
          <button type="button" onClick={() => file.current?.click()} className="flex min-h-12 items-center gap-2 rounded-xl bg-muted px-4 font-semibold">
            <Upload className="size-5" /> Restore backup
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                actions.importBackup(await f.text());
                setMsg("Backup restored.");
              } catch (err) {
                setMsg((err as Error).message);
              }
            }}
          />
        </div>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </Card>
    </div>
  );
}
