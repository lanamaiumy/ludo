import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import WeekUsage from '../components/WeekUsage';

function renderWeek(usage: boolean[]) {
  return render(
    <PaperProvider>
      <WeekUsage usage={usage} />
    </PaperProvider>
  );
}

describe('WeekUsage', () => {
  it('renderiza o rótulo de domingo', () => {
    const { getByText } = renderWeek([false, false, false, false, false, false, false]);
    expect(getByText('D')).toBeTruthy();
  });

  it('renderiza os três dias com inicial S', () => {
    const { getAllByText } = renderWeek([true, false, false, false, true, true, false]);
    expect(getAllByText('S').length).toBe(3);
  });
});
