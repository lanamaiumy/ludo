import { setAudioModeAsync } from 'expo-audio';

export function configureAudioMode(): Promise<void> {
  return setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
    allowsRecording: false,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });
}
