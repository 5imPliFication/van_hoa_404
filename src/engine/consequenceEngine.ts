import type { DelayedConsequence, Scenario } from '../types/game';

export function evaluateDelayedConsequences(
  currentScenario: Scenario,
  scenarioIndex: number,
  flags: Record<string, boolean>,
  unlockedConsequences: string[]
): DelayedConsequence[] {
  if (!currentScenario.delayedConsequences) return [];

  const newlyTriggered: DelayedConsequence[] = [];

  for (const consequence of currentScenario.delayedConsequences) {
    if (unlockedConsequences.includes(consequence.id)) {
      continue;
    }

    const { requiredFlags, minScenarioIndex } = consequence.trigger;

    const indexConditionMet = minScenarioIndex === undefined || scenarioIndex >= minScenarioIndex;

    const flagsMet =
      !requiredFlags ||
      requiredFlags.length === 0 ||
      requiredFlags.every((flagKey) => Boolean(flags[flagKey]));

    if (indexConditionMet && flagsMet) {
      newlyTriggered.push(consequence);
    }
  }

  return newlyTriggered;
}
