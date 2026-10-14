import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, AxiosHeaders } from 'axios';
import api from '../src/services/api';
import { flushPendingSessions, getWeekUsage, registerSession } from '../src/services/sessions';

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}));

const post = api.post as jest.Mock;
const get = api.get as jest.Mock;

function httpError(status: number) {
  const headers = new AxiosHeaders();
  return new AxiosError('falha', 'ERR', { headers }, null, {
    status,
    data: {},
    statusText: '',
    headers,
    config: { headers },
  });
}

async function pending() {
  return JSON.parse((await AsyncStorage.getItem('pending_sessions')) ?? '[]');
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('registerSession', () => {
  it('envia a sessão com o dia do aparelho', async () => {
    post.mockResolvedValue({ data: {} });

    await registerSession('theo', true, new Date(2026, 9, 14, 21, 45));

    expect(post).toHaveBeenCalledWith('/criancas/theo/sessoes', { dataSessao: '2026-10-14', concluida: true });
    expect(await pending()).toEqual([]);
  });

  it('guarda a sessão no aparelho quando não há conexão', async () => {
    post.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));

    await registerSession('theo', true, new Date(2026, 9, 14));

    expect(await pending()).toEqual([{ childId: 'theo', dataSessao: '2026-10-14', concluida: true }]);
  });

  it('envia as sessões pendentes antes da nova, na ordem', async () => {
    post.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'));
    await registerSession('theo', true, new Date(2026, 9, 13));
    post.mockResolvedValue({ data: {} });

    await registerSession('theo', false, new Date(2026, 9, 14));

    expect(post.mock.calls.slice(1).map((call) => call[1].dataSessao)).toEqual(['2026-10-13', '2026-10-14']);
    expect(await pending()).toEqual([]);
  });

  it('descarta a sessão que a API recusa, como de criança excluída', async () => {
    post.mockRejectedValue(httpError(404));

    await registerSession('excluida', true, new Date(2026, 9, 14));

    expect(await pending()).toEqual([]);
  });

  it('mantém a sessão para depois quando o login venceu', async () => {
    post.mockRejectedValue(httpError(401));

    await registerSession('theo', true, new Date(2026, 9, 14));

    expect(await pending()).toHaveLength(1);
  });
});

describe('flushPendingSessions', () => {
  it('não chama a API quando não há nada pendente', async () => {
    await flushPendingSessions();

    expect(post).not.toHaveBeenCalled();
  });
});

describe('getWeekUsage', () => {
  it('pede a semana a partir da segunda-feira e devolve os dias usados', async () => {
    get.mockResolvedValue({
      data: { dias: [true, false, true, false, false, false, false].map((utilizado) => ({ utilizado })) },
    });

    const usage = await getWeekUsage('theo', new Date(2026, 9, 14));

    expect(get).toHaveBeenCalledWith('/criancas/theo/sessoes/semana', { params: { inicio: '2026-10-12' } });
    expect(usage).toEqual([true, false, true, false, false, false, false]);
  });
});
