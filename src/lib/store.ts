import { useSyncExternalStore } from "react";
import { COLLECTIONS, type CollectionId } from "./content";
import { FREE_ITEM_IDS, itemById, type ItemCategory } from "./avatar-items";
import { canAfford } from "./rules";

export type AgeGroup = "4-5" | "6-8";

export type Gender = "boy" | "girl";

export interface AvatarLook {
  gender?: Gender;
  skin: number;
  hairColor: number;
  hair: string;
  outfit: string;
  shoes: string;
  hat: string;
  glasses: string;
  backpack: string;
}

export interface ActivityProgress {
  best: number;
  plays: number;
  last: number;
}

export const STARS_TO_UNLOCK_NEXT_ACTIVITY = 2;

export interface Player {
  id: string;
  nickname: string;
  ageGroup: AgeGroup;
  avatar: AvatarLook;
  collections: CollectionId[];
  progress: Record<string, ActivityProgress>;
  stars: number;
  owned: string[];
  createdAt: number;
}

export interface Settings {
  sound: boolean;
  music: boolean;
  calm: boolean;
}

export interface GameState {
  players: Player[];
  currentId: string | null;
  settings: Settings;
}

const KEY = "funhut:v1";
const DEFAULT: GameState = {
  players: [],
  currentId: null,
  settings: { sound: true, music: false, calm: false },
};

export const DEFAULT_AVATAR: AvatarLook = {
  gender: "boy",
  skin: 1,
  hairColor: 0,
  hair: "hair-short",
  outfit: "outfit-orange",
  shoes: "shoes-red",
  hat: "hat-none",
  glasses: "glasses-none",
  backpack: "backpack-none",
};

let state: GameState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      state = { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } };
    }
  } catch {
    state = DEFAULT;
  }
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}
function getSnapshot() {
  load();
  return state;
}
const getServerSnapshot = () => DEFAULT;

function commit(next: GameState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep playing in memory */
  }
  listeners.forEach((l) => l());
}

export function useGame() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function useCurrentPlayer(): Player | null {
  const s = useGame();
  return s.players.find((p) => p.id === s.currentId) ?? null;
}

function updatePlayer(id: string, fn: (p: Player) => Player) {
  commit({ ...state, players: state.players.map((p) => (p.id === id ? fn(p) : p)) });
}

export const actions = {
  createPlayer(input: { nickname: string; ageGroup: AgeGroup; avatar: AvatarLook; collections: CollectionId[] }) {
    const id = Math.random().toString(36).slice(2, 10);
    const player: Player = {
      id,
      ...input,
      progress: {},
      stars: 0,
      owned: [...FREE_ITEM_IDS],
      createdAt: Date.now(),
    };
    commit({ ...state, players: [...state.players, player], currentId: id });
    return player;
  },
  selectPlayer(id: string | null) {
    commit({ ...state, currentId: id });
  },
  editPlayer(id: string, patch: Partial<Pick<Player, "nickname" | "ageGroup" | "collections">>) {
    updatePlayer(id, (p) => ({ ...p, ...patch }));
  },
  deletePlayer(id: string) {
    commit({
      ...state,
      players: state.players.filter((p) => p.id !== id),
      currentId: state.currentId === id ? null : state.currentId,
    });
  },
  resetProgress(id: string) {
    updatePlayer(id, (p) => ({ ...p, progress: {}, stars: 0, owned: [...FREE_ITEM_IDS], avatar: { ...p.avatar, hat: "hat-none", glasses: "glasses-none", backpack: "backpack-none" } }));
  },
  recordResult(activityId: string, stars: number) {
    if (!state.currentId) return;
    updatePlayer(state.currentId, (p) => {
      const prev = p.progress[activityId];
      return {
        ...p,
        stars: p.stars + stars,
        progress: {
          ...p.progress,
          [activityId]: {
            best: Math.max(prev?.best ?? 0, stars),
            plays: (prev?.plays ?? 0) + 1,
            last: Date.now(),
          },
        },
      };
    });
  },
  setLook(patch: Partial<AvatarLook>) {
    if (!state.currentId) return;
    updatePlayer(state.currentId, (p) => ({ ...p, avatar: { ...p.avatar, ...patch } }));
  },
  /** Returns true when unlocked (or already owned). */
  buyItem(itemId: string) {
    const p = state.players.find((x) => x.id === state.currentId);
    const item = itemById(itemId);
    if (!p || !item) return false;
    if (p.owned.includes(itemId)) return true;
    if (!canAfford(p.stars, item.cost)) return false;
    updatePlayer(p.id, (x) => ({ ...x, stars: x.stars - item.cost, owned: [...x.owned, itemId] }));
    return true;
  },
  wear(category: ItemCategory, itemId: string) {
    actions.setLook({ [category]: itemId } as Partial<AvatarLook>);
  },
  setSettings(patch: Partial<Settings>) {
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },
  exportBackup() {
    return JSON.stringify({ app: "fun-hut", version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2);
  },
  importBackup(json: string) {
    const parsed = JSON.parse(json) as { app?: string; data?: GameState };
    if (parsed.app !== "fun-hut" || !parsed.data || !Array.isArray(parsed.data.players)) {
      throw new Error("This file is not a Fun Hut backup.");
    }
    commit({ ...DEFAULT, ...parsed.data, settings: { ...DEFAULT.settings, ...parsed.data.settings } });
  },
};

export function collectionProgress(player: Player, collectionId: CollectionId) {
  const col = COLLECTIONS.find((c) => c.id === collectionId)!;
  const playable = col.activities.filter((a) => a.playable);
  const done = playable.filter((a) => player.progress[a.id]).length;
  const stars = playable.reduce((s, a) => s + (player.progress[a.id]?.best ?? 0), 0);
  return {
    done,
    total: playable.length,
    percent: playable.length ? Math.round((done / playable.length) * 100) : 0,
    stars,
    maxStars: playable.length * 3,
  };
}

export function previousPlayableActivity(collectionId: CollectionId, activityId: string) {
  const activities = COLLECTIONS.find((collection) => collection.id === collectionId)?.activities.filter((activity) => activity.playable) ?? [];
  const index = activities.findIndex((activity) => activity.id === activityId);
  return index > 0 ? activities[index - 1]! : null;
}

export function isActivityUnlocked(player: Pick<Player, "progress">, collectionId: CollectionId, activityId: string) {
  const activities = COLLECTIONS.find((collection) => collection.id === collectionId)?.activities.filter((activity) => activity.playable) ?? [];
  const index = activities.findIndex((activity) => activity.id === activityId);
  if (index < 0) return false;
  if (index === 0) return true;
  const previous = activities[index - 1]!;
  return (player.progress[previous.id]?.best ?? 0) >= STARS_TO_UNLOCK_NEXT_ACTIVITY;
}
