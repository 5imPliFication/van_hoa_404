import type { ScoreState } from '../types/game';

export const INITIAL_SCORES: ScoreState = {
  danToc: 50,
  khoaHoc: 50,
  daiChung: 50,

  chan: 50,
  thien: 50,
  my: 50,

  build: 50,
  fight: 50,

  trust: 50,
  communityHealth: 50,
  criticalThinking: 50,

  viralRisk: 0,
};

export function clampScore(val: number): number {
  return Math.min(100, Math.max(0, Math.round(val)));
}

export function applyScoreDelta(current: ScoreState, delta: Partial<ScoreState>): ScoreState {
  const next = { ...current };
  (Object.keys(delta) as (keyof ScoreState)[]).forEach((key) => {
    if (delta[key] !== undefined) {
      next[key] = clampScore((next[key] ?? 50) + (delta[key] ?? 0));
    }
  });
  return next;
}

export function calculateBalanceScore(build: number, fight: number): number {
  return clampScore(100 - Math.abs(build - fight));
}

export function calculateCulturalEffectiveness(scores: ScoreState): number {
  const avgCores = (scores.danToc + scores.khoaHoc + scores.daiChung) / 3;
  const avgValues = (scores.chan + scores.thien + scores.my) / 3;
  const balance = calculateBalanceScore(scores.build, scores.fight);
  const health = scores.communityHealth;

  const effectiveness = 0.35 * avgCores + 0.25 * avgValues + 0.20 * balance + 0.20 * health;

  return clampScore(effectiveness);
}
