import { scenarios } from '../src/data/scenarios';

describe('cenários da trilha', () => {
  it('tem os seis cenários, do mais controlado ao mais imprevisível', () => {
    const ordered = [...scenarios].sort((a, b) => a.order - b.order).map((scenario) => scenario.id);

    expect(ordered).toEqual(['quarto', 'sala', 'cozinha', 'parque', 'escola', 'rua']);
  });

  it('numera a ordem de 1 a 6, sem repetir', () => {
    expect(scenarios.map((scenario) => scenario.order).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('usa identificadores aceitos pela API de progresso', () => {
    for (const scenario of scenarios) {
      expect(scenario.id).toMatch(/^[a-z0-9-]{1,50}$/);
    }
  });

  it('tem para cada som a versão normal, a suave e a explicação para a criança', () => {
    for (const scenario of scenarios) {
      expect(scenario.sounds.length).toBeGreaterThan(0);
      for (const sound of scenario.sounds) {
        expect(sound.file).toBeTruthy();
        expect(sound.softFile).toBeTruthy();
        expect(sound.description.length).toBeGreaterThan(10);
      }
    }
  });
});
