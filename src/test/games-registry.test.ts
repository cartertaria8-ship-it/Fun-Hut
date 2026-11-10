import { describe, expect, it } from "vitest";
import { COLLECTIONS, STICKERS } from "@/lib/content";
import { GAMES } from "@/games/registry";
import type { AgeGroup } from "@/lib/store";
import type { ChoiceRound, DragRound, DrawingRound, MemoryDeck } from "@/games/types";

describe("playable stage registry", () => {
  it("has a game and sticker for every stage", () => {
    for (const collection of COLLECTIONS) {
      for (const activity of collection.activities) {
        expect(activity.playable, `${activity.id} should be playable`).toBe(true);
        expect(GAMES[activity.id], `${activity.id} should have a game`).toBeDefined();
        expect(STICKERS[activity.id], `${activity.id} should have a reward sticker`).toBeDefined();
      }
    }
  });

  it.each<AgeGroup>(["4-5", "6-8"])("builds valid rounds for age %s", (age) => {
    for (const [activityId, game] of Object.entries(GAMES)) {
      const rounds = game.build(age);
      expect(rounds.length, `${activityId} should generate rounds`).toBeGreaterThan(0);

      if (game.kind === "choice") {
        for (const round of rounds as ChoiceRound[]) {
          expect(round.options.some((option) => option.key === round.answer), `${activityId} should include the answer`).toBe(true);
        }
      } else if (game.kind === "drag") {
        for (const round of rounds as DragRound[]) {
          const targetKeys = new Set(round.targets.map((target) => target.key));
          expect(round.items.length, `${activityId} should include draggable items`).toBeGreaterThan(0);
          expect(round.items.every((item) => targetKeys.has(item.match)), `${activityId} items should have matching targets`).toBe(true);
        }
      } else if (game.kind === "memory") {
        expect((rounds as MemoryDeck[]).every((round) => round.pairs.length > 0), `${activityId} should include card pairs`).toBe(true);
      } else {
        expect((rounds as DrawingRound[]).every((round) => round.item.name && round.item.emoji), `${activityId} should have a drawing prompt`).toBe(true);
      }
    }
  });

  it("asks bigger or smaller in words and offers number tiles", () => {
    for (const age of ["4-5", "6-8"] as const) {
      const rounds = GAMES["bigger-smaller"]!.build(age) as ChoiceRound[];
      for (const [index, round] of rounds.entries()) {
        const asksBigger = index % 2 === 0;
        const value = (expression: string) => {
          const [left, operator, right] = expression.split(" ");
          return operator === "×" ? Number(left) * Number(right) : Number(left) + Number(right);
        };
        const values = round.options.map((option) => value(option.key));
        expect(round.prompt).toBeUndefined();
        expect(round.instruction).toBe(`Which one is ${asksBigger ? "bigger" : "smaller"}?`);
        expect(round.options).toHaveLength(2);
        expect(values.every(Number.isFinite)).toBe(true);
        expect(round.answer).toMatch(/^\d+ [×+] \d+$/);
        expect(value(round.answer)).toBe(asksBigger ? Math.max(...values) : Math.min(...values));
      }
    }
  });
});