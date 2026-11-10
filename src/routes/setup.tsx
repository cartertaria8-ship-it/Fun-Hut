import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/fun/Avatar";
import { BigButton, Funny } from "@/components/fun/ui";
import { HAIR_COLOURS, ITEMS, SKIN_TONES } from "@/lib/avatar-items";
import { COLLECTIONS, type CollectionId } from "@/lib/content";
import { actions, DEFAULT_AVATAR, type AgeGroup, type AvatarLook } from "@/lib/store";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Create a player — Fun Hut" },
      { name: "description", content: "Pick a nickname, age group and avatar to start your Fun Hut adventure." },
      { property: "og:title", content: "Create a player — Fun Hut" },
      { property: "og:description", content: "Pick a nickname, age group and avatar." },
    ],
  }),
  component: Setup,
});

const SUGGEST = ["Star", "Tiger", "Sunny", "Bubbles", "Rocket", "Pebble"];

function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [look, setLook] = useState<AvatarLook>(DEFAULT_AVATAR);
  const [cols, setCols] = useState<CollectionId[]>(COLLECTIONS.map((c) => c.id));

  const canNext = [nickname.trim().length > 0, !!age, true, cols.length > 0][step] ?? true;
  const next = () => {
    sfx.pop();
    if (step === 3) {
      actions.createPlayer({ nickname: nickname.trim().slice(0, 16), ageGroup: age!, avatar: look, collections: cols });
      sfx.celebrate();
    }
    setStep((s) => s + 1);
  };

  const hairs = ITEMS.filter((i) => i.category === "hair" && i.cost === 0);
  const outfits = ITEMS.filter((i) => i.category === "outfit" && i.cost === 0);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-sky-gradient px-safe pt-safe pb-safe">
      <div className="flex items-center gap-3">
        <BigButton
          variant="soft"
          size="icon"
          aria-label="Back"
          onClick={() => (step === 0 || step === 4 ? navigate({ to: "/" }) : setStep((s) => s - 1))}
        >
          <ArrowLeft className="size-7" />
        </BigButton>
        <div className="flex flex-1 justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("h-4 w-10 rounded-full", i <= step ? "bg-primary" : "bg-paper/70")} />
          ))}
        </div>
        <div className="size-14" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto py-4 landscape:flex-row">
        {step === 0 && (
          <div className="animate-float-in flex w-full max-w-xl flex-col items-center gap-5 text-center">
            <Funny className="h-[22vmin] w-auto" />
            <h1 className="text-[clamp(2rem,6vmin,3rem)] font-bold text-ink">What's your nickname?</h1>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={16}
              placeholder="Type a fun name"
              aria-label="Nickname"
              className="h-20 w-full rounded-[2rem] border-4 border-paper bg-card px-6 text-center font-display text-3xl font-bold text-ink shadow-[var(--shadow-chunky)] outline-none focus:border-primary"
            />
            <div className="flex flex-wrap justify-center gap-3">
              {SUGGEST.map((s) => (
                <button key={s} type="button" onClick={() => setNickname(s)} className="chunky min-h-14 rounded-full bg-card px-5 font-display text-xl font-bold text-ink">
                  {s}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">No real names needed — just something fun!</p>
          </div>
        )}

        {step === 1 && (
          <div className="animate-float-in flex flex-col items-center gap-6 text-center">
            <h1 className="text-[clamp(2rem,6vmin,3rem)] font-bold text-ink">How old are you?</h1>
            <div className="flex flex-wrap justify-center gap-6">
              {(["4-5", "6-8"] as AgeGroup[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    sfx.pop();
                    setAge(a);
                  }}
                  className={cn(
                    "tile size-[clamp(10rem,32vmin,16rem)]",
                    age === a && "tile-correct animate-pop",
                  )}
                >
                  <span className="text-[clamp(3rem,10vmin,5rem)]">{a === "4-5" ? "🐣" : "🦁"}</span>
                  <span className="font-display text-[clamp(1.8rem,6vmin,3rem)] font-bold text-ink">{a.replace("-", "–")}</span>
                  <span className="font-display text-lg text-muted-foreground">years</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="tile animate-float-in shrink-0 p-4">
              <Avatar look={look} className="h-[clamp(10rem,36vmin,20rem)] w-auto" />
            </div>
            <div className="flex w-full max-w-xl flex-col gap-4">
              <h1 className="text-center text-[clamp(1.6rem,5vmin,2.5rem)] font-bold text-ink">Make your character!</h1>
              <GenderPick look={look} onChange={setLook} />
              <Row label="Skin">
                {SKIN_TONES.map((c, i) => (
                  <Swatch key={c} color={c} active={look.skin === i} onClick={() => setLook({ ...look, skin: i })} />
                ))}
              </Row>
              <Row label="Hair">
                {hairs.map((h) => (
                  <button key={h.id} type="button" onClick={() => setLook({ ...look, hair: h.id })} className={cn("chunky min-h-14 rounded-2xl bg-card px-4 font-display text-lg font-bold text-ink", look.hair === h.id && "ring-4 ring-primary")}>
                    {h.name}
                  </button>
                ))}
              </Row>
              <Row label="Hair colour">
                {HAIR_COLOURS.map((c, i) => (
                  <Swatch key={c} color={c} active={look.hairColor === i} onClick={() => setLook({ ...look, hairColor: i })} />
                ))}
              </Row>
              <Row label="Clothes">
                {outfits.map((o) => (
                  <Swatch key={o.id} color={o.value} active={look.outfit === o.id} onClick={() => setLook({ ...look, outfit: o.id })} />
                ))}
              </Row>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="animate-float-in flex w-full max-w-3xl flex-col items-center gap-5 text-center">
            <h1 className="text-[clamp(1.6rem,5vmin,2.5rem)] font-bold text-ink">Which worlds can we visit?</h1>
            <p className="text-muted-foreground">For grown-ups: all worlds are on. Tap to turn one off.</p>
            <div className="grid w-full grid-cols-2 gap-4 landscape:grid-cols-3">
              {COLLECTIONS.map((c) => {
                const on = cols.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCols(on ? cols.filter((x) => x !== c.id) : [...cols, c.id])}
                    className={cn("chunky relative overflow-hidden rounded-3xl border-4 bg-card text-left", on ? c.border : "border-paper opacity-50")}
                  >
                    <img src={c.image} alt="" className="h-24 w-full object-cover" loading="lazy" width={1280} height={832} />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="font-display text-lg font-bold leading-tight text-ink">{c.name}</span>
                      {on && <Check className="size-7 shrink-0 text-success" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-float-in flex flex-col items-center gap-6 text-center landscape:flex-row">
            <Funny className="h-[clamp(9rem,34vmin,18rem)] w-auto" />
            <div className="flex flex-col items-center gap-6">
              <h1 className="max-w-lg text-[clamp(2rem,7vmin,3.5rem)] font-bold leading-tight text-ink">Your Fun Hut adventure is ready!</h1>
              <BigButton size="xl" onClick={() => navigate({ to: "/home" })}>
                Let's Play!
              </BigButton>
            </div>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="flex justify-center">
          <BigButton size="xl" disabled={!canNext} onClick={next}>
            {step === 3 ? "Save" : "Next"} <ArrowRight className="size-8" />
          </BigButton>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-lg font-bold text-ink">{label}</span>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Choose colour"
      onClick={() => {
        sfx.pop();
        onClick();
      }}
      className={cn("chunky size-14 rounded-full border-4 border-paper", active && "ring-4 ring-primary")}
      style={{ background: color }}
    />
  );
}

export function GenderPick({ look, onChange }: { look: AvatarLook; onChange: (l: AvatarLook) => void }) {
  return (
    <div className="flex justify-center gap-4">
      {(
        [
          { g: "boy", label: "Boy", emoji: "👦", hair: "hair-short", outfit: "outfit-blue" },
          { g: "girl", label: "Girl", emoji: "👧", hair: "hair-long", outfit: "outfit-orange" },
        ] as const
      ).map((o) => (
        <button
          key={o.g}
          type="button"
          onClick={() => {
            sfx.pop();
            if ((look.gender ?? "boy") !== o.g) onChange({ ...look, gender: o.g, hair: o.hair, outfit: look.outfit });
          }}
          className={cn("tile min-h-20 min-w-32 flex-row gap-2 px-5", (look.gender ?? "boy") === o.g && "tile-correct")}
        >
          <span className="text-4xl">{o.emoji}</span>
          <span className="font-display text-2xl font-bold text-ink">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
