import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { SessionContextProvider, useSession } from '../src/contexts/SessionContext';
import { registerSession } from '../src/services/sessions';

jest.mock('../src/services/sessions', () => ({
  registerSession: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/contexts/ActiveChildContext', () => ({
  useActiveChild: () => ({
    activeChild: { id: 'theo', name: 'Theo', maxVolume: 0.5, sessionMinutes: 5 },
  }),
}));

const MINUTE = 60 * 1000;

function wrapper({ children }: { children: ReactNode }) {
  return <SessionContextProvider>{children}</SessionContextProvider>;
}

function renderSession() {
  return renderHook(() => useSession(), { wrapper });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('SessionContext', () => {
  it('encerra a sessão ao completar o tempo configurado e registra como concluída', () => {
    const { result } = renderSession();

    act(() => result.current.startSession());
    act(() => jest.advanceTimersByTime(5 * MINUTE - 1));
    expect(result.current.isTimeUp).toBe(false);

    act(() => jest.advanceTimersByTime(1));

    expect(result.current.isTimeUp).toBe(true);
    expect(registerSession).toHaveBeenCalledWith('theo', true);
  });

  it('registra como não concluída a sessão interrompida antes do tempo', () => {
    const { result } = renderSession();

    act(() => result.current.startSession());
    act(() => jest.advanceTimersByTime(2 * MINUTE));
    act(() => result.current.finishSession());
    act(() => jest.advanceTimersByTime(10 * MINUTE));

    expect(registerSession).toHaveBeenCalledTimes(1);
    expect(registerSession).toHaveBeenCalledWith('theo', false);
    expect(result.current.isTimeUp).toBe(false);
  });

  it('ignora entradas de poucos segundos na trilha', () => {
    const { result } = renderSession();

    act(() => result.current.startSession());
    act(() => jest.advanceTimersByTime(5 * 1000));
    act(() => result.current.finishSession());

    expect(registerSession).not.toHaveBeenCalled();
  });

  it('não reinicia o tempo quando a criança vai e volta entre trilha e player', () => {
    const { result } = renderSession();

    act(() => result.current.startSession());
    act(() => jest.advanceTimersByTime(3 * MINUTE));
    act(() => result.current.startSession());
    act(() => jest.advanceTimersByTime(2 * MINUTE));

    expect(result.current.isTimeUp).toBe(true);
  });

  it('volta ao estado inicial depois que o aviso é visto', () => {
    const { result } = renderSession();

    act(() => result.current.startSession());
    act(() => jest.advanceTimersByTime(5 * MINUTE));
    act(() => result.current.acknowledgeTimeUp());

    expect(result.current.isTimeUp).toBe(false);
  });
});
