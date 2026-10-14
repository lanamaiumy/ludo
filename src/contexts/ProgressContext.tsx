import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { scenarios } from '../data/scenarios';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';
import { EMPTY_PROGRESS, mergeProgress, nextScenarioId, TrailProgress } from '../helpers/trail';
import { getProgress, sendProgress } from '../services/progress';
import { flushPendingSessions } from '../services/sessions';
import { useActiveChild } from './ActiveChildContext';
import { useAuth } from './AuthContext';

type ProgressContextData = {
  completedScenarios: string[];
  unlockedScenarios: string[];
  markScenarioCompleted: (id: string) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextData | undefined>(undefined);

function progressKey(childId: string): string {
  return `progress_${childId}`;
}

export function ProgressContextProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;
  const [progress, setProgress] = useState<TrailProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    if (!childId) {
      setProgress(EMPTY_PROGRESS);
      return;
    }
    let active = true;

    async function syncWithApi(id: string) {
      const local = (await AsyncStorageHelper.getObject<TrailProgress>(progressKey(id))) ?? EMPTY_PROGRESS;
      if (active) {
        setProgress(local);
      }
      const remote = await getProgress(id);
      const merged = mergeProgress(local, remote);
      if (active) {
        setProgress(merged);
      }
      await AsyncStorageHelper.setObject<TrailProgress>(progressKey(id), merged);
      await sendProgress(id, merged, remote);
    }

    syncWithApi(childId).catch(() => {});
    return () => {
      active = false;
    };
  }, [childId, token]);

  useEffect(() => {
    if (token) {
      flushPendingSessions().catch(() => {});
    }
  }, [token]);

  // método que alimenta o contexto, quando o som acaba, chamamos o método e 
  // e adicionamos o cenário concluído na const completedScanearios
  async function markScenarioCompleted(id: string): Promise<void> {
    if (!childId) {
      return;
    }
    const next = nextScenarioId(scenarios, id);
    const advance: TrailProgress = { completed: [id], unlocked: next ? [id, next] : [id] };
    const updated = mergeProgress(progress, advance);
    setProgress(updated);
    await AsyncStorageHelper.setObject<TrailProgress>(progressKey(childId), updated);
    sendProgress(childId, advance).catch(() => {});
  }

  return (
    <ProgressContext.Provider
      value={{
        completedScenarios: progress.completed,
        unlockedScenarios: progress.unlocked,
        markScenarioCompleted,
      }}
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
