import type { AgeGroup } from "@/lib/store";
import type { ChoiceRound, DragRound, DrawingRound, Face, GameDef, MemoryDeck } from "./types";

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
};
const sample = <T,>(a: T[], n: number) => shuffle(a).slice(0, n);
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const young = (age: AgeGroup) => age === "4-5";

const LETTERS: [string, string, string][] = [
  ["A", "🍎", "Apple"], ["B", "⚽", "Ball"], ["C", "🐱", "Cat"], ["D", "🐶", "Dog"],
  ["E", "🥚", "Egg"], ["F", "🐟", "Fish"], ["G", "🍇", "Grapes"], ["H", "🎩", "Hat"],
  ["I", "🍦", "Ice cream"], ["J", "🧃", "Juice"], ["K", "🪁", "Kite"], ["L", "🦁", "Lion"],
  ["M", "🌙", "Moon"], ["N", "🪺", "Nest"], ["O", "🐙", "Octopus"], ["P", "🐧", "Penguin"],
  ["Q", "👑", "Queen"], ["R", "🌈", "Rainbow"], ["S", "☀️", "Sun"], ["T", "🌳", "Tree"],
  ["U", "☂️", "Umbrella"], ["V", "🎻", "Violin"], ["W", "🍉", "Watermelon"], ["X", "🩻", "X-ray"],
  ["Y", "🪀", "Yo-yo"], ["Z", "🦓", "Zebra"],
];

export const COLOURS = [
  { name: "Red", color: "oklch(0.62 0.22 27)" },
  { name: "Orange", color: "oklch(0.74 0.18 55)" },
  { name: "Yellow", color: "oklch(0.88 0.17 95)" },
  { name: "Green", color: "oklch(0.68 0.19 145)" },
  { name: "Blue", color: "oklch(0.58 0.18 255)" },
  { name: "Purple", color: "oklch(0.55 0.2 300)" },
  { name: "Pink", color: "oklch(0.76 0.15 350)" },
  { name: "Brown", color: "oklch(0.5 0.08 55)" },
];

type Habitat = "farm" | "ocean" | "jungle" | "ice";
const ANIMALS: { emoji: string; name: string; home: Habitat; easy: boolean }[] = [
  { emoji: "🐮", name: "Cow", home: "farm", easy: true },
  { emoji: "🐷", name: "Pig", home: "farm", easy: true },
  { emoji: "🐑", name: "Sheep", home: "farm", easy: true },
  { emoji: "🐔", name: "Hen", home: "farm", easy: true },
  { emoji: "🐴", name: "Horse", home: "farm", easy: true },
  { emoji: "🐟", name: "Fish", home: "ocean", easy: true },
  { emoji: "🐳", name: "Whale", home: "ocean", easy: false },
  { emoji: "🐙", name: "Octopus", home: "ocean", easy: false },
  { emoji: "🦀", name: "Crab", home: "ocean", easy: true },
  { emoji: "🐒", name: "Monkey", home: "jungle", easy: true },
  { emoji: "🐯", name: "Tiger", home: "jungle", easy: false },
  { emoji: "🦜", name: "Parrot", home: "jungle", easy: false },
  { emoji: "🐘", name: "Elephant", home: "jungle", easy: true },
  { emoji: "🐧", name: "Penguin", home: "ice", easy: true },
  { emoji: "🐻‍❄️", name: "Polar bear", home: "ice", easy: false },
  { emoji: "🦭", name: "Seal", home: "ice", easy: false },
];
const HABITATS: Record<Habitat, Face> = {
  farm: { emoji: "🏡", text: "Farm" },
  ocean: { emoji: "🌊", text: "Ocean" },
  jungle: { emoji: "🌴", text: "Jungle" },
  ice: { emoji: "🧊", text: "Ice land" },
};

const COUNT_EMOJI = ["🍓", "🎈", "🐥", "⭐", "🍪", "🐞", "🌸", "🚗"];
const SHAPES = ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠", "⭐", "❤️", "🔺", "🟦"];
const MEMORY = ["🦁", "🐸", "🍉", "🚀", "🌈", "🐙", "🍩", "⚽", "🦋", "🎈"];
const DRAWING_ITEMS = [
  { name: "cap", emoji: "🧢" },
  { name: "ball", emoji: "⚽" },
  { name: "house", emoji: "🏠" },
];

function letterHunt(age: AgeGroup): ChoiceRound[] {
  const pool = young(age) ? LETTERS.slice(0, 12) : LETTERS;
  const n = young(age) ? 3 : 4;
  return sample(pool, 5).map(([L]) => {
    const choice = shuffle([pool.find((x) => x[0] === L)!, ...sample(pool.filter((x) => x[0] !== L), n - 1)]);
    return {
      instruction: `Tap the picture that starts with ${L}`,
      prompt: { kind: "big", text: `${L}${L.toLowerCase()}` },
      options: choice.map(([l, e, w]) => ({ key: l, emoji: e, text: w })),
      answer: L,
    };
  });
}

function matchLetter(age: AgeGroup): DragRound[] {
  const pool = young(age) ? LETTERS.slice(0, 12) : LETTERS;
  const n = young(age) ? 3 : 4;
  return [0, 1, 2].map(() => {
    const picked = sample(pool, n).map((x) => x[0]);
    return {
      instruction: "Drag each BIG letter to its little letter",
      items: shuffle(picked).map((L) => ({ key: L, match: L, big: L })),
      targets: shuffle(picked).map((L) => ({ key: L, big: L.toLowerCase() })),
    };
  });
}

function countObjects(age: AgeGroup): ChoiceRound[] {
  const max = young(age) ? 5 : 10;
  const n = young(age) ? 3 : 4;
  return [0, 1, 2, 3, 4].map(() => {
    const count = rint(1, max);
    const others = sample(
      Array.from({ length: max }, (_, i) => i + 1).filter((x) => x !== count),
      n - 1,
    );
    const emoji = COUNT_EMOJI[rint(0, COUNT_EMOJI.length - 1)]!;
    return {
      instruction: "How many can you count?",
      prompt: { kind: "count", emoji, n: count },
      options: shuffle([count, ...others]).map((x) => ({ key: String(x), big: String(x) })),
      answer: String(count),
    };
  });
}

function numberMatch(age: AgeGroup): DragRound[] {
  const max = young(age) ? 5 : 10;
  const n = young(age) ? 3 : 4;
  return [0, 1, 2].map(() => {
    const nums = sample(Array.from({ length: max }, (_, i) => i + 1), n);
    const emoji = COUNT_EMOJI[rint(0, COUNT_EMOJI.length - 1)]!;
    return {
      instruction: "Drag each number to the group with that many",
      items: shuffle(nums).map((x) => ({ key: String(x), match: String(x), big: String(x) })),
      targets: shuffle(nums).map((x) => ({ key: String(x), emoji, count: x })),
    };
  });
}

function colourSplash(age: AgeGroup): ChoiceRound[] {
  const pool = young(age) ? COLOURS.slice(0, 6) : COLOURS;
  const n = young(age) ? 3 : 4;
  return sample(pool, 5).map((c) => {
    const opts = shuffle([c, ...sample(pool.filter((x) => x.name !== c.name), n - 1)]);
    return {
      instruction: `Pop the ${c.name.toLowerCase()} balloon!`,
      prompt: young(age) ? { kind: "big", text: c.name, color: c.color } : { kind: "big", text: c.name },
      options: opts.map((o) => ({ key: o.name, color: o.color })),
      answer: c.name,
    };
  });
}

function patternRounds(age: AgeGroup, instruction: string, pool: string[]): ChoiceRound[] {
  const templates = young(age) ? ["AB"] : ["AB", "ABC", "AAB", "ABB"];
  return [0, 1, 2, 3, 4].map(() => {
    const t = templates[rint(0, templates.length - 1)]!;
    const picks = sample(pool, 3);
    const map: Record<string, string> = { A: picks[0]!, B: picks[1]!, C: picks[2]! };
    const seq = Array.from({ length: t.length * 2 + 1 }, (_, i) => map[t[i % t.length]!]!);
    const answer = seq[seq.length - 1]!;
    const shown = seq.slice(0, -1).map((e) => ({ emoji: e }) as Face);
    const others = sample(pool.filter((x) => x !== answer), young(age) ? 2 : 3);
    return {
      instruction,
      prompt: { kind: "sequence", items: [...shown, { text: "?" }] },
      options: shuffle([answer, ...others]).map((e) => ({ key: e, emoji: e })),
      answer,
    };
  });
}

function animalMatch(age: AgeGroup): ChoiceRound[] {
  const pool = young(age) ? ANIMALS.filter((a) => a.easy) : ANIMALS;
  const n = young(age) ? 3 : 4;
  return sample(pool, 5).map((a) => {
    const opts = shuffle([a, ...sample(pool.filter((x) => x.name !== a.name), n - 1)]);
    return {
      instruction: `Find the ${a.name.toLowerCase()}`,
      prompt: { kind: "big", text: a.name },
      options: opts.map((o) => ({ key: o.name, emoji: o.emoji })),
      answer: a.name,
    };
  });
}

function whereLive(age: AgeGroup): DragRound[] {
  const homes = Object.keys(HABITATS) as Habitat[];
  return [0, 1, 2].map(() => {
    const picked = sample(homes, young(age) ? 2 : 3);
    const items = picked.flatMap((h) =>
      sample(
        ANIMALS.filter((a) => a.home === h && (!young(age) || a.easy)),
        2,
      ).map((a) => ({ key: a.name, match: h, emoji: a.emoji })),
    );
    return {
      instruction: "Help each animal get home",
      items: shuffle(items),
      targets: picked.map((h) => ({ key: h, ...HABITATS[h] })),
    };
  });
}

function beginningSounds(age: AgeGroup): ChoiceRound[] {
  const pool = young(age) ? LETTERS.slice(0, 12) : LETTERS;
  const optionCount = young(age) ? 3 : 4;
  return sample(pool, 5).map(([letter, emoji, word]) => {
    const options = [
      [letter, emoji, word] as [string, string, string],
      ...sample(pool.filter(([candidate]) => candidate !== letter), optionCount - 1),
    ];
    return {
      instruction: "Tap the first letter of the picture",
      prompt: { kind: "big", text: `${emoji} ${word}` },
      options: shuffle(options).map(([candidate]) => ({ key: candidate, big: candidate })),
      answer: letter,
    };
  });
}

function missingLetter(age: AgeGroup): ChoiceRound[] {
  const pool = young(age) ? LETTERS.slice(0, 12) : LETTERS;
  const optionCount = young(age) ? 3 : 4;
  return sample(pool, 5).map(([letter, emoji, word]) => {
    const distractors = sample(pool.filter(([candidate]) => candidate !== letter), optionCount - 1);
    return {
      instruction: "Which letter is missing?",
      prompt: { kind: "big", text: `${emoji}  _${word.slice(1)}` },
      options: shuffle([[letter, "", ""], ...distractors] as [string, string, string][]).map(([candidate]) => ({ key: candidate, big: candidate })),
      answer: letter,
    };
  });
}

function buildWord(age: AgeGroup): DragRound[] {
  const pool = (young(age) ? LETTERS.slice(0, 12) : LETTERS).filter(([, , word]) => word.length >= 3 && word.length <= 5);
  return sample(pool, 3).map(([letter, emoji, word]) => {
    const letters = word.toUpperCase().split("");
    return {
      instruction: `Spell ${word} for ${emoji}`,
      items: shuffle(letters.map((character, i) => ({ key: `${i}`, match: `${i}`, big: character }))),
      targets: letters.map((_, i) => ({ key: `${i}`, big: `${i + 1}` })),
    };
  });
}

function numberTrain(age: AgeGroup): ChoiceRound[] {
  const max = young(age) ? 10 : 30;
  const optionCount = young(age) ? 3 : 4;
  return [0, 1, 2, 3, 4].map(() => {
    const step = young(age) ? 1 : rint(1, 3);
    const start = rint(1, max - step * 3);
    const answer = start + step * 3;
    const options = sample(Array.from({ length: max }, (_, i) => i + 1).filter((n) => n !== answer), optionCount - 1);
    return {
      instruction: "Which number comes next?",
      prompt: { kind: "sequence", items: [...[0, 1, 2].map((i) => ({ text: String(start + step * i) })), { text: "?" }] },
      options: shuffle([answer, ...options]).map((n) => ({ key: String(n), big: String(n) })),
      answer: String(answer),
    };
  });
}

function arithmetic(age: AgeGroup, operation: "addition" | "subtraction"): ChoiceRound[] {
  const optionCount = young(age) ? 3 : 4;
  return [0, 1, 2, 3, 4].map(() => {
    const first = operation === "addition" ? rint(1, young(age) ? 4 : 12) : rint(2, young(age) ? 5 : 20);
    const second = operation === "addition" ? rint(1, young(age) ? 4 : 12) : rint(1, first - 1);
    const answer = operation === "addition" ? first + second : first - second;
    const max = operation === "addition" ? (young(age) ? 8 : 24) : (young(age) ? 5 : 20);
    const distractors = sample(Array.from({ length: max + 1 }, (_, i) => i).filter((n) => n !== answer), optionCount - 1);
    const symbol = operation === "addition" ? "+" : "−";
    return {
      instruction: operation === "addition" ? "Add the numbers" : "Take away and count",
      prompt: { kind: "big", text: `${first} ${symbol} ${second} = ?` },
      options: shuffle([answer, ...distractors]).map((n) => ({ key: String(n), big: String(n) })),
      answer: String(answer),
    };
  });
}

function biggerSmaller(age: AgeGroup): ChoiceRound[] {
  const max = young(age) ? 5 : 9;
  const expression = () => {
    const left = rint(1, max);
    const right = rint(1, max);
    const multiply = !young(age) && Math.random() > 0.5;
    return {
      text: `${left} ${multiply ? "×" : "+"} ${right}`,
      value: multiply ? left * right : left + right,
    };
  };
  return [0, 1, 2, 3, 4].map((roundIndex) => {
    const a = expression();
    let b = expression();
    while (b.value === a.value) b = expression();
    const asksBigger = roundIndex % 2 === 0;
    const answer = asksBigger ? (a.value > b.value ? a.text : b.text) : a.value < b.value ? a.text : b.text;
    return {
      instruction: `Which one is ${asksBigger ? "bigger" : "smaller"}?`,
      options: shuffle([a, b]).map((option) => ({ key: option.text, text: option.text })),
      answer,
    };
  });
}

const SHAPE_ITEMS = [
  { name: "circle", emoji: "🔵" },
  { name: "square", emoji: "🟦" },
  { name: "triangle", emoji: "🔺" },
  { name: "star", emoji: "⭐" },
  { name: "heart", emoji: "❤️" },
  { name: "diamond", emoji: "🔷" },
];

function shapeMatcher(age: AgeGroup): ChoiceRound[] {
  const optionCount = young(age) ? 3 : 4;
  return sample(SHAPE_ITEMS, 5).map((shape) => ({
    instruction: `Find the ${shape.name}`,
    prompt: { kind: "big", text: shape.emoji },
    options: shuffle([shape, ...sample(SHAPE_ITEMS.filter((item) => item.name !== shape.name), optionCount - 1)]).map((item) => ({ key: item.name, text: item.name })),
    answer: shape.name,
  }));
}

function shapeBuilder(age: AgeGroup): DragRound[] {
  return [0, 1, 2].map(() => {
    const shapes = sample(SHAPE_ITEMS, young(age) ? 3 : 4);
    return {
      instruction: "Drag each shape to its name",
      items: shuffle(shapes.map((shape) => ({ key: shape.name, match: shape.name, emoji: shape.emoji }))),
      targets: shuffle(shapes.map((shape) => ({ key: shape.name, text: shape.name }))),
    };
  });
}

function littleBuilder(age: AgeGroup): DragRound[] {
  const parts = [
    { key: "roof", emoji: "🔺", match: "top" },
    { key: "walls", emoji: "🟦", match: "middle" },
    { key: "door", emoji: "🚪", match: "door" },
    { key: "window", emoji: "🪟", match: "window" },
  ];
  return [0, 1, 2].map(() => {
    const pieces = parts.slice(0, young(age) ? 3 : 4);
    return {
      instruction: "Drag each piece to build a house",
      items: shuffle(pieces.map((part) => ({ key: part.key, match: part.match, emoji: part.emoji }))),
      targets: pieces.map((part) => ({ key: part.match, text: part.match === "middle" ? "Walls" : part.match[0]!.toUpperCase() + part.match.slice(1) })),
    };
  });
}

function sortingFun(age: AgeGroup): DragRound[] {
  const groups = {
    warm: COLOURS.filter((colour) => ["Red", "Orange", "Yellow", "Pink"].includes(colour.name)),
    cool: COLOURS.filter((colour) => ["Green", "Blue", "Purple"].includes(colour.name)),
  };
  return [0, 1, 2].map(() => {
    const picked = [...sample(groups.warm, young(age) ? 2 : 3), ...sample(groups.cool, young(age) ? 2 : 3)];
    return {
      instruction: "Sort the colors into warm and cool groups",
      items: shuffle(picked.map((colour) => ({ key: colour.name, match: groups.warm.some((entry) => entry.name === colour.name) ? "warm" : "cool", text: colour.name, color: colour.color }))),
      targets: [{ key: "warm", text: "Warm" }, { key: "cool", text: "Cool" }],
    };
  });
}

const ANIMAL_BABIES = [
  { parent: "🐮", baby: "🐮", name: "cow" },
  { parent: "🐷", baby: "🐷", name: "pig" },
  { parent: "🐸", baby: "🐸", name: "frog" },
  { parent: "🐔", baby: "🐣", name: "hen" },
  { parent: "🐻", baby: "🐻", name: "bear" },
  { parent: "🐑", baby: "🐑", name: "sheep" },
];

function animalPuzzles(age: AgeGroup): DragRound[] {
  return [0, 1, 2].map(() => {
    const picked = sample(ANIMAL_BABIES, young(age) ? 3 : 4);
    return {
      instruction: "Match each animal with the same animal",
      items: shuffle(picked.map((pair) => ({ key: pair.name, match: pair.name, emoji: pair.parent }))),
      targets: shuffle(picked.map((pair) => ({ key: pair.name, emoji: pair.baby, text: `Baby ${pair.name}` }))),
    };
  });
}

const RIDDLES = [
  { name: "Lion", emoji: "🦁", clue: "I have a big mane and roar. Who am I?" },
  { name: "Elephant", emoji: "🐘", clue: "I have a long trunk and big ears. Who am I?" },
  { name: "Penguin", emoji: "🐧", clue: "I waddle and love the cold. Who am I?" },
  { name: "Monkey", emoji: "🐒", clue: "I climb trees and love to swing. Who am I?" },
  { name: "Giraffe", emoji: "🦒", clue: "I have a very long neck. Who am I?" },
  { name: "Turtle", emoji: "🐢", clue: "I carry my home on my back. Who am I?" },
];

function whoAmI(age: AgeGroup): ChoiceRound[] {
  const optionCount = young(age) ? 3 : 4;
  return sample(RIDDLES, 5).map((riddle) => {
    const distractors = sample(RIDDLES.filter((candidate) => candidate.name !== riddle.name), optionCount - 1);
    return {
      instruction: riddle.clue,
      prompt: { kind: "big", text: "Who am I?" },
      options: shuffle([riddle, ...distractors]).map((animal) => ({ key: animal.name, emoji: animal.emoji, text: animal.name })),
      answer: riddle.name,
    };
  });
}

const SORT_ANIMALS = [
  { key: "mouse", emoji: "🐭", group: "small" }, { key: "rabbit", emoji: "🐰", group: "small" },
  { key: "frog", emoji: "🐸", group: "small" }, { key: "cat", emoji: "🐱", group: "small" },
  { key: "elephant", emoji: "🐘", group: "big" }, { key: "giraffe", emoji: "🦒", group: "big" },
  { key: "whale", emoji: "🐳", group: "big" }, { key: "bear", emoji: "🐻", group: "big" },
];

function sortAnimals(age: AgeGroup): DragRound[] {
  return [0, 1, 2].map(() => {
    const count = young(age) ? 2 : 3;
    const picked = [...sample(SORT_ANIMALS.filter((animal) => animal.group === "small"), count), ...sample(SORT_ANIMALS.filter((animal) => animal.group === "big"), count)];
    return {
      instruction: "Sort the animals by size",
      items: shuffle(picked.map((animal) => ({ key: animal.key, match: animal.group, emoji: animal.emoji }))),
      targets: [{ key: "small", text: "Small" }, { key: "big", text: "Big" }],
    };
  });
}

function picturePuzzle(age: AgeGroup): MemoryDeck[] {
  const pool = young(age) ? MEMORY.slice(0, 8) : MEMORY;
  return [{ instruction: "Flip the cards and find matching picture pairs", pairs: sample(pool, young(age) ? 4 : 6) }];
}

function findDifference(age: AgeGroup): ChoiceRound[] {
  const pool = young(age) ? ["🐶", "🐱", "🐸", "🐥", "🐰", "🐼"] : ["🐶", "🐱", "🐸", "🐥", "🐰", "🐼", "🦊", "🐵"];
  const optionCount = young(age) ? 3 : 4;
  return [0, 1, 2, 3, 4].map(() => {
    const odd = sample(pool, 1)[0]!;
    const common = sample(pool.filter((emoji) => emoji !== odd), 1)[0]!;
    const distractors = sample(pool.filter((emoji) => emoji !== odd && emoji !== common), optionCount - 1);
    const sequence = shuffle([odd, common, common, common]).map((emoji) => ({ emoji }));
    return {
      instruction: "Find the one picture that is different",
      prompt: { kind: "sequence", items: sequence },
      options: shuffle([odd, ...distractors]).map((emoji) => ({ key: emoji, emoji })),
      answer: odd,
    };
  });
}

function treasureTrail(age: AgeGroup): ChoiceRound[] {
  const directions = ["⬆️", "➡️", "⬇️", "⬅️"];
  return [0, 1, 2, 3, 4].map(() => {
    const turn = rint(0, directions.length - 1);
    const next = directions[(turn + 1) % directions.length]!;
    const options = young(age) ? [next, directions[(turn + 2) % directions.length]!, directions[(turn + 3) % directions.length]!] : directions;
    return {
      instruction: "Follow the trail. Which way is next?",
      prompt: { kind: "sequence", items: [directions[turn]!, next, directions[turn]!, { text: "?" }].map((item) => typeof item === "string" ? { emoji: item } : item) },
      options: shuffle(options).map((emoji) => ({ key: emoji, emoji })),
      answer: next,
    };
  });
}

function buildPicture(age: AgeGroup): DragRound[] {
  const scenes = [
    [{ key: "sun", emoji: "☀️", match: "sky" }, { key: "cloud", emoji: "☁️", match: "sky" }, { key: "tree", emoji: "🌳", match: "ground" }, { key: "flower", emoji: "🌼", match: "ground" }],
    [{ key: "fish", emoji: "🐟", match: "water" }, { key: "boat", emoji: "⛵", match: "water" }, { key: "sun", emoji: "☀️", match: "sky" }, { key: "palm", emoji: "🌴", match: "ground" }],
    [{ key: "moon", emoji: "🌙", match: "sky" }, { key: "star", emoji: "⭐", match: "sky" }, { key: "house", emoji: "🏠", match: "ground" }, { key: "tree", emoji: "🌳", match: "ground" }],
  ];
  return scenes.map((scene) => ({
    instruction: "Build the picture: put each sticker in the right place",
    items: shuffle(scene.slice(0, young(age) ? 3 : 4).map(({ key, emoji, match }) => ({ key, emoji, match }))),
    targets: [{ key: "sky", text: "Sky" }, { key: "ground", text: "Land" }, { key: "water", text: "Water" }],
  }));
}

function colourWorld(age: AgeGroup): ChoiceRound[] {
  const objects = [
    { name: "grass", emoji: "🌱", color: "Green" },
    { name: "sun", emoji: "☀️", color: "Yellow" },
    { name: "strawberry", emoji: "🍓", color: "Red" },
    { name: "ocean", emoji: "🌊", color: "Blue" },
    { name: "carrot", emoji: "🥕", color: "Orange" },
    { name: "grapes", emoji: "🍇", color: "Purple" },
  ];
  const optionCount = young(age) ? 3 : 4;
  return sample(objects, 5).map((object) => {
    const correct = COLOURS.find((colour) => colour.name === object.color)!;
    const distractors = sample(COLOURS.filter((colour) => colour.name !== object.color), optionCount - 1);
    return {
      instruction: `Choose a color for the ${object.name}`,
      prompt: { kind: "big", text: object.emoji },
      options: shuffle([correct, ...distractors]).map((colour) => ({ key: colour.name, color: colour.color, text: colour.name })),
      answer: object.color,
    };
  });
}

export const GAMES: Record<string, GameDef> = {
  "letter-hunt": { kind: "choice", build: letterHunt },
  "match-letter": { kind: "drag", build: matchLetter },
  "beginning-sounds": { kind: "choice", build: beginningSounds },
  "missing-letter": { kind: "choice", build: missingLetter },
  "build-word": { kind: "drag", build: buildWord },
  "count-objects": { kind: "choice", build: countObjects },
  "number-match": { kind: "drag", build: numberMatch },
  "number-train": { kind: "choice", build: numberTrain },
  addition: { kind: "choice", build: (age) => arithmetic(age, "addition") },
  subtraction: { kind: "choice", build: (age) => arithmetic(age, "subtraction") },
  "bigger-smaller": { kind: "choice", build: biggerSmaller },
  "colour-splash": { kind: "choice", build: colourSplash },
  "pattern-train": {
    kind: "choice",
    build: (age) => patternRounds(age, "What comes next on the train?", SHAPES.slice(0, 7)),
  },
  "shape-matcher": { kind: "choice", build: shapeMatcher },
  "shape-builder": { kind: "drag", build: shapeBuilder },
  "sorting-fun": { kind: "drag", build: sortingFun },
  "animal-match": { kind: "choice", build: animalMatch },
  "where-live": { kind: "drag", build: whereLive },
  "animal-puzzles": { kind: "drag", build: animalPuzzles },
  "who-am-i": { kind: "choice", build: whoAmI },
  "sort-animals": { kind: "drag", build: sortAnimals },
  "memory-match": {
    kind: "memory",
    build: (age) => [{ instruction: "Find the matching pairs", pairs: sample(MEMORY, young(age) ? 4 : 6) }],
  },
  "picture-puzzle": { kind: "memory", build: picturePuzzle },
  "find-difference": { kind: "choice", build: findDifference },
  "treasure-trail": { kind: "choice", build: treasureTrail },
  "what-next": {
    kind: "choice",
    build: (age) => patternRounds(age, "What comes next?", ["🐶", "🐱", "🍎", "🌟", "🚗", "🌙", "🍌"]),
  },
  "build-picture": { kind: "drag", build: buildPicture },
  "little-builder": { kind: "drag", build: littleBuilder },
  "colour-world": { kind: "choice", build: colourWorld },
  "drawing-board": {
    kind: "draw",
    build: (): DrawingRound[] => {
      const item = sample(DRAWING_ITEMS, 1)[0]!;
      return [{ instruction: `Can you draw a ${item.name}?`, item }];
    },
  },
};
