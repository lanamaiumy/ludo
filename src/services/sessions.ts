import api from './api';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';
import { getApiErrorStatus } from '../helpers/apiError';
import { startOfWeek, toIsoDate } from '../helpers/dates';

const PENDING_KEY = 'pending_sessions';

type PendingSession = {
  childId: string;
  dataSessao: string;
  concluida: boolean;
};

type ApiWeek = {
  dias: { utilizado: boolean }[];
};

function shouldRetryLater(error: unknown): boolean {
  const status = getApiErrorStatus(error);
  return status === null || status === 401 || status === 429 || status >= 500;
}

async function sendPending(queue: PendingSession[]): Promise<void> {
  const remaining = [...queue];

  while (remaining.length > 0) {
    const { childId, dataSessao, concluida } = remaining[0];
    try {
      await api.post(`/criancas/${childId}/sessoes`, { dataSessao, concluida });
    } catch (error) {
      if (shouldRetryLater(error)) {
        break;
      }
    }
    remaining.shift();
  }

  await AsyncStorageHelper.setObject<PendingSession[]>(PENDING_KEY, remaining);
}

export async function registerSession(childId: string, completed: boolean, date = new Date()): Promise<void> {
  const queue = (await AsyncStorageHelper.getObject<PendingSession[]>(PENDING_KEY)) ?? [];
  queue.push({ childId, dataSessao: toIsoDate(date), concluida: completed });
  await sendPending(queue);
}

export async function flushPendingSessions(): Promise<void> {
  const queue = (await AsyncStorageHelper.getObject<PendingSession[]>(PENDING_KEY)) ?? [];
  if (queue.length > 0) {
    await sendPending(queue);
  }
}

export async function getWeekUsage(childId: string, today = new Date()): Promise<boolean[]> {
  const response = await api.get<ApiWeek>(`/criancas/${childId}/sessoes/semana`, {
    params: { inicio: toIsoDate(startOfWeek(today)) },
  });
  return response.data.dias.map((dia) => dia.utilizado);
}
