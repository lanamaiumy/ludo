import { Scenario, ScenarioData } from '../types/Scenario';

export type TrailProgress = {
  unlocked: string[];
  completed: string[];
};

export const EMPTY_PROGRESS: TrailProgress = { unlocked: [], completed: [] };

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function byOrder(scenarios: ScenarioData[]): ScenarioData[] {
  return [...scenarios].sort((a, b) => a.order - b.order);
}

export function mergeProgress(current: TrailProgress, incoming: TrailProgress): TrailProgress {
  const completed = unique([...current.completed, ...incoming.completed]);
  return {
    completed,
    unlocked: unique([...current.unlocked, ...incoming.unlocked, ...completed]),
  };
}

export function nextScenarioId(scenarios: ScenarioData[], id: string): string | null {
  const ordered = byOrder(scenarios);
  const index = ordered.findIndex((scenario) => scenario.id === id);
  return index >= 0 && index < ordered.length - 1 ? ordered[index + 1].id : null;
}

export function resolveTrail(scenarios: ScenarioData[], progress: TrailProgress): Scenario[] {
  return byOrder(scenarios).map((scenario, index) => {
    if (progress.completed.includes(scenario.id)) {
      return { ...scenario, status: 'completed' };
    }
    if (index === 0 || progress.unlocked.includes(scenario.id)) {
      return { ...scenario, status: 'unlocked' };
    }
    return { ...scenario, status: 'locked' };
  });
}
