import type { AgeGroup } from "@/lib/store";

/** A visual "face" for an option, prompt item, drag item or drop target. */
export interface Face {
  emoji?: string;
  text?: string;
  big?: string;
  color?: string;
  count?: number;
}

export type Prompt =
  | { kind: "big"; text: string; color?: string }
  | { kind: "count"; emoji: string; n: number }
  | { kind: "sequence"; items: Face[] };

export interface ChoiceRound {
  instruction: string;
  prompt?: Prompt;
  options: (Face & { key: string })[];
  answer: string;
}

export interface DragRound {
  instruction: string;
  items: (Face & { key: string; match: string })[];
  targets: (Face & { key: string })[];
}

export interface MemoryDeck {
  instruction: string;
  pairs: string[];
}

export interface DrawingRound {
  instruction: string;
  item: { name: string; emoji: string };
}

export type GameDef =
  | { kind: "choice"; build: (age: AgeGroup) => ChoiceRound[] }
  | { kind: "drag"; build: (age: AgeGroup) => DragRound[] }
  | { kind: "memory"; build: (age: AgeGroup) => MemoryDeck[] }
  | { kind: "draw"; build: (age: AgeGroup) => DrawingRound[] };
