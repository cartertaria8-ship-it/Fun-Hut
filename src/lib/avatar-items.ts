export type ItemCategory = "hair" | "outfit" | "shoes" | "hat" | "glasses" | "backpack";

export interface AvatarItem {
  id: string;
  category: ItemCategory;
  name: string;
  cost: number;
  /** Colour for clothing/hair-colour items, emoji for hats/glasses, style key for hair. */
  value: string;
}

export const SKIN_TONES = [
  "oklch(0.92 0.04 70)",
  "oklch(0.84 0.07 60)",
  "oklch(0.74 0.09 55)",
  "oklch(0.62 0.1 50)",
  "oklch(0.5 0.09 45)",
  "oklch(0.4 0.07 40)",
];

export const HAIR_COLOURS = [
  "oklch(0.3 0.04 50)",
  "oklch(0.5 0.1 55)",
  "oklch(0.8 0.12 85)",
  "oklch(0.55 0.17 35)",
  "oklch(0.2 0.02 260)",
  "oklch(0.65 0.18 350)",
];

export const ITEMS: AvatarItem[] = [
  { id: "hair-short", category: "hair", name: "Short", cost: 0, value: "short" },
  { id: "hair-curly", category: "hair", name: "Curly", cost: 0, value: "curly" },
  { id: "hair-long", category: "hair", name: "Long", cost: 0, value: "long" },
  { id: "hair-puffs", category: "hair", name: "Puffs", cost: 0, value: "puffs" },
  { id: "hair-spiky", category: "hair", name: "Spiky", cost: 4, value: "spiky" },

  { id: "outfit-orange", category: "outfit", name: "Sunny", cost: 0, value: "oklch(0.74 0.18 55)" },
  { id: "outfit-green", category: "outfit", name: "Leafy", cost: 0, value: "oklch(0.7 0.17 150)" },
  { id: "outfit-blue", category: "outfit", name: "Ocean", cost: 0, value: "oklch(0.62 0.15 245)" },
  { id: "outfit-pink", category: "outfit", name: "Berry", cost: 5, value: "oklch(0.7 0.18 355)" },
  { id: "outfit-purple", category: "outfit", name: "Grape", cost: 5, value: "oklch(0.58 0.17 300)" },
  { id: "outfit-gold", category: "outfit", name: "Golden", cost: 12, value: "oklch(0.84 0.16 88)" },

  { id: "shoes-red", category: "shoes", name: "Red", cost: 0, value: "oklch(0.6 0.2 27)" },
  { id: "shoes-blue", category: "shoes", name: "Blue", cost: 3, value: "oklch(0.55 0.16 250)" },
  { id: "shoes-yellow", category: "shoes", name: "Yellow", cost: 3, value: "oklch(0.86 0.16 92)" },
  { id: "shoes-rainbow", category: "shoes", name: "Sparkle", cost: 8, value: "oklch(0.7 0.18 330)" },

  { id: "hat-none", category: "hat", name: "No hat", cost: 0, value: "" },
  { id: "hat-cap", category: "hat", name: "Cap", cost: 5, value: "🧢" },
  { id: "hat-bow", category: "hat", name: "Bow", cost: 5, value: "🎀" },
  { id: "hat-top", category: "hat", name: "Top hat", cost: 10, value: "🎩" },
  { id: "hat-crown", category: "hat", name: "Crown", cost: 20, value: "👑" },

  { id: "glasses-none", category: "glasses", name: "None", cost: 0, value: "" },
  { id: "glasses-round", category: "glasses", name: "Round", cost: 5, value: "round" },
  { id: "glasses-star", category: "glasses", name: "Star", cost: 10, value: "star" },

  { id: "backpack-none", category: "backpack", name: "None", cost: 0, value: "" },
  { id: "backpack-teal", category: "backpack", name: "Teal", cost: 4, value: "oklch(0.66 0.13 200)" },
  { id: "backpack-red", category: "backpack", name: "Red", cost: 4, value: "oklch(0.62 0.2 27)" },
  { id: "backpack-gold", category: "backpack", name: "Gold", cost: 10, value: "oklch(0.84 0.16 88)" },
];

export const CATEGORIES: { id: ItemCategory; label: string; emoji: string }[] = [
  { id: "hair", label: "Hair", emoji: "💇" },
  { id: "outfit", label: "Clothes", emoji: "👕" },
  { id: "shoes", label: "Shoes", emoji: "👟" },
  { id: "hat", label: "Hats", emoji: "🎩" },
  { id: "glasses", label: "Glasses", emoji: "👓" },
  { id: "backpack", label: "Backpacks", emoji: "🎒" },
];

export const FREE_ITEM_IDS = ITEMS.filter((i) => i.cost === 0).map((i) => i.id);

export function itemById(id: string) {
  return ITEMS.find((i) => i.id === id);
}
