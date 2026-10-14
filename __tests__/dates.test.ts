import { startOfWeek, toIsoDate } from '../src/helpers/dates';

describe('toIsoDate', () => {
  it('usa o dia do calendário do aparelho, com zeros à esquerda', () => {
    expect(toIsoDate(new Date(2026, 9, 5, 22, 30))).toBe('2026-10-05');
    expect(toIsoDate(new Date(2026, 0, 9, 0, 1))).toBe('2026-01-09');
  });
});

describe('startOfWeek', () => {
  it('começa a semana na segunda-feira, como no protótipo', () => {
    expect(toIsoDate(startOfWeek(new Date(2026, 9, 14)))).toBe('2026-10-12');
    expect(toIsoDate(startOfWeek(new Date(2026, 9, 12)))).toBe('2026-10-12');
  });

  it('leva o domingo para a segunda-feira anterior', () => {
    expect(toIsoDate(startOfWeek(new Date(2026, 9, 18)))).toBe('2026-10-12');
  });

  it('atravessa a virada do mês', () => {
    expect(toIsoDate(startOfWeek(new Date(2026, 10, 1)))).toBe('2026-10-26');
  });
});
