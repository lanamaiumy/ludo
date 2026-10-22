import { setAudioModeAsync } from 'expo-audio';
import { configureAudioMode } from '../src/helpers/audioMode';

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

const setAudioMode = setAudioModeAsync as jest.Mock;

describe('configureAudioMode', () => {
  beforeEach(async () => {
    setAudioMode.mockClear();
    await configureAudioMode();
  });

  it('toca os sons mesmo com o iPhone no silencioso', () => {
    expect(setAudioMode.mock.calls[0][0].playsInSilentMode).toBe(true);
  });

  it('pausa o áudio de outros apps enquanto o exercício toca', () => {
    expect(setAudioMode.mock.calls[0][0].interruptionMode).toBe('doNotMix');
  });

  it('toca pelo alto-falante, só com o app aberto e sem gravar', () => {
    const mode = setAudioMode.mock.calls[0][0];

    expect(mode.shouldRouteThroughEarpiece).toBe(false);
    expect(mode.shouldPlayInBackground).toBe(false);
    expect(mode.allowsRecording).toBe(false);
  });
});
