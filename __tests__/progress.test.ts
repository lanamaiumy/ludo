import api from '../src/services/api';
import { getProgress, sendProgress } from '../src/services/progress';

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}));

const post = api.post as jest.Mock;
const get = api.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  post.mockResolvedValue({ data: {} });
});

describe('getProgress', () => {
  it('separa os cenários desbloqueados e os concluídos', async () => {
    get.mockResolvedValue({
      data: [
        { cenario: 'quarto', desbloqueado: true, concluido: true },
        { cenario: 'sala', desbloqueado: true, concluido: false },
      ],
    });

    const progress = await getProgress('theo');

    expect(get).toHaveBeenCalledWith('/criancas/theo/progresso');
    expect(progress).toEqual({ unlocked: ['quarto', 'sala'], completed: ['quarto'] });
  });
});

describe('sendProgress', () => {
  it('conclui e desbloqueia sem repetir o cenário concluído', async () => {
    await sendProgress('theo', { completed: ['quarto'], unlocked: ['quarto', 'sala'] });

    expect(post.mock.calls.map((call) => call[0])).toEqual([
      '/criancas/theo/progresso/quarto/conclusao',
      '/criancas/theo/progresso/sala/desbloqueio',
    ]);
  });

  it('envia só o que a API ainda não tem', async () => {
    await sendProgress(
      'theo',
      { completed: ['quarto', 'sala'], unlocked: ['quarto', 'sala', 'parque'] },
      { completed: ['quarto'], unlocked: ['quarto', 'sala'] },
    );

    expect(post.mock.calls.map((call) => call[0])).toEqual([
      '/criancas/theo/progresso/sala/conclusao',
      '/criancas/theo/progresso/parque/desbloqueio',
    ]);
  });
});
