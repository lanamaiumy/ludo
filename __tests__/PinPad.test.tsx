import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import PinPad from '../components/PinPad';

function renderPinPad(value: string, onChange = jest.fn()) {
  const screen = render(
    <PaperProvider>
      <PinPad value={value} onChange={onChange} />
    </PaperProvider>
  );
  return { ...screen, onChange };
}

describe('PinPad', () => {
  it('preenche uma bolinha para cada número digitado', () => {
    const { getAllByTestId } = renderPinPad('25');

    expect(getAllByTestId('pin-dot-filled')).toHaveLength(2);
    expect(getAllByTestId('pin-dot-empty')).toHaveLength(2);
  });

  it('acrescenta o número tocado ao valor atual', () => {
    const { getByLabelText, onChange } = renderPinPad('25');

    fireEvent.press(getByLabelText('Número 8'));

    expect(onChange).toHaveBeenCalledWith('258');
  });

  it('apaga o último número', () => {
    const { getByLabelText, onChange } = renderPinPad('258');

    fireEvent.press(getByLabelText('Apagar'));

    expect(onChange).toHaveBeenCalledWith('25');
  });

  it('ignora números depois de completar os 4 dígitos', () => {
    const { getByLabelText, onChange } = renderPinPad('2580');

    fireEvent.press(getByLabelText('Número 1'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
