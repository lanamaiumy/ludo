import Slider from '@react-native-community/slider';
import { act, fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import AudioPlayer from '../components/AudioPlayer';

const mockSound = {
  setVolumeAsync: jest.fn(() => Promise.resolve()),
  playAsync: jest.fn(() => Promise.resolve()),
  pauseAsync: jest.fn(() => Promise.resolve()),
  replayAsync: jest.fn(() => Promise.resolve()),
  unloadAsync: jest.fn(() => Promise.resolve()),
  setOnPlaybackStatusUpdate: jest.fn(),
};

jest.mock('expo-av', () => ({
  Audio: { Sound: { createAsync: jest.fn(() => Promise.resolve({ sound: mockSound })) } },
}));

const MAX_VOLUME = 0.8;

async function renderLoadedPlayer() {
  const screen = render(
    <PaperProvider>
      <AudioPlayer soundFile={1} softFile={2} maxVolume={MAX_VOLUME} soundName="Buzina" soft={false} onComplete={() => {}} />
    </PaperProvider>
  );
  await act(async () => {});
  const onStatus = mockSound.setOnPlaybackStatusUpdate.mock.calls[0][0];
  act(() => onStatus({ isLoaded: true, positionMillis: 0, durationMillis: 5000, isPlaying: false, didJustFinish: false }));
  return screen;
}

function volumesSet(): number[] {
  return mockSound.setVolumeAsync.mock.calls.map((call: unknown[]) => call[0] as number);
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AudioPlayer', () => {
  it('começa com o volume baixo, e não no teto do responsável', async () => {
    const { UNSAFE_getByType } = await renderLoadedPlayer();

    expect(UNSAFE_getByType(Slider).props.value).toBeCloseTo(MAX_VOLUME * 0.2);
  });

  it('entra em silêncio e sobe aos poucos até o volume escolhido', async () => {
    const { getByLabelText } = await renderLoadedPlayer();

    await act(async () => fireEvent.press(getByLabelText('Tocar o som')));
    expect(volumesSet()[0]).toBe(0);
    expect(mockSound.playAsync).toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1500));
    const midway = volumesSet()[volumesSet().length - 1];
    act(() => jest.advanceTimersByTime(1600));
    const final = volumesSet()[volumesSet().length - 1];

    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(final);
    expect(final).toBeCloseTo(MAX_VOLUME * 0.2);
  });

  it('para a subida quando a criança mexe no volume', async () => {
    const { getByLabelText, UNSAFE_getByType } = await renderLoadedPlayer();

    await act(async () => fireEvent.press(getByLabelText('Tocar o som')));
    act(() => jest.advanceTimersByTime(500));
    await act(async () => UNSAFE_getByType(Slider).props.onValueChange(0.05));
    const callsAfterChoice = volumesSet().length;
    act(() => jest.advanceTimersByTime(3000));

    expect(volumesSet()[callsAfterChoice - 1]).toBe(0.05);
    expect(volumesSet()).toHaveLength(callsAfterChoice);
  });

  it('nunca passa do teto definido pelo responsável', async () => {
    const { UNSAFE_getByType } = await renderLoadedPlayer();

    await act(async () => UNSAFE_getByType(Slider).props.onValueChange(1));

    expect(volumesSet()[volumesSet().length - 1]).toBe(MAX_VOLUME);
  });
});
