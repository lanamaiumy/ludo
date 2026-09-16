import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import JourneyTrail from '../components/JourneyTrail';
import { Scenario, ScenarioStatus } from '../src/types/Scenario';

function makeScenario(id: string, name: string, order: number, status: ScenarioStatus): Scenario {
  return {
    id,
    name,
    icon: '🎵',
    order,
    status,
    sounds: [{ id: `${id}-som`, name: 'Som', description: 'Um som.', file: 1 }],
  };
}

const scenarios = [
  makeScenario('rua', 'Rua', 4, 'locked'),
  makeScenario('parque', 'Parque', 3, 'unlocked'),
  makeScenario('sala', 'Sala', 2, 'completed'),
  makeScenario('quarto', 'Quarto', 1, 'completed'),
];

function renderTrail(onSelect: (scenario: Scenario) => void) {
  return render(
    <PaperProvider>
      <JourneyTrail scenarios={scenarios} onSelect={onSelect} />
    </PaperProvider>
  );
}

describe('JourneyTrail', () => {
  it('renderiza todos os cenários recebidos', () => {
    const { getByText } = renderTrail(() => {});
    expect(getByText('Rua')).toBeTruthy();
    expect(getByText('Sala')).toBeTruthy();
    expect(getByText('Quarto')).toBeTruthy();
    expect(getByText('Cenário: Parque')).toBeTruthy();
  });

  it('desenha o caminho que liga os cenários', () => {
    const { getByTestId } = renderTrail(() => {});
    expect(getByTestId('trail-path')).toBeTruthy();
  });

  it('avisa o cenário escolhido ao tocar em um nó liberado', () => {
    const onSelect = jest.fn();
    const { getByTestId } = renderTrail(onSelect);

    fireEvent.press(getByTestId('node-parque'));

    expect(onSelect).toHaveBeenCalledWith(scenarios[1]);
  });
});
