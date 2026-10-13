import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';
import { Child } from '../types/Child';
import { useAuth } from './AuthContext';

const ACTIVE_CHILD_KEY = 'active_child';

type ActiveChildContextData = {
  activeChild: Child | null;
  isLoading: boolean;
  selectChild: (child: Child | null) => Promise<void>;
  syncWithChildren: (children: Child[]) => Promise<void>;
};

const ActiveChildContext = createContext<ActiveChildContextData | undefined>(undefined);

function pickActiveChild(current: Child | null, children: Child[]): Child | null {
  const refreshed = current ? children.find((child) => child.id === current.id) : undefined;
  if (refreshed) {
    return refreshed;
  }
  return children.length === 1 ? children[0] : null;
}

export function ActiveChildContextProvider({ children }: { children: ReactNode }) {
  const { token, isLoading: authLoading } = useAuth();
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeChildRef = useRef<Child | null>(null);

  useEffect(() => {
    async function loadStored() {
      try {
        const stored = await AsyncStorageHelper.getObject<Child>(ACTIVE_CHILD_KEY);
        activeChildRef.current = stored;
        setActiveChild(stored);
      } finally {
        setIsLoading(false);
      }
    }
    loadStored();
  }, []);

  const selectChild = useCallback(async (child: Child | null) => {
    activeChildRef.current = child;
    setActiveChild(child);
    if (child) {
      await AsyncStorageHelper.setObject<Child>(ACTIVE_CHILD_KEY, child);
    } else {
      await AsyncStorageHelper.remove(ACTIVE_CHILD_KEY);
    }
  }, []);

  const syncWithChildren = useCallback(
    (list: Child[]) => selectChild(pickActiveChild(activeChildRef.current, list)),
    [selectChild],
  );

  useEffect(() => {
    if (!authLoading && !token) {
      selectChild(null);
    }
  }, [authLoading, token, selectChild]);

  return (
    <ActiveChildContext.Provider value={{ activeChild, isLoading, selectChild, syncWithChildren }}>
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild(): ActiveChildContextData {
  const context = useContext(ActiveChildContext);
  if (context === undefined) {
    throw new Error('useActiveChild deve ser usado dentro de ActiveChildContextProvider');
  }
  return context;
}
