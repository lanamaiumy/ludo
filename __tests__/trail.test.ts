import { EMPTY_PROGRESS, mergeProgress, nextScenarioId, resolveTrail } from '../src/helpers/trail';
import { ScenarioData } from '../src/types/Scenario';

function scenario(id: string, order: number): ScenarioData {
  return { id, name: id, icon: '', order, sounds: [] };
}

const trail = [scenario('sala', 2), scenario('quarto', 1), scenario('parque', 3)];

function statuses(progress = EMPTY_PROGRESS) {
  return resolveTrail(trail, progress).map((item) => `${item.id}:${item.status}`);
}

describe('resolveTrail', () => {
  it('libera só o primeiro cenário para uma criança nova', () => {
    expect(statuses()).toEqual(['quarto:unlocked', 'sala:locked', 'parque:locked']);
  });

  it('mostra concluídos, o atual e os bloqueados conforme o progresso', () => {
    expect(statuses({ completed: ['quarto'], unlocked: ['quarto', 'sala'] })).toEqual([
      'quarto:completed',
      'sala:unlocked',
      'parque:locked',
    ]);
  });

  it('marca como concluído o último cenário da trilha', () => {
    expect(statuses({ completed: ['quarto', 'sala', 'parque'], unlocked: ['quarto', 'sala', 'parque'] })).toEqual([
      'quarto:completed',
      'sala:completed',
      'parque:completed',
    ]);
  });
});

describe('nextScenarioId', () => {
  it('segue a ordem da trilha, e não a ordem do arquivo', () => {
    expect(nextScenarioId(trail, 'quarto')).toBe('sala');
    expect(nextScenarioId(trail, 'sala')).toBe('parque');
  });

  it('não tem próximo depois do último cenário', () => {
    expect(nextScenarioId(trail, 'parque')).toBeNull();
    expect(nextScenarioId(trail, 'inexistente')).toBeNull();
  });
});

describe('mergeProgress', () => {
  it('junta o que está no aparelho com o que está na API, sem repetir', () => {
    const merged = mergeProgress(
      { completed: ['quarto'], unlocked: ['quarto', 'sala'] },
      { completed: ['quarto', 'sala'], unlocked: ['sala', 'parque'] },
    );

    expect(merged.completed).toEqual(['quarto', 'sala']);
    expect(merged.unlocked).toEqual(['quarto', 'sala', 'parque']);
  });

  it('considera desbloqueado todo cenário concluído', () => {
    expect(mergeProgress(EMPTY_PROGRESS, { completed: ['quarto'], unlocked: [] }).unlocked).toEqual(['quarto']);
  });
});
