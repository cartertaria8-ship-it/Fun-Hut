import { describe, expect, it } from "vitest";
import { canAfford, starsForMistakes } from "@/lib/rules";
import { isActivityUnlocked } from "@/lib/store";

describe("reward rules", () => {
  it("gives 3 stars with no mistakes", () => {
    expect(starsForMistakes(0)).toBe(3);
  });
  it("gives 2 stars for one or two mistakes", () => {
    expect(starsForMistakes(2)).toBe(2);
  });
  it("never gives fewer than 1 star, however many mistakes", () => {
    expect(starsForMistakes(50)).toBe(1);
  });
  it("an item can only be unlocked with enough stars", () => {
    expect(canAfford(4, 5)).toBe(false);
    expect(canAfford(5, 5)).toBe(true);
  });
  it("opens the first activity and unlocks the next one after 2 best stars", () => {
    expect(isActivityUnlocked({ progress: {} }, "alphabet", "letter-hunt")).toBe(true);
    expect(isActivityUnlocked({ progress: { "letter-hunt": { best: 1, plays: 1, last: 1 } } }, "alphabet", "match-letter")).toBe(false);
    expect(isActivityUnlocked({ progress: { "letter-hunt": { best: 2, plays: 1, last: 1 } } }, "alphabet", "match-letter")).toBe(true);
  });
});
