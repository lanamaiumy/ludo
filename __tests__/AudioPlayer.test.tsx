import Slider from '@react-native-community/slider';
import { act, fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import AudioPlayer from '../components/AudioPlayer';

const mockVolumes: number[] = [];
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(() => Promise.resolve()),
  set volume(value: number) {
    mockVolumes.push(value);
  },
  get volume() {
    return mockVolumes[mockVolumes.length - 1] ?? 1;
  },
};
let mockStatus = { isLoaded: true, playing: false, currentTime: 0, duration: 120, didJustFinish: false };

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => mockStatus,
}));

const MAX_VOLUME = 0.8;

function renderPlayer(onComplete = jest.fn()) {
  const tree = () => (
    <PaperProvider>
      <AudioPlayer soundFile={1} softFile={2} maxVolume={MAX_VOLUME} soundName="Buzina" soft={false} onComplete={onComplete} />
    </PaperProvider>
  );
  const screen = render(tree());
  return { ...screen, rerenderPlayer: () => screen.rerender(tree()), onComplete };
}

function lastVolume(): number {
  return mockVolumes[mockVolumes.length - 1];
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockVolumes.length = 0;
  mockStatus = { isLoaded: true, playing: false, currentTime: 0, duration: 120, didJustFinish: false };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AudioPlayer', () => {
  it('começa com o volume baixo, e não no teto do responsável', () => {
    const { UNSAFE_getByType } = renderPlayer();

    expect(UNSAFE_getByType(Slider).props.value).toBeCloseTo(MAX_VOLUME * 0.2);
    expect(lastVolume()).toBeCloseTo(MAX_VOLUME * 0.2);
  });

  it('entra em silêncio e sobe aos poucos até o volume escolhido', async () => {
    const { getByLabelText } = renderPlayer();
    mockVolumes.length = 0;

    await act(async () => fireEvent.press(getByLabelText('Tocar o som')));
    expect(mockVolumes[0]).toBe(0);
    expect(mockPlayer.play).toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1500));
    const midway = lastVolume();
    act(() => jest.advanceTimersByTime(1600));

    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(lastVolume());
    expect(lastVolume()).toBeCloseTo(MAX_VOLUME * 0.2);
  });

  it('para a subida quando a criança mexe no volume', async () => {
    const { getByLabelText, UNSAFE_getByType } = renderPlayer();

    await act(async () => fireEvent.press(getByLabelText('Tocar o som')));
    act(() => jest.advanceTimersByTime(500));
    act(() => UNSAFE_getByType(Slider).props.onValueChange(0.05));
    const setsAfterChoice = mockVolumes.length;
    act(() => jest.advanceTimersByTime(3000));

    expect(lastVolume()).toBe(0.05);
    expect(mockVolumes).toHaveLength(setsAfterChoice);
  });

  it('nunca passa do teto definido pelo responsável', () => {
    const { UNSAFE_getByType } = renderPlayer();

    act(() => UNSAFE_getByType(Slider).props.onValueChange(1));

    expect(lastVolume()).toBe(MAX_VOLUME);
  });

  it('volta ao início quando a criança toca de novo um som que já terminou', async () => {
    mockStatus = { ...mockStatus, currentTime: 120 };
    const { getByLabelText } = renderPlayer();

    await act(async () => fireEvent.press(getByLabelText('Tocar o som')));

    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  it('avisa quando o som chega ao fim', () => {
    const { rerenderPlayer, onComplete } = renderPlayer();

    mockStatus = { ...mockStatus, currentTime: 120, didJustFinish: true };
    rerenderPlayer();

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
