import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';
import { flushPendingSessions } from '../services/sessions';
import { useAuth } from './AuthContext';

const COMPLETED_KEY = 'completed_scenarios';

type ProgressContextData = {
  completedScenarios: string[];
  markScenarioCompleted: (id: string) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextData | undefined>(undefined);

export function ProgressContextProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  useEffect(() => {
    async function loadStored() {
      const storedCompleted = await AsyncStorageHelper.getObject<string[]>(COMPLETED_KEY);
      if (storedCompleted) {
        setCompletedScenarios(storedCompleted);
      }
    }
    loadStored();
  }, []);

  useEffect(() => {
    if (token) {
      flushPendingSessions().catch(() => {});
    }
  }, [token]);

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

  return (
    <ProgressContext.Provider value={{ completedScenarios, markScenarioCompleted }}>
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
