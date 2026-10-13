import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorMessage, getApiErrorStatus } from '../src/helpers/apiError';

function apiError(status: number, data: unknown) {
  const headers = new AxiosHeaders();
  return new AxiosError('falha', 'ERR', { headers }, null, {
    status,
    data,
    statusText: '',
    headers,
    config: { headers },
  });
}

describe('getApiErrorMessage', () => {
  it('prefere a mensagem do primeiro campo inválido', () => {
    const error = apiError(400, {
      mensagem: 'Dados inválidos',
      erros: { senha: ['A senha precisa ter pelo menos 8 caracteres'] },
    });

    expect(getApiErrorMessage(error, 'padrão')).toBe('A senha precisa ter pelo menos 8 caracteres');
  });

  it('usa a mensagem geral da API quando não há erro de campo', () => {
    const error = apiError(409, { mensagem: 'Este e-mail já está cadastrado' });

    expect(getApiErrorMessage(error, 'padrão')).toBe('Este e-mail já está cadastrado');
  });

  it('avisa sobre a conexão quando o servidor não responde', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');

    expect(getApiErrorMessage(error, 'padrão')).toBe('Não foi possível conectar ao servidor. Verifique a conexão.');
  });

  it('usa a mensagem padrão para erros que não vieram da API', () => {
    expect(getApiErrorMessage(new Error('qualquer'), 'padrão')).toBe('padrão');
  });
});

describe('getApiErrorStatus', () => {
  it('devolve o status HTTP da resposta', () => {
    expect(getApiErrorStatus(apiError(403, {}))).toBe(403);
    expect(getApiErrorStatus(new Error('qualquer'))).toBeNull();
  });
});
