import { AccessibilityInfo } from 'react-native';
import { act, render } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import RewardStar from '../components/RewardStar';

function opacityOf(element: ReactTestInstance): number {
  const style = element.props.style;
  const flattened = Object.assign({}, ...(Array.isArray(style) ? style.flat(Infinity) : [style]));
  return Number(flattened.opacity);
}

async function renderStar(reduceMotion: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduceMotion);
  const screen = render(<RewardStar />);
  await act(async () => {});
  return screen;
}

describe('RewardStar', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('se apresenta para leitores de tela', async () => {
    const { getByLabelText } = await renderStar(false);

    expect(getByLabelText('Estrela de recompensa')).toBeTruthy();
  });

  it('surge aos poucos quando o aparelho permite animação', async () => {
    const { getByLabelText } = await renderStar(false);

    expect(opacityOf(getByLabelText('Estrela de recompensa'))).toBeLessThan(1);
  });

  it('aparece de uma vez quando o aparelho pede movimento reduzido', async () => {
    const { getByLabelText } = await renderStar(true);

    expect(opacityOf(getByLabelText('Estrela de recompensa'))).toBe(1);
  });
});
