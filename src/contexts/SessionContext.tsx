import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { registerSession } from '../services/sessions';
import { useActiveChild } from './ActiveChildContext';

const MINIMUM_SESSION_MS = 15 * 1000;

type SessionContextData = {
  isTimeUp: boolean;
  startSession: () => void;
  finishSession: () => void;
  acknowledgeTimeUp: () => void;
};

type RunningSession = {
  childId: string;
  startedAt: number;
  timer: ReturnType<typeof setTimeout>;
};

const SessionContext = createContext<SessionContextData | undefined>(undefined);

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const { activeChild } = useActiveChild();
  const [isTimeUp, setIsTimeUp] = useState(false);
  const running = useRef<RunningSession | null>(null);

  const stopTimer = useCallback(() => {
    const session = running.current;
    running.current = null;
    if (session) {
      clearTimeout(session.timer);
    }
    return session;
  }, []);

  const startSession = useCallback(() => {
    if (!activeChild || running.current) {
      return;
    }
    const childId = activeChild.id;
    const timer = setTimeout(() => {
      stopTimer();
      setIsTimeUp(true);
      registerSession(childId, true).catch(() => {});
    }, activeChild.sessionMinutes * 60 * 1000);
    running.current = { childId, startedAt: Date.now(), timer };
  }, [activeChild, stopTimer]);

  const finishSession = useCallback(() => {
    const session = stopTimer();
    if (session && Date.now() - session.startedAt >= MINIMUM_SESSION_MS) {
      registerSession(session.childId, false).catch(() => {});
    }
  }, [stopTimer]);

  const acknowledgeTimeUp = useCallback(() => setIsTimeUp(false), []);

  useEffect(() => () => {
    stopTimer();
  }, [stopTimer]);

  return (
    <SessionContext.Provider value={{ isTimeUp, startSession, finishSession, acknowledgeTimeUp }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextData {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession deve ser usado dentro de SessionContextProvider');
  }
  return context;
}
