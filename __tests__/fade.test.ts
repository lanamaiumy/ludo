import { fadeInSteps } from '../src/helpers/fade';

describe('fadeInSteps', () => {
  it('divide a subida em passos do tamanho pedido', () => {
    expect(fadeInSteps(0.5, 3000, 100)).toHaveLength(30);
  });

  it('termina exatamente no volume escolhido, sem passar dele', () => {
    const steps = fadeInSteps(0.5, 3000, 100);

    expect(steps[steps.length - 1]).toBe(0.5);
    expect(Math.max(...steps)).toBe(0.5);
  });

  it('sobe sempre, começando bem baixo', () => {
    const steps = fadeInSteps(0.8, 3000, 100);

    expect(steps[0]).toBeLessThan(0.01);
    steps.slice(1).forEach((value, index) => expect(value).toBeGreaterThan(steps[index]));
  });

  it('sobe devagar no começo, como pede a dessensibilização', () => {
    const steps = fadeInSteps(1, 3000, 100);

    expect(steps[14]).toBeLessThan(0.3);
  });
});
