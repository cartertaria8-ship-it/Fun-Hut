import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, Star } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/fun/Avatar";
import { ChildShell } from "@/components/fun/ChildShell";
import { BigButton } from "@/components/fun/ui";
import { GenderPick } from "./setup";
import { CATEGORIES, HAIR_COLOURS, ITEMS, SKIN_TONES, type ItemCategory } from "@/lib/avatar-items";
import { canAfford } from "@/lib/rules";
import { actions, type Player } from "@/lib/store";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/avatar")({
  head: () => ({
    meta: [
      { title: "My Avatar — Fun Hut" },
      { name: "description", content: "Dress up your Fun Hut character with hats, clothes and more." },
      { property: "og:title", content: "My Avatar — Fun Hut" },
      { property: "og:description", content: "Dress up your Fun Hut character." },
    ],
  }),
  component: () => <ChildShell>{(p) => <AvatarPage player={p} />}</ChildShell>,
});

function AvatarPage({ player }: { player: Player }) {
  const [cat, setCat] = useState<ItemCategory>("hat");
  const [preview, setPreview] = useState<string | null>(null);
  const items = ITEMS.filter((i) => i.category === cat);
  const previewItem = ITEMS.find((i) => i.id === preview);
  const look = previewItem ? { ...player.avatar, [cat]: previewItem.id } : player.avatar;
  const owned = previewItem ? player.owned.includes(previewItem.id) : false;
  const wearing = previewItem ? player.avatar[cat] === previewItem.id : false;

  return (
    <div className="flex min-h-full flex-col gap-4 landscape:flex-row">
      <section className="flex shrink-0 flex-col items-center justify-center gap-3 landscape:w-[38%]">
        <div className="tile p-4">
          <Avatar look={look} className="h-[clamp(11rem,40vmin,22rem)] w-auto" />
        </div>
        {previewItem && !wearing && (
          owned ? (
            <BigButton
              variant="go"
              onClick={() => {
                sfx.correct();
                actions.wear(cat, previewItem.id);
              }}
            >
              <Check className="size-6" /> Wear it!
            </BigButton>
          ) : canAfford(player.stars, previewItem.cost) ? (
            <BigButton
              onClick={() => {
                if (actions.buyItem(previewItem.id)) {
                  sfx.unlock();
                  actions.wear(cat, previewItem.id);
                }
              }}
            >
              Unlock for {previewItem.cost} <Star className="size-6 fill-current" />
            </BigButton>
          ) : (
            <p className="rounded-full bg-card px-5 py-3 font-display text-lg font-bold text-ink">
              Need {previewItem.cost - player.stars} more ⭐ — keep playing!
            </p>
          )
        )}
        {cat === "hair" && (
          <div className="flex flex-col items-center gap-2">
            <GenderPick look={player.avatar} onChange={(l) => actions.setLook({ gender: l.gender, hair: l.hair })} />
            <div className="flex flex-wrap justify-center gap-2">
              {SKIN_TONES.map((c, i) => (
                <button key={c} type="button" aria-label="Skin tone" onClick={() => actions.setLook({ skin: i })} className={cn("chunky size-12 rounded-full border-4 border-paper", player.avatar.skin === i && "ring-4 ring-primary")} style={{ background: c }} />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {HAIR_COLOURS.map((c, i) => (
                <button key={c} type="button" aria-label="Hair colour" onClick={() => actions.setLook({ hairColor: i })} className={cn("chunky size-12 rounded-full border-4 border-paper", player.avatar.hairColor === i && "ring-4 ring-primary")} style={{ background: c }} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                sfx.pop();
                setCat(c.id);
                setPreview(null);
              }}
              className={cn("chunky flex min-h-16 shrink-0 items-center gap-2 rounded-3xl px-4 font-display text-lg font-bold", cat === c.id ? "bg-primary text-primary-foreground" : "bg-card text-ink")}
            >
              <span className="text-2xl">{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((i) => {
            const has = player.owned.includes(i.id);
            const on = player.avatar[cat] === i.id;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => {
                  sfx.pop();
                  setPreview(i.id);
                }}
                className={cn("tile relative aspect-square p-2", preview === i.id && "border-primary", on && "tile-correct")}
              >
                <ItemPreview value={i.value} cat={cat} />
                <span className="font-display text-base font-bold text-ink">{i.name}</span>
                {!has && (
                  <span className="absolute top-1 right-1 flex items-center gap-0.5 rounded-full bg-star px-2 py-0.5 font-display text-sm font-bold text-ink">
                    <Lock className="size-3" /> {i.cost}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ItemPreview({ value, cat }: { value: string; cat: ItemCategory }) {
  if (cat === "hat") return <span className="text-5xl">{value || "🚫"}</span>;
  if (cat === "glasses") return <span className="text-5xl">{value === "round" ? "👓" : value === "star" ? "🌟" : "🚫"}</span>;
  if (cat === "hair") return <span className="text-5xl">💇</span>;
  if (!value) return <span className="text-5xl">🚫</span>;
  return <span className="size-14 rounded-2xl border-4 border-paper" style={{ background: value }} />;
}
