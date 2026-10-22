import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { configureAudioMode } from '../src/helpers/audioMode';

jest.mock('expo-av', () => ({
  Audio: { setAudioModeAsync: jest.fn(() => Promise.resolve()) },
  InterruptionModeIOS: { MixWithOthers: 0, DoNotMix: 1, DuckOthers: 2 },
  InterruptionModeAndroid: { DoNotMix: 1, DuckOthers: 2 },
}));

const setAudioModeAsync = Audio.setAudioModeAsync as jest.Mock;

describe('configureAudioMode', () => {
  beforeEach(async () => {
    setAudioModeAsync.mockClear();
    await configureAudioMode();
  });

  it('toca os sons mesmo com o iPhone no silencioso', () => {
    expect(setAudioModeAsync.mock.calls[0][0].playsInSilentModeIOS).toBe(true);
  });

  it('pausa o áudio de outros apps enquanto o exercício toca', () => {
    const mode = setAudioModeAsync.mock.calls[0][0];

    expect(mode.interruptionModeIOS).toBe(InterruptionModeIOS.DoNotMix);
    expect(mode.interruptionModeAndroid).toBe(InterruptionModeAndroid.DoNotMix);
  });

  it('toca pelo alto-falante e só com o app aberto', () => {
    const mode = setAudioModeAsync.mock.calls[0][0];

    expect(mode.playThroughEarpieceAndroid).toBe(false);
    expect(mode.staysActiveInBackground).toBe(false);
  });
});
