/**
 * Reward rules. Children always get at least 1 star — mistakes never take stars away
 * or block progress; fewer mistakes simply earn more.
 */
export function starsForMistakes(mistakes: number, allowance = 0): 1 | 2 | 3 {
  const m = Math.max(0, mistakes - allowance);
  if (m === 0) return 3;
  if (m <= 2) return 2;
  return 1;
}

export function canAfford(balance: number, cost: number) {
  return balance >= cost;
}
