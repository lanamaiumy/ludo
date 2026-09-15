import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';

const COMPLETED_KEY = 'completed_scenarios';
const SESSIONS_KEY = 'local_sessions';

export type LocalSession = {
  date: string;
  scenarioId: string;
  soundId: string;
  completed: boolean;
  usedSoftMode: boolean;
};

type ProgressContextData = {
  completedScenarios: string[];
  weekUsage: boolean[];
  markScenarioCompleted: (id: string) => Promise<void>;
  addSession: (session: LocalSession) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextData | undefined>(undefined);

function buildWeekUsage(sessions: LocalSession[]): boolean[] {
  const week = [false, false, false, false, false, false, false];
  for (const session of sessions) {
    const day = new Date(session.date).getDay();
    const index = (day + 6) % 7;
    week[index] = true;
  }
  return week;
}

export function ProgressContextProvider({ children }: { children: ReactNode }) {
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [weekUsage, setWeekUsage] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    async function loadStored() {
      const storedCompleted = await AsyncStorageHelper.getObject<string[]>(COMPLETED_KEY);
      const storedSessions = await AsyncStorageHelper.getObject<LocalSession[]>(SESSIONS_KEY);
      if (storedCompleted) {
        setCompletedScenarios(storedCompleted);
      }
      if (storedSessions) {
        setWeekUsage(buildWeekUsage(storedSessions));
      }
    }
    loadStored();
  }, []);

  // método que alimenta o contexto, quando o som acaba, chamamos o método e 
  // e adicionamos o cenário concluído na const completedScanearios
  async function markScenarioCompleted(id: string): Promise<void> {
    if (completedScenarios.includes(id)) {
      return;
    }
    const updated = [...completedScenarios, id];
    setCompletedScenarios(updated);
    await AsyncStorageHelper.setObject<string[]>(COMPLETED_KEY, updated);
  }

  async function addSession(session: LocalSession): Promise<void> {
    const stored = await AsyncStorageHelper.getObject<LocalSession[]>(SESSIONS_KEY);
    const updated = stored ? [...stored, session] : [session];
    await AsyncStorageHelper.setObject<LocalSession[]>(SESSIONS_KEY, updated);
    setWeekUsage(buildWeekUsage(updated));
  }

  return (
    <ProgressContext.Provider
      value={{ completedScenarios, weekUsage, markScenarioCompleted, addSession }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextData {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress deve ser usado dentro de ProgressContextProvider');
  }
  return context;
}
