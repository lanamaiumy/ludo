import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import ScenarioNode from '../components/ScenarioNode';
import { Scenario, ScenarioStatus } from '../src/types/Scenario';

function makeScenario(status: ScenarioStatus): Scenario {
  return {
    id: 'quarto',
    name: 'Quarto',
    icon: '🛏',
    order: 1,
    status,
    sounds: [{ id: 'alarme', name: 'Despertador', description: 'Um som.', file: 1 }],
  };
}

function renderNode(status: ScenarioStatus) {
  return render(
    <PaperProvider>
      <ScenarioNode scenario={makeScenario(status)} onPress={() => {}} />
    </PaperProvider>
  );
}

describe('ScenarioNode', () => {
  it('renderiza o nome do cenário', () => {
    const { getByText } = renderNode('completed');
    expect(getByText('Quarto')).toBeTruthy();
  });

  it('quando é o cenário atual, destaca o nome na etiqueta', () => {
    const { getByText } = renderNode('unlocked');
    expect(getByText('Cenário: Quarto')).toBeTruthy();
  });

  it('quando bloqueado, mostra o badge de cadeado', () => {
    const { getByTestId } = renderNode('locked');
    expect(getByTestId('badge-locked')).toBeTruthy();
  });

  it('quando concluído, mostra o badge de check', () => {
    const { getByTestId } = renderNode('completed');
    expect(getByTestId('badge-completed')).toBeTruthy();
  });
});
