import alphabetImg from "@/assets/col-alphabet.jpg";
import numbersImg from "@/assets/col-numbers.jpg";
import shapesImg from "@/assets/col-shapes.jpg";
import animalsImg from "@/assets/col-animals.jpg";
import puzzlesImg from "@/assets/col-puzzles.jpg";
import creativeImg from "@/assets/col-creative.jpg";

export type CollectionId = "alphabet" | "numbers" | "shapes" | "animals" | "puzzles" | "creative";

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  playable: boolean;
}

export interface Collection {
  id: CollectionId;
  name: string;
  short: string;
  mascot: string;
  mascotEmoji: string;
  image: string;
  /** Literal class names so Tailwind keeps them. */
  bg: string;
  text: string;
  border: string;
  /** Position on the world map, in percent. */
  map: { x: number; y: number };
  activities: Activity[];
}

export const COLLECTIONS: Collection[] = [
  {
    id: "alphabet",
    name: "Alphabet Forest",
    short: "Letters & words",
    mascot: "Bubble",
    mascotEmoji: "🫧",
    image: alphabetImg,
    bg: "bg-forest",
    text: "text-forest",
    border: "border-forest",
    map: { x: 28, y: 22 },
    activities: [
      { id: "letter-hunt", name: "Letter Hunt", emoji: "🔍", playable: true },
      { id: "match-letter", name: "Match the Letter", emoji: "🔤", playable: true },
      { id: "beginning-sounds", name: "Beginning Sounds", emoji: "🍎", playable: true },
      { id: "missing-letter", name: "Missing Letter", emoji: "❓", playable: true },
      { id: "build-word", name: "Build a Word", emoji: "🧩", playable: true },
    ],
  },
  {
    id: "numbers",
    name: "Number Town",
    short: "Counting & sums",
    mascot: "Numi",
    mascotEmoji: "🔢",
    image: numbersImg,
    bg: "bg-town",
    text: "text-town",
    border: "border-town",
    map: { x: 58, y: 16 },
    activities: [
      { id: "count-objects", name: "Count the Objects", emoji: "🍓", playable: true },
      { id: "number-match", name: "Number Match", emoji: "🎯", playable: true },
      { id: "number-train", name: "Number Train", emoji: "🚂", playable: true },
      { id: "addition", name: "Addition Adventure", emoji: "➕", playable: true },
      { id: "subtraction", name: "Subtraction Station", emoji: "➖", playable: true },
      { id: "bigger-smaller", name: "Bigger or Smaller", emoji: "⚖️", playable: true },
    ],
  },
  {
    id: "shapes",
    name: "Shapes & Colours City",
    short: "Colours & patterns",
    mascot: "Pip",
    mascotEmoji: "🔷",
    image: shapesImg,
    bg: "bg-city",
    text: "text-city",
    border: "border-city",
    map: { x: 84, y: 22 },
    activities: [
      { id: "colour-splash", name: "Colour Splash", emoji: "🎈", playable: true },
      { id: "pattern-train", name: "Pattern Train", emoji: "🚃", playable: true },
      { id: "shape-matcher", name: "Shape Matcher", emoji: "🔺", playable: true },
      { id: "shape-builder", name: "Shape Builder", emoji: "🏠", playable: true },
      { id: "sorting-fun", name: "Sorting Fun", emoji: "🧺", playable: true },
    ],
  },
  {
    id: "animals",
    name: "Animal Kingdom",
    short: "Animals & homes",
    mascot: "Roo",
    mascotEmoji: "🦘",
    image: animalsImg,
    bg: "bg-kingdom",
    text: "text-kingdom",
    border: "border-kingdom",
    map: { x: 56, y: 46 },
    activities: [
      { id: "animal-match", name: "Animal Match", emoji: "🐮", playable: true },
      { id: "where-live", name: "Where Do I Live?", emoji: "🏡", playable: true },
      { id: "animal-puzzles", name: "Animal Puzzles", emoji: "🧩", playable: true },
      { id: "who-am-i", name: "Who Am I?", emoji: "🕵️", playable: true },
      { id: "sort-animals", name: "Sort the Animals", emoji: "🗂️", playable: true },
    ],
  },
  {
    id: "puzzles",
    name: "Puzzle Island",
    short: "Memory & thinking",
    mascot: "Puzz",
    mascotEmoji: "🧠",
    image: puzzlesImg,
    bg: "bg-island",
    text: "text-island",
    border: "border-island",
    map: { x: 80, y: 68 },
    activities: [
      { id: "memory-match", name: "Memory Match", emoji: "🃏", playable: true },
      { id: "what-next", name: "What Comes Next?", emoji: "➡️", playable: true },
      { id: "picture-puzzle", name: "Picture Puzzle", emoji: "🖼️", playable: true },
      { id: "find-difference", name: "Find the Difference", emoji: "👀", playable: true },
      { id: "treasure-trail", name: "Treasure Trail", emoji: "💎", playable: true },
    ],
  },
  {
    id: "creative",
    name: "Creative Corner",
    short: "Draw & create",
    mascot: "Doodle",
    mascotEmoji: "🖍️",
    image: creativeImg,
    bg: "bg-corner",
    text: "text-corner",
    border: "border-corner",
    map: { x: 36, y: 74 },
    activities: [
      { id: "drawing-board", name: "My Drawing Board", emoji: "🎨", playable: true },
      { id: "build-picture", name: "Build a Picture", emoji: "🔶", playable: true },
      { id: "little-builder", name: "My Little Builder", emoji: "🧱", playable: true },
      { id: "colour-world", name: "Color the World", emoji: "🌍", playable: true },
    ],
  },
];

export function getCollection(id: string) {
  return COLLECTIONS.find((c) => c.id === id);
}

export function collectionOfActivity(activityId: string) {
  return COLLECTIONS.find((c) => c.activities.some((a) => a.id === activityId));
}

export function getActivity(activityId: string) {
  return collectionOfActivity(activityId)?.activities.find((a) => a.id === activityId);
}

/** Stickers earned per finished activity (one per playable activity). */
export const STICKERS: Record<string, string> = {
  "letter-hunt": "🅰️",
  "match-letter": "🔠",
  "beginning-sounds": "🔊",
  "missing-letter": "🔡",
  "build-word": "🧩",
  "count-objects": "5️⃣",
  "number-match": "🔟",
  "number-train": "🚂",
  addition: "➕",
  subtraction: "➖",
  "bigger-smaller": "⚖️",
  "colour-splash": "🌈",
  "pattern-train": "🚂",
  "shape-matcher": "🔺",
  "shape-builder": "🏗️",
  "sorting-fun": "🧺",
  "animal-match": "🦁",
  "where-live": "🐧",
  "animal-puzzles": "🐣",
  "who-am-i": "🕵️",
  "sort-animals": "🐾",
  "memory-match": "💎",
  "picture-puzzle": "🖼️",
  "find-difference": "👀",
  "treasure-trail": "🗝️",
  "what-next": "🗝️",
  "drawing-board": "🖌️",
  "build-picture": "🔶",
  "little-builder": "🧱",
  "colour-world": "🌍",
};
