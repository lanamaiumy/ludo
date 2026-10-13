import { toApiVolume, toChild } from '../src/services/children';

describe('conversão entre a API e o app', () => {
  it('traduz a criança da API para o formato do app', () => {
    const child = toChild({
      id: 'abc',
      nome: 'Theo',
      configuracao: { volumeMaximo: 50, tempoSessaoMinutos: 5 },
    });

    expect(child).toEqual({ id: 'abc', name: 'Theo', maxVolume: 0.5, sessionMinutes: 5 });
  });

  it('converte o volume do controle deslizante para a escala da API', () => {
    expect(toApiVolume(0.5)).toBe(50);
    expect(toApiVolume(0.334)).toBe(33);
    expect(toApiVolume(1)).toBe(100);
  });

  it('mantém o volume dentro do intervalo aceito pela API', () => {
    expect(toApiVolume(0)).toBe(1);
    expect(toApiVolume(1.2)).toBe(100);
  });
});
