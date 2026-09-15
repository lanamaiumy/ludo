import { Sound } from './Sound';

export type ScenarioStatus = 'locked' | 'unlocked' | 'completed';

export type Scenario = {
  id: string;
  name: string;
  icon: string;
  order: number;
  status: ScenarioStatus;
  sounds: Sound[];
};
