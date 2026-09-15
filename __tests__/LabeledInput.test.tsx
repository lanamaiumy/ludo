import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import LabeledInput from '../components/LabeledInput';

function renderInput(value: string) {
  return render(
    <PaperProvider>
      <LabeledInput label="Email" value={value} onChangeText={() => {}} placeholder="exemplo" />
    </PaperProvider>
  );
}

describe('LabeledInput', () => {
  it('mostra o rótulo', () => {
    const { getByText } = renderInput('');
    expect(getByText('Email')).toBeTruthy();
  });

  it('mostra o valor digitado', () => {
    const { getByDisplayValue } = renderInput('ana@ludo.com');
    expect(getByDisplayValue('ana@ludo.com')).toBeTruthy();
  });
});
